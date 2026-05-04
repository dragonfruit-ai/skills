#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { execSync } = require("child_process");
const { createRequire } = require("module");

const EXPIRY_MARGIN_MS = 4 * 60 * 1000;

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("-") && !args.store) {
      args.store = arg;
    } else if (arg === "--store" || arg === "-s") {
      args.store = argv[++i];
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function normalizeStore(store) {
  return String(store || "").trim().toLowerCase();
}

async function resolveConfClass() {
  try {
    const mod = await import("conf");
    return mod.default;
  } catch (_) {
    // Fall through and try to resolve via the installed Shopify package tree.
  }

  let globalRoot = "";
  try {
    const shopifyBin = fs.realpathSync(execSync("command -v shopify", { encoding: "utf8" }).trim());
    globalRoot = path.resolve(shopifyBin, "..", "..", "..", "..");
  } catch (_) {
    try {
      globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    } catch (_) {
      globalRoot = "";
    }
  }

  if (!globalRoot) {
    throw new Error(
      "Could not locate the global Shopify installation. Make sure Shopify CLI is installed.",
    );
  }

  const candidatePackages = [
    path.join(globalRoot, "@shopify/theme/package.json"),
    path.join(globalRoot, "@shopify/cli/package.json"),
  ];

  for (const packageJsonPath of candidatePackages) {
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    try {
      const packageRequire = createRequire(packageJsonPath);
      const confModulePath = packageRequire.resolve("conf");
      const mod = await import(pathToFileURL(confModulePath).href);
      return mod.default;
    } catch (_) {
      // Try the next candidate.
    }
  }

  throw new Error(
    "Could not resolve the 'conf' package. Make sure Shopify CLI is installed.",
  );
}

async function openShopifyStoreStorage() {
  const Conf = await resolveConfClass();
  return new Conf({ projectName: "shopify-cli-store" });
}

function findSessionBuckets(root, currentPath = []) {
  const results = [];
  if (!root || typeof root !== "object") {
    return results;
  }

  if (
    typeof root.currentUserId === "string" &&
    root.sessionsByUserId &&
    typeof root.sessionsByUserId === "object" &&
    !Array.isArray(root.sessionsByUserId)
  ) {
    results.push({ bucket: root, path: currentPath });
  }

  for (const [key, value] of Object.entries(root)) {
    if (value && typeof value === "object") {
      results.push(...findSessionBuckets(value, currentPath.concat(key)));
    }
  }

  return results;
}

function findBucketForStore(config, normalizedStore) {
  const buckets = findSessionBuckets(config);
  for (const entry of buckets) {
    const sessions = Object.values(entry.bucket.sessionsByUserId || {});
    if (
      sessions.some(
        (session) =>
          normalizeStore(session && session.store) === normalizedStore,
      )
    ) {
      return entry;
    }
  }
  return undefined;
}

function getCurrentSession(bucket) {
  const currentSession = bucket.sessionsByUserId[bucket.currentUserId];
  if (currentSession) {
    return currentSession;
  }

  const sessions = Object.values(bucket.sessionsByUserId || {});
  return sessions.length > 0 ? sessions[0] : undefined;
}

function isExpired(session) {
  if (!session || !session.expiresAt) {
    return false;
  }
  const expiresAtMs = new Date(session.expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return true;
  }
  return expiresAtMs - EXPIRY_MARGIN_MS < Date.now();
}

async function refreshSession(session) {
  if (!session.refreshToken) {
    throw new Error(`No refresh token stored for ${session.store}`);
  }
  if (!session.clientId) {
    throw new Error(`No clientId stored for ${session.store}`);
  }

  const response = await fetch(`https://${session.store}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: session.clientId,
      grant_type: "refresh_token",
      refresh_token: session.refreshToken,
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Token refresh failed for ${session.store} (HTTP ${response.status}): ${bodyText.slice(0, 300)}`,
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch (error) {
    throw new Error(`Shopify returned invalid JSON while refreshing token for ${session.store}`);
  }

  if (!parsed.access_token) {
    throw new Error(`Shopify refresh response did not include access_token for ${session.store}`);
  }

  const now = Date.now();
  return {
    ...session,
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token || session.refreshToken,
    expiresAt: parsed.expires_in
      ? new Date(now + parsed.expires_in * 1000).toISOString()
      : session.expiresAt,
    refreshTokenExpiresAt: parsed.refresh_token_expires_in
      ? new Date(now + parsed.refresh_token_expires_in * 1000).toISOString()
      : session.refreshTokenExpiresAt,
    acquiredAt: new Date(now).toISOString(),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.store) {
    throw new Error("Store domain is required");
  }

  const normalizedStore = normalizeStore(args.store);
  const storage = await openShopifyStoreStorage();
  const config = storage.store || {};
  const bucketEntry = findBucketForStore(config, normalizedStore);
  if (!bucketEntry) {
    throw new Error(`No stored Shopify CLI session found for ${args.store}`);
  }

  let session = getCurrentSession(bucketEntry.bucket);
  if (!session) {
    throw new Error(`Stored Shopify CLI session bucket for ${args.store} is empty`);
  }

  if (normalizeStore(session.store) !== normalizedStore) {
    const sessions = Object.values(bucketEntry.bucket.sessionsByUserId || {});
    session = sessions.find(
      (candidate) => normalizeStore(candidate && candidate.store) === normalizedStore,
    );
    if (!session) {
      throw new Error(`No matching session found for ${args.store}`);
    }
  }

  let refreshed = false;
  if (isExpired(session)) {
    const updatedSession = await refreshSession(session);
    bucketEntry.bucket.sessionsByUserId[updatedSession.userId] = updatedSession;
    bucketEntry.bucket.currentUserId = updatedSession.userId;
    storage.store = config;
    session = updatedSession;
    refreshed = true;
  }

  process.stdout.write(`${session.accessToken}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
