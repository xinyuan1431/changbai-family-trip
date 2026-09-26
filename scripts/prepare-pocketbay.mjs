import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getPlatformProxy } from 'wrangler';

// Seed only an empty persistent volume. Never replace an existing trip on restart.
export async function preparePocketBay(dataDir, configFile) {
  if (!process.env.EDITOR_KEY) throw new Error('PocketBay requires EDITOR_KEY');
  await mkdir(dataDir, { recursive: true });
  const proxy = await getPlatformProxy({
    configPath: 'dist/server/wrangler.json',
    envFiles: [configFile],
    persist: { path: path.join(dataDir, 'v3') },
    remoteBindings: false,
  });
  try {
    const db = proxy.env.DB;
    const table = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trip_state'").first();
    if (!table) {
      await db.prepare(await readFile('drizzle/0000_freezing_chat.sql', 'utf8')).run();
    }
    if (await db.prepare('SELECT id FROM trip_state WHERE id=1').first()) {
      console.log('Persistent trip already exists; migration skipped.');
      return;
    }
    const source = new URL(process.env.MIGRATION_SOURCE || '');
    if (source.protocol !== 'https:' || source.username || source.password) {
      throw new Error('MIGRATION_SOURCE must be an HTTPS origin');
    }
    async function get(relative) {
      const response = await fetch(new URL(relative, source.origin), {
        signal: AbortSignal.timeout(30000), redirect: 'error',
        headers: { 'User-Agent': 'ChangbaiMigration/1.0', 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) throw new Error(`Migration source returned HTTP ${response.status}`);
      return response;
    }
    const snapshot = await (await get('/api/trip')).json();
    if (snapshot.trip?.schemaVersion !== 7 || !Number.isInteger(snapshot.revision) || snapshot.revision < 1 || !snapshot.updated) {
      throw new Error('Migration source is not a saved version-7 trip');
    }
    const body = JSON.stringify(snapshot.trip);
    if (Buffer.byteLength(body) > 1000000) throw new Error('Migration trip exceeds size limit');
    const media = new Set([
      ...(snapshot.trip.expenses || []).flatMap(item => (item.receipts || []).map(file => file.id)),
      ...(snapshot.trip.places || []).flatMap(item => item.internalMap?.id ? [item.internalMap.id] : []),
    ]);
    for (const id of media) {
      if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('Invalid media ID in source trip');
      const response = await get(`/api/media/${id}`);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('Migration image exceeds size limit');
      const contentType = response.headers.get('content-type') || '';
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(contentType)) throw new Error('Unsupported migration image');
      await proxy.env.BUCKET.put(id, bytes, { httpMetadata: { contentType } });
      const stored = await proxy.env.BUCKET.get(id);
      if (!stored || stored.size !== bytes.byteLength) throw new Error('Image migration verification failed');
    }
    const latest = await (await get('/api/trip')).json();
    if (latest.revision !== snapshot.revision || JSON.stringify(latest.trip) !== body) {
      throw new Error('Source trip changed during migration; retry to obtain a consistent snapshot');
    }
    await db.prepare('INSERT INTO trip_state (id,body,revision,updated) VALUES (1,?,?,?) ON CONFLICT(id) DO NOTHING')
      .bind(body, snapshot.revision, snapshot.updated).run();
    const stored = await db.prepare('SELECT body,revision FROM trip_state WHERE id=1').first();
    if (stored.body !== body || stored.revision !== snapshot.revision) throw new Error('Trip migration verification failed');
    console.log(`Migration verified: revision ${snapshot.revision}, ${media.size} images.`);
  } finally {
    await proxy.dispose();
  }
}
