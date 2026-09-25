import {z} from 'zod';
const str=z.string().max(5000),short=z.string().trim().min(1).max(150),id=z.string().min(1).max(80),ids=z.array(id).max(300);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s);
const url=z.string().max(2000).refine(s=>!s||(()=>{try{return ['http:','https:'].includes(new URL(s).protocol)}catch{return false}})(),'链接须以 http 或 https 开头');
const media=z.object({id:z.string().uuid(),name:z.string().max(200)});
const participants=z.object({mode:z.enum(['all','selected','pending']),familyIds:ids,memberIds:ids,excludedIds:ids,note:str});
export const tripSchema=z.object({schemaVersion:z.literal(5),title:short,start:date,days:z.number().int().min(1).max(30),budget:z.number().finite().min(0).max(1e8),
 reminders:z.array(z.object({id,title:short,notes:str,tripDate:z.union([date,z.literal('')]),publishedAt:z.string().datetime()})).max(500),
 funds:z.array(z.object({id,kind:z.enum(['in','refund']),amount:z.number().finite().min(.01).max(1e8),person:short,personId:id.optional(),date:z.union([date,z.literal('')]),notes:str})).max(500),
 packing:z.array(z.object({id,title:short,category:short,notes:str,done:z.boolean()})).max(200),
 families:z.array(z.object({id,name:short,members:z.array(z.object({id,name:short})).max(30)})).min(1).max(10),
 events:z.array(z.object({id,day:z.number().int().min(0).max(29),time:str,title:short,location:str,people:str,status:short,notes:str,participants,placeIds:ids,category:short})).max(500),
 tasks:z.array(z.object({id,title:short,category:str,owner:str,ownerId:id.optional(),done:z.boolean()})).max(500),
 expenses:z.array(z.object({id,title:short,category:str,amount:z.number().finite().min(.01).max(1e8),date,payer:str,group:str,notes:str,payerId:id.optional(),familyId:id.optional(),receipts:z.array(media).max(8).optional(),fromFund:z.boolean().optional()})).max(2000),
 tips:z.array(z.object({id,title:short,notes:str,url:url.optional()})).max(100),
 places:z.array(z.object({id,name:short,category:short,address:str,description:str,highlights:str,hours:str,phone:str,url,mapUrl:url,source:url,notes:str,status:short,favorite:z.boolean(),contactName:str.optional(),wechat:str.optional(),appointment:str.optional(),mapEnabled:z.boolean().optional(),internalMap:media.optional(),mapNotes:str.optional()})).max(500),
 stays:z.array(z.object({id,placeId:id,checkIn:date,checkOut:date,room:str,status:short,notes:str,participants})).max(100),
 cover:z.object({subtitle:str,kicker:str,headline:short,route:str,note:str}),dayInfo:z.array(z.object({title:short,region:str,note:str})).min(1).max(30)
}).superRefine((t,ctx)=>{
 const fail=(message:string)=>ctx.addIssue({code:'custom',message});
 if(t.events.some(e=>e.day>=t.days)||t.dayInfo.length!==t.days)fail('请先调整超出旅行天数的行程');
 const members=t.families.flatMap(f=>f.members),memberIds=new Set(members.map(m=>m.id)),familyIds=new Set(t.families.map(f=>f.id)),places=new Set(t.places.map(p=>p.id));
 if(!members.length)fail('至少保留一位同行成员');
 for(const a of [t.families,members,t.events,t.tasks,t.expenses,t.tips,t.places,t.stays,t.funds,t.packing,t.reminders])if(new Set(a.map(x=>x.id)).size!==a.length)fail('记录编号重复');
 for(const e of t.events)if(e.placeIds.some(id=>!places.has(id)))fail('关联地点不存在');
 for(const s of t.stays){if(!t.places.some(p=>p.id===s.placeId&&p.category==='住宿'))fail('请选择有效的住宿地点');if(s.checkOut<=s.checkIn)fail('退房日期须晚于入住日期');}
 for(const p of [...t.events,...t.stays].map(x=>x.participants)){if(p.familyIds.some(id=>!familyIds.has(id))||[...p.memberIds,...p.excludedIds].some(id=>!memberIds.has(id)))fail('参与成员已变化，请重新选择');}
});
