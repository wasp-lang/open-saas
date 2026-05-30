/**
 * Post-install patches for @moneydevkit packages:
 *
 * 1. Fixes extensionless relative ESM imports (Node.js ESM requires .js extensions)
 * 2. Patches react-query v5 API usage to be v4-compatible (Wasp ships v4)
 *
 * Run via postinstall: "postinstall": "node scripts/fix-mdk-esm.js"
 */
import { readdir, readFile, writeFile, stat } from "fs/promises";
import { join } from "path";

const MDK_PACKAGES = [
  join(process.cwd(), "node_modules", "@moneydevkit", "core", "dist"),
  join(process.cwd(), "node_modules", "@moneydevkit", "replit", "dist"),
];

// --- Fix 1: Extensionless ESM imports ---

const RELATIVE_IMPORT_RE =
  /from\s+['"](\.\.?\/[^'"]+)['"]/g;

function needsExtension(importPath) {
  return !/\.\w+$/.test(importPath);
}

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)));
    } else if (entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fixFile(filePath) {
  const content = await readFile(filePath, "utf8");
  let changed = false;

  const fixed = content.replace(RELATIVE_IMPORT_RE, (match, importPath) => {
    if (needsExtension(importPath)) {
      changed = true;
      return match.replace(importPath, importPath + ".js");
    }
    return match;
  });

  if (changed) {
    await writeFile(filePath, fixed, "utf8");
    return true;
  }
  return false;
}

// --- Fix 2: react-query v5 -> v4 compatibility ---
// MDK uses v5 refetchInterval signature: ({ state: { data } }) => ...
// Wasp ships v4 where refetchInterval receives: (data, query) => ...
// Patch to handle both: (queryOrState) => { const data = queryOrState?.state?.data ?? queryOrState; }

async function patchReactQueryCompat() {
  const checkoutFile = join(
    process.cwd(),
    "node_modules",
    "@moneydevkit",
    "core",
    "dist",
    "components",
    "Checkout.js",
  );

  try {
    await stat(checkoutFile);
  } catch {
    return;
  }

  let content = await readFile(checkoutFile, "utf8");

  // The v5 pattern: refetchInterval: ({ state: { data } }) => {
  const v5Pattern = `refetchInterval: ({ state: { data } }) => {`;
  if (!content.includes(v5Pattern)) {
    // Already patched or different version
    return;
  }

  // Replace with v4-compatible version that also works with v5
  const v4Compat = `refetchInterval: (_rqArg) => { const data = _rqArg?.state?.data ?? _rqArg;`;
  content = content.replace(v5Pattern, v4Compat);

  await writeFile(checkoutFile, content, "utf8");
  console.log("fix-mdk-esm: patched Checkout.js for react-query v4 compat");
}

// --- Main ---

async function main() {
  // Fix extensionless imports
  for (const distDir of MDK_PACKAGES) {
    try {
      await stat(distDir);
    } catch {
      continue;
    }

    const files = await getFiles(distDir);
    let fixedCount = 0;

    for (const file of files) {
      if (await fixFile(file)) {
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      const pkgName = distDir.includes("/core/") ? "@moneydevkit/core" : "@moneydevkit/replit";
      console.log(`fix-mdk-esm: patched ${fixedCount} files in ${pkgName}`);
    }
  }

  // Fix react-query v5 -> v4 compat
  await patchReactQueryCompat();
}

main().catch(console.error);
