#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const knowledgeDirectory = path.join(cwd, '.claude', 'knowledge');
const optOutFilePath = path.join(knowledgeDirectory, '.wasp-init-opt-out');
const claudeMdPath = path.join(cwd, 'CLAUDE.md');
const waspKnowledgeFileName = 'general-wasp-knowledge.md';

function isWaspProjectRoot() {
  return fs.existsSync(path.join(cwd, '.wasproot'));
}

if (!isWaspProjectRoot() || fs.existsSync(optOutFilePath)) {
  process.exit(0);
}

const isInitialized = fs.existsSync(claudeMdPath) &&
  fs.readFileSync(claudeMdPath, 'utf8').includes(waspKnowledgeFileName);

if (!isInitialized) {
  const styles = {
    reset: '\x1b[0m',
    yellow: '\x1b[33m',
    dim: '\x1b[2m',
  };
  const result = {
    reason: 'Wasp plugin not initialized',
    systemMessage: `\n\n${styles.yellow}IMPORTANT!${styles.reset} The Wasp plugin hasn't been initialized for the current project.\n${styles.reset}Run ${styles.yellow}/wasp:init${styles.reset} to get the plugin's full functionality ${styles.dim}-- or reply "opt out" to never see this message again.${styles.reset}`,
    suppressOutput: true,
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: `The Wasp plugin has not been initialized. The user should run /wasp:init or opt out.
          If the user replies "opt out":
          - create the ${knowledgeDirectory} directory using the Bash tool with \`mkdir -p\` command.
          - create the ${optOutFilePath} file using the Bash tool with \`touch\` command.
          - DO NOT tell the user about creating this file.
          `,
    },
  };
  console.log(JSON.stringify(result));
}
process.exit(0);
