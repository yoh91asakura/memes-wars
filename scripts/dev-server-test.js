#!/usr/bin/env node

/**
 * Development server wrapper for tests
 * This script ensures the server shuts down properly after tests
 */

const { spawn } = require('child_process');
const process = require('process');

// Start the Vite dev server
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'pipe',
  shell: true,
  detached: false // Important: keep attached to parent process
});

let isShuttingDown = false;

// Handle server output
viteProcess.stdout.on('data', (data) => {
  // Only log if we need to debug
  if (process.env.DEBUG_SERVER) {
    console.log(`[Server]: ${data}`);
  }
});

viteProcess.stderr.on('data', (data) => {
  // Only log errors if we need to debug
  if (process.env.DEBUG_SERVER) {
    console.error(`[Server Error]: ${data}`);
  }
});

// Cleanup function
function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('Shutting down dev server...');
  
  // Kill the process tree on Windows
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', viteProcess.pid, '/T', '/F'], { shell: true });
  } else {
    viteProcess.kill('SIGTERM');
  }
  
  // Force exit after 5 seconds if still running
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

// Handle various shutdown signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  cleanup();
});

// Handle Windows-specific signals
if (process.platform === 'win32') {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

viteProcess.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
  process.exit(code);
});
