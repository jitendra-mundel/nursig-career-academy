#!/usr/bin/env node

/**
 * One-Command Startup Script
 * Usage: node start.js
 * 
 * This script starts both backend and frontend automatically
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`
╔════════════════════════════════════════╗
║  TheNoecet Notes - Auto Startup       ║
╠════════════════════════════════════════╣
║  Starting backend and frontend...     ║
╚════════════════════════════════════════╝
`);

// Start Backend (Mock Server)
console.log('\n📦 Starting Backend Mock Server...');
const backend = spawn('node', ['mockServer.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
});

// Wait 2 seconds then start frontend
setTimeout(() => {
  console.log('\n📦 Starting Frontend Dev Server...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true,
  });

  frontend.on('close', (code) => {
    console.log('Frontend exited with code:', code);
  });
}, 2000);

backend.on('close', (code) => {
  console.log('Backend exited with code:', code);
});

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down...');
  backend.kill();
  process.exit(0);
});
