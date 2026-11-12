import { spawn } from 'node:child_process';

const procs = [
  { name: 'backend', cmd: 'npm --prefix backend run dev' },
  { name: 'frontend', cmd: 'npm --prefix frontend run dev' }
];

const children = procs.map(({ name, cmd }) => {
  const child = spawn(cmd, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
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
