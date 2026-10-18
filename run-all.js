import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('----------------------------------------------------');
console.log('🚀 Starting GT Mining Full-Stack (Server + Client)...');
console.log('----------------------------------------------------');

// 1. Start Express Backend Server on port 5050
const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

// 2. Start Vite + React Client on port 5174
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

server.on('error', (err) => {
  console.error('[Server Error]:', err);
});

client.on('error', (err) => {
  console.error('[Client Error]:', err);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});
