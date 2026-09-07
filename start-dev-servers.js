#!/usr/bin/env node
/**
 * Start Development Servers
 * Starts both Vite and API dev server in separate processes
 * 
 * Usage: npm run dev:start (add to package.json if needed)
 * Or: node start-dev-servers.js
 */

import { spawn } from 'child_process';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`
╔════════════════════════════════════════════════════════════╗
║  Starting PAZ Thriving Tribe Development Environment       ║
╚════════════════════════════════════════════════════════════╝
`);

// Start API dev server
console.log('▶ Starting API Development Server (port 3001)...');
const apiServer = spawn('node', [path.join(__dirname, 'api-dev-server.js')], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: false
});

// Wait a moment for API server to start, then start Vite
setTimeout(() => {
  console.log('\n▶ Starting Vite Development Server (port 5173)...\n');
  const viteCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const viteServer = spawn(viteCommand, ['run', 'dev:frontend'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: process.platform === 'win32'
  });

  viteServer.on('error', (error) => {
    console.error('Failed to start Vite server:', error);
  });
}, 1000);

apiServer.on('error', (error) => {
  console.error('Failed to start API server:', error);
});

apiServer.on('exit', (code, signal) => {
  if (code !== 0)
    console.error(`API server stopped unexpectedly (code ${code ?? 'unknown'}, signal ${signal || 'none'}).`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down servers...');
  apiServer.kill();
  process.exit(0);
});
