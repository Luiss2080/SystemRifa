import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const procs = [
  { name: 'backend', args: ['--prefix', 'backend', 'run', 'dev'] },
  { name: 'frontend', args: ['--prefix', 'frontend', 'run', 'dev'] }
];

const children = procs.map(({ name, args }) => {
  const child = spawn(npmCmd, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32'
  });

  child.stdout.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line.length > 0) console.log(`[${name}] ${line}`);
    }
  });

  child.stderr.on('data', (chunk) => {
    for (const line of String(chunk).split(/\r?\n/)) {
      if (line.length > 0) console.error(`[${name}] ${line}`);
    }
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[${name}] terminó con código ${code}`);
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
