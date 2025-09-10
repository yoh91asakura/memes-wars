#!/usr/bin/env node

/**
 * Cross-platform script runner for bash/batch scripts
 * Automatically detects platform and runs appropriate script format
 * Usage: node run-script.js <script-name> [args...]
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPT_NAME = process.argv[2];
const SCRIPT_ARGS = process.argv.slice(3);

if (!SCRIPT_NAME) {
  console.error('Usage: node run-script.js <script-name> [args...]');
  console.error('Available scripts:');
  console.error('  create-new-feature <description>');
  console.error('  setup-plan');
  console.error('  check-task-prerequisites');
  console.error('  update-agent-context <target>');
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const scriptsDir = __dirname;

// Try to find the appropriate script file
const scriptExtensions = isWindows ? ['.bat', '.cmd', '.sh'] : ['.sh', '.bat', '.cmd'];
let scriptPath = null;
let useShell = false;

for (const ext of scriptExtensions) {
  const testPath = path.join(scriptsDir, `${SCRIPT_NAME}${ext}`);
  if (fs.existsSync(testPath)) {
    scriptPath = testPath;
    useShell = ext === '.sh' && isWindows; // Use shell if running .sh on Windows
    break;
  }
}

if (!scriptPath) {
  console.error(`Script not found: ${SCRIPT_NAME}`);
  console.error(`Looked for: ${scriptExtensions.map(ext => SCRIPT_NAME + ext).join(', ')}`);
  process.exit(1);
}

// Determine how to execute the script
let command, args, options;

if (isWindows && scriptPath.endsWith('.sh')) {
  // On Windows, try to run .sh files with Git Bash if available
  const gitBashPaths = [
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
    path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe')
  ];
  
  let bashPath = null;
  for (const testPath of gitBashPaths) {
    if (fs.existsSync(testPath)) {
      bashPath = testPath;
      break;
    }
  }
  
  if (bashPath) {
    command = bashPath;
    args = [scriptPath, ...SCRIPT_ARGS];
    options = { stdio: 'inherit', cwd: process.cwd() };
  } else {
    console.error('Git Bash not found. Please install Git for Windows or use the .bat version.');
    process.exit(1);
  }
} else if (scriptPath.endsWith('.bat') || scriptPath.endsWith('.cmd')) {
  // Windows batch file
  command = scriptPath;
  args = SCRIPT_ARGS;
  options = { stdio: 'inherit', shell: true, cwd: process.cwd() };
} else {
  // Unix shell script
  command = scriptPath;
  args = SCRIPT_ARGS;
  options = { stdio: 'inherit', cwd: process.cwd() };
}

console.log(`Running: ${command} ${args.join(' ')}`);

const child = spawn(command, args, options);

child.on('error', (error) => {
  console.error(`Failed to start script: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});