import wrangler from 'wrangler';
import { Miniflare } from 'miniflare';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import path from 'node:path';
import { readdir } from 'node:fs/promises';

export async function startPocketBay(dataDir, _configFile, port) {
  const hosted = Boolean(port);
  const config = wrangler.unstable_getMiniflareWorkerOptions('dist/server/wrangler.json');
  const root = path.dirname(config.main);
  const files = await readdir(root, { recursive: true });
  const modules = [config.main, ...files.filter(file => /\.(m?js|wasm)$/.test(file))
    .map(file => path.join(root, file)).filter(file => file !== config.main)]
    .map(file => ({ type: file.endsWith('.wasm') ? 'CompiledWasm' : 'ESModule', path: file }));
  const runtime = new Miniflare({
    ...config.workerOptions,
    name: 'changbai-pocketbay',
    modules, modulesRoot: root,
    bindings: { ...config.workerOptions.bindings, EDITOR_KEY: process.env.EDITOR_KEY },
    d1Persist: path.join(dataDir, 'v3', 'd1'),
    r2Persist: path.join(dataDir, 'v3', 'r2'),
    cf: false, host: '127.0.0.1', port: 0,
    // Use Node's TLS stack for the app's existing outbound weather request.
    outboundService: async request => fetch(request.url, {
      method: request.method, headers: request.headers,
      ...(request.method === 'GET' || request.method === 'HEAD' ? {} : { body: await request.arrayBuffer() }),
      redirect: 'manual', signal: AbortSignal.timeout(15000),
    }),
  });
  await runtime.ready;
  const defaultOrigin = hosted ? 'https://changbai-family-trip.pocketbay.app' : 'http://127.0.0.1:8082';
  const allowedOrigins = new Set([
    'https://changbai-family-trip.pocketbay.app',
    'https://changbai-family-trip--e.pocketbay.app',
  ]);
  const server = createServer(async (request, response) => {
    try {
      // The PocketBay shell embeds the app on its --e subdomain. Both exact
      // origins belong to this app; never trust arbitrary forwarded origins.
      const origin = hosted && allowedOrigins.has(request.headers.origin)
        ? request.headers.origin : defaultOrigin;
      const url = new URL(request.url, origin);
      if (url.origin !== origin) { response.writeHead(400); response.end(); return; }
      const result = await runtime.dispatchFetch(url, {
        method: request.method, headers: request.headers,
        ...(request.method === 'GET' || request.method === 'HEAD' ? {} : { body: Readable.toWeb(request), duplex: 'half' }),
      });
      const headers = Object.fromEntries(result.headers);
      if (result.headers.getSetCookie) {
        const cookies = result.headers.getSetCookie();
        if (cookies.length) headers['set-cookie'] = cookies;
      }
      response.writeHead(result.status, headers);
      if (result.body) {
        const stream = Readable.fromWeb(result.body);
        stream.on('error', () => response.destroy());
        response.on('close', () => stream.destroy());
        stream.pipe(response);
      } else response.end();
    } catch (error) {
      console.error('Request failed:', error.message);
      if (!response.headersSent) response.writeHead(503);
      response.end('Service temporarily unavailable');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(Number(port || 8082), hosted ? '0.0.0.0' : '127.0.0.1', resolve);
  });
  let stopping = false;
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      server.close();
      server.closeAllConnections();
      await runtime.dispose();
      process.exit(0);
    });
  }
  console.log(`Persistent server ready on port ${port || 8082}.`);
}
