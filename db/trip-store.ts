import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('数据库暂不可用');return env.DB}
export function editorKey(){return (env as unknown as {EDITOR_KEY?:string}).EDITOR_KEY||''}
async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function cookieValue(){return hash('trip-editor:'+editorKey())}
export async function authorized(r:Request){if(!editorKey())return false;const expected=await cookieValue();return (r.headers.get('cookie')||'').split(';').some(s=>s.trim()==='trip_editor='+expected)}
export function sameOrigin(r:Request){const origin=r.headers.get('origin');return !!origin&&origin===new URL(r.url).origin}
