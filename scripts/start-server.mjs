import './sites-env.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const port = process.env.PORT;
if (port && (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const dataDir = process.env.POCKETBAY_DATA_DIR;
const configFile = path.resolve('.env.pocketbay');
if (dataDir) {
  process.loadEnvFile(configFile);
  const { preparePocketBay } = await import('./prepare-pocketbay.mjs');
  await preparePocketBay(dataDir, configFile);
  const { startPocketBay } = await import('./run-pocketbay.mjs');
  await startPocketBay(dataDir, configFile, port);
} else {
const child = spawn(process.execPath, [
  './node_modules/wrangler/bin/wrangler.js', 'dev',
  '--config', 'dist/server/wrangler.json', '--local',
  '--persist-to', dataDir || '.wrangler/state',
  '--ip', port ? '0.0.0.0' : '127.0.0.1',
  '--inspector-port', '0',
  ...(port ? ['--port', port] : []),
  ...(dataDir ? ['--env-file', configFile] : []),
  ...process.argv.slice(2),
], { stdio: 'inherit' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
}
