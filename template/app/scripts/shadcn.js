#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// Default ShadCN version for Wasp + Tailwind 3
const DEFAULT_SHADCN_VERSION = '2.3.0';
const COMPONENTS_DIR = 'src/shadcn/components/ui';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const utilsImportRegex = /import\s+\{\s*cn\s*\}\s+from\s+["']src\/lib\/utils["']/;
    if (utilsImportRegex.test(content)) {
      content = content.replace(utilsImportRegex, "import { cn } from '../../lib/utils'");
      modified = true;
      log(`✅ Fixed utils import in ${path.basename(filePath)}`);
    }

    const srcImportRegex = /import\s+.*\s+from\s+["']src\/([^"']+)["']/g;
    const matches = content.match(srcImportRegex);
    if (matches) {
      matches.forEach(match => {
        const relativePath = match.replace(/from\s+["']src\//, "from '../../../");
        content = content.replace(match, relativePath);
        modified = true;
      });
      log(`✅ Fixed src/ imports in ${path.basename(filePath)}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }

    return modified;
  } catch (error) {
    log(`❌ Error fixing imports in ${filePath}: ${error.message}`, 'error');
    return false;
  }
}

function fixImportsInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);
  let fixedCount = 0;

  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(dirPath, file);
      if (fixImportsInFile(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

function runShadcnCommand(componentName, version) {
  try {
    log(`🚀 Installing ShadCN ${componentName} component (version ${version})...`);
    
    const command = `npx shadcn@${version} add ${componentName}`;
    execSync(command, { stdio: 'inherit' });
    
    log(`✅ Successfully installed ${componentName} component!`);
    
    const componentFile = path.join(COMPONENTS_DIR, `${componentName}.tsx`);
    if (fs.existsSync(componentFile)) {
      if (fixImportsInFile(componentFile)) {
        log(`✅ Fixed imports in ${componentName}.tsx`);
      }
    }
    
    const fixedCount = fixImportsInDirectory(COMPONENTS_DIR);
    if (fixedCount > 0) {
      log(`✅ Fixed imports in ${fixedCount} additional files`);
    }
    
    log(`🎉 ${componentName} component is ready to use!`, 'success');
    log(`📝 Import it like this: import { ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} } from '../components/ui/${componentName}'`);
    
  } catch (error) {
    log(`❌ Failed to install ${componentName} component: ${error.message}`, 'error');
    process.exit(1);
  }
}

function showHelp() {
  log(`
🔧 ShadCN Component Installer for Open SaaS Template

Usage:
  npm run shadcn add <component-name> [--version <shadcn-version>]
  npm run shadcn add button
  npm run shadcn add card input dialog
  npm run shadcn add button --version 2.3.0

Options:
  --version, -v   Specify a ShadCN version (default: ${DEFAULT_SHADCN_VERSION})

Examples:
  npm run shadcn add button
  npm run shadcn add card
  npm run shadcn add input
  npm run shadcn add dialog --version 2.4.1

Available components: https://ui.shadcn.com/docs/components

This script will:
1. Install the component using ShadCN (default: v${DEFAULT_SHADCN_VERSION})
2. Automatically fix import paths for Wasp compatibility
3. Show you how to import and use the component
`, 'info');
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

let version = DEFAULT_SHADCN_VERSION;
let componentName = null;

if (args[0] === 'add' && args[1]) {
  componentName = args[1];
  const versionFlagIndex = args.findIndex(arg => arg === '--version' || arg === '-v');
  if (versionFlagIndex !== -1 && args[versionFlagIndex + 1]) {
    version = args[versionFlagIndex + 1];
  }
  runShadcnCommand(componentName, version);
} else {
  log('❌ Invalid command. Use "add <component-name>" or "--help" for usage.', 'error');
  process.exit(1);
} 