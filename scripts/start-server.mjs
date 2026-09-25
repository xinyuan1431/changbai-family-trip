import './sites-env.mjs';
import { spawn } from 'node:child_process';

const port = process.env.PORT;
if (port && (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const child = spawn(process.execPath, [
  './node_modules/wrangler/bin/wrangler.js', 'dev',
  '--config', 'dist/server/wrangler.json', '--local',
  '--persist-to', '.wrangler/state',
  '--ip', port ? '0.0.0.0' : '127.0.0.1',
  '--inspector-port', '0',
  ...(port ? ['--port', port] : []),
  ...process.argv.slice(2),
], { stdio: 'inherit' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
