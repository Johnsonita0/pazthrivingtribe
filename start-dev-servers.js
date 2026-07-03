#!/usr/bin/env node
/**
 * Start Development Servers
 * Starts both Vite and API dev server in separate processes
 * 
 * Usage: npm run dev:start (add to package.json if needed)
 * Or: node start-dev-servers.js
 */

import { spawn } from 'child_process';
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
  shell: true
});

// Wait a moment for API server to start, then start Vite
setTimeout(() => {
  console.log('\n▶ Starting Vite Development Server (port 5173)...\n');
  const viteServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  viteServer.on('error', (error) => {
    console.error('Failed to start Vite server:', error);
  });
}, 1000);

apiServer.on('error', (error) => {
  console.error('Failed to start API server:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down servers...');
  apiServer.kill();
  process.exit(0);
});
