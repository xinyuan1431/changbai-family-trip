import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
process.loadEnvFile(path.resolve('.env.pocketbay'));
const source = new URL(process.env.MIGRATION_SOURCE);
const target = new URL(process.env.MIGRATION_TARGET || 'https://changbai-family-trip.pocketbay.app');
if (source.protocol !== 'https:' || (target.protocol !== 'https:' && target.hostname !== '127.0.0.1')) {
  throw new Error('Migration requires HTTPS, except for local validation');
}
let cookie;
async function request(origin, route, init = {}) {
  const headers = { 'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache', ...init.headers };
  if (origin === target.origin) {
    headers.Origin = target.origin;
    if (cookie) headers.Cookie = cookie;
  }
  const r = await fetch(new URL(route, origin), { ...init, headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${route} returned HTTP ${r.status}`);
  return r;
}
const snapshot = await (await request(source.origin, '/api/trip')).json();
if (snapshot.trip?.schemaVersion !== 7 || !Number.isInteger(snapshot.revision) || snapshot.revision < 1) {
  throw new Error('Source is not a saved version-7 trip');
}
const auth = await request(target.origin, '/api/editor', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: process.env.EDITOR_KEY }),
});
cookie = auth.headers.get('set-cookie')?.split(';')[0];
if (!cookie) throw new Error('Editor authentication did not return a session');
try {
  const existing = await (await request(target.origin, '/api/trip')).json();
  if (existing.revision !== 0) throw new Error('Destination already contains saved data; refusing to replace it');
  const trip = structuredClone(snapshot.trip);
  const refs = [
    ...(trip.expenses || []).flatMap(item => item.receipts || []),
    ...(trip.places || []).flatMap(item => item.internalMap?.id ? [item.internalMap] : []),
  ];
  const ids = new Map();
  for (const ref of refs) {
    const oldId = ref.id;
    if (!/^[0-9a-f-]{36}$/.test(oldId)) throw new Error('Invalid media ID');
    if (!ids.has(oldId)) {
      const file = await request(source.origin, `/api/media/${oldId}`);
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > 5 * 1024 * 1024) throw new Error('Source image exceeds size limit');
      const uploaded = await (await request(target.origin, '/api/media', {
        method: 'POST', body: bytes, headers: { 'Content-Type': file.headers.get('content-type') || 'application/octet-stream' },
      })).json();
      if (!/^[0-9a-f-]{36}$/.test(uploaded.id)) throw new Error('Invalid uploaded image ID');
      const copy = Buffer.from(await (await request(target.origin, `/api/media/${uploaded.id}`)).arrayBuffer());
      if (!createHash('sha256').update(bytes).digest().equals(createHash('sha256').update(copy).digest())) {
        throw new Error('Uploaded image differs from source');
      }
      ids.set(oldId, uploaded.id);
    }
    ref.id = ids.get(oldId);
  }
  const latest = await (await request(source.origin, '/api/trip')).json();
  if (latest.revision !== snapshot.revision || !isDeepStrictEqual(latest.trip, snapshot.trip)) {
    throw new Error('Source changed during migration; destination trip was not written');
  }
  await request(target.origin, '/api/trip', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trip, revision: 0 }),
  });
  const saved = await (await request(target.origin, '/api/trip')).json();
  if (!isDeepStrictEqual(saved.trip, trip)) throw new Error('Destination verification failed');
  console.log(`Migration verified: source revision ${snapshot.revision}, destination revision ${saved.revision}, ${ids.size} images.`);
} finally {
  await request(target.origin, '/api/editor', { method: 'DELETE' });
}
