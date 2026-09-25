import {env} from 'cloudflare:workers';
import {authorized,sameOrigin} from '@/db/trip-store';
export async function POST(r:Request){
 if(!sameOrigin(r)||!await authorized(r))return Response.json({error:'请先解锁编辑权限'},{status:403});
 const max=5*1024*1024;if(Number(r.headers.get('content-length'))>max)return Response.json({error:'每张图片最多 5 MB'},{status:413});
 try{if(!env.BUCKET)throw Error('storage unavailable');const reader=r.body?.getReader();if(!reader)return Response.json({error:'请选择图片'},{status:400});let size=0;const chunks:Uint8Array[]=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();return Response.json({error:'每张图片最多 5 MB'},{status:413})}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';const type=png?'image/png':jpg?'image/jpeg':webp?'image/webp':'';
 if(!type)return Response.json({error:'仅支持 JPG、PNG、WebP 图片'},{status:400});const id=crypto.randomUUID();await env.BUCKET.put(id,bytes,{httpMetadata:{contentType:type}});return Response.json({id},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error(e);return Response.json({error:'图片上传失败，请重试；表单内容已保留。'},{status:503})}
}
