import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { getPlatformProxy } from 'wrangler';

// Initialize schema only. A separate authenticated client imports existing data.
export async function preparePocketBay(dataDir, configFile) {
  if (!process.env.EDITOR_KEY) throw new Error('PocketBay requires EDITOR_KEY');
  await mkdir(dataDir, { recursive: true });
  const proxy = await getPlatformProxy({
    configPath: 'dist/server/wrangler.json', envFiles: [configFile],
    persist: { path: path.join(dataDir, 'v3') }, remoteBindings: false,
  });
  try {
    const db = proxy.env.DB;
    const table = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trip_state'").first();
    if (!table) await db.prepare(await readFile('drizzle/0000_freezing_chat.sql', 'utf8')).run();
    const row = await db.prepare('SELECT revision FROM trip_state WHERE id=1').first();
    console.log(row ? `Persistent trip retained at revision ${row.revision}.` : 'Persistent storage ready for authenticated import.');
  } finally { await proxy.dispose(); }
}
