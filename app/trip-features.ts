import {Trip,Event,Task,dateAt} from './trip-data';
export const priceLabels=['未设置','$ · 小吃 / 很便宜','$$ · 日常价格','$$$ · 一顿好餐','$$$$ · 高档餐饮'];
export function categoryKeys(trip:Trip){return Object.keys(trip.categoryLabels).filter(c=>c!=='必去 / 必吃')}
export function eventWithTicket(event:Event,trip:Trip):Event{
 const ticket=trip.tickets.find(t=>t.id===event.ticketId);if(!ticket)return event;
 return {...event,day:Math.round((Date.parse(ticket.date+'T12:00:00Z')-Date.parse(trip.start+'T12:00:00Z'))/86400000),time:[ticket.time,ticket.arrival].filter(Boolean).join(' → '),location:[ticket.from,ticket.to].filter(Boolean).join(' → '),status:ticket.status,participants:ticket.participants};
}
export function taskDue(task:Task,start:string){return task.deadline?.kind==='before'?dateAt(start,-1):task.deadline?.kind==='date'?task.deadline.date:''}
export function deadlineGroups(tasks:Task[],start:string){
 const groups=new Map<string,Task[]>();for(const t of tasks){const date=taskDue(t,start),key=t.deadline?.kind==='before'?'before':date||'none';groups.set(key,[...(groups.get(key)||[]),t])}
 return [...groups].map(([key,tasks])=>({key,tasks,date:taskDue(tasks[0],start),label:key==='before'?'出发前 · '+dateAt(start,-1)+' 截止':key==='none'?'未设截止日期':key+' 截止'})).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.key.localeCompare(b.key));
}
export function updatePlaceCategories(trip:Trip,rows:{id:string;name:string}[],replacement:string):Trip{
 const keys=new Set(rows.map(r=>r.id));const category=(old:string)=>keys.has(old)||old==='必去 / 必吃'?old:replacement;
 return {...trip,categoryLabels:{'必去 / 必吃':trip.categoryLabels['必去 / 必吃'],...Object.fromEntries(rows.map(r=>[r.id,r.name]))},places:trip.places.map(p=>({...p,category:category(p.category)})),events:trip.events.map(e=>({...e,category:category(e.category)}))};
}
export function updateStatuses(trip:Trip,rows:{id:string;name:string}[],replacement:string):Trip{
 const status=(old:string)=>rows.find(r=>r.id===old)?.name||rows.find(r=>r.id===replacement)!.name;
 return {...trip,statusOptions:rows.map(r=>r.name),events:trip.events.map(e=>({...e,status:status(e.status)})),places:trip.places.map(p=>({...p,status:status(p.status)})),stays:trip.stays.map(s=>({...s,status:status(s.status)})),tickets:trip.tickets.map(t=>({...t,status:status(t.status)}))};
}
