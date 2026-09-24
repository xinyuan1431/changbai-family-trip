import {initialTrip as legacy} from './legacy-trip-data';
export type Member={id:string;name:string};
export type Family={id:string;name:string;members:Member[]};
export type Participants={mode:'all'|'selected'|'pending';familyIds:string[];memberIds:string[];excludedIds:string[];note:string};
export type Event={id:string;day:number;time:string;title:string;location:string;people:string;status:string;notes:string;participants:Participants;placeIds:string[];category:string};
export type Task={id:string;title:string;category:string;owner:string;done:boolean};
export type Expense={id:string;title:string;category:string;amount:number;date:string;payer:string;group:string;notes:string;payerId?:string;familyId?:string};
export type Tip={id:string;title:string;notes:string;url?:string};
export type Place={id:string;name:string;category:string;address:string;description:string;highlights:string;hours:string;phone:string;url:string;mapUrl:string;source:string;notes:string;status:string;favorite:boolean};
export type Stay={id:string;placeId:string;checkIn:string;checkOut:string;room:string;status:string;notes:string;participants:Participants};
export type DayInfo={title:string;region:string;note:string};
export type Cover={subtitle:string;kicker:string;headline:string;route:string;note:string};
export type Trip={schemaVersion:2;title:string;start:string;days:number;families:Family[];events:Event[];tasks:Task[];expenses:Expense[];tips:Tip[];budget:number;places:Place[];stays:Stay[];dayInfo:DayInfo[];cover:Cover};
export const allPeople=():Participants=>({mode:'all',familyIds:[],memberIds:[],excludedIds:[],note:''});
export const placeCategories=['景点','住宿','旅拍','餐厅','温泉','交通','其他'];
export const eventCategories=['交通','游览','早餐','午餐','晚餐','住宿','旅拍','温泉','其他'];
export function dateAt(start:string,day:number){const d=new Date(start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+day);return d.toISOString().slice(0,10)}
export function nights(a:string,b:string){return Math.max(0,Math.round((Date.parse(b)-Date.parse(a))/86400000))}
export function membersOf(families:Family[]){return families.flatMap(f=>f.members)}
export function participantIds(p:Participants,families:Family[]){const all=membersOf(families);if(p.mode==='pending')return [];const chosen=p.mode==='all'?all.map(m=>m.id):[...p.memberIds,...families.filter(f=>p.familyIds.includes(f.id)).flatMap(f=>f.members.map(m=>m.id))];return all.filter(m=>chosen.includes(m.id)&&!p.excludedIds.includes(m.id)).map(m=>m.id)}
export function participantLabel(p:Participants,families:Family[]){const ids=participantIds(p,families);if(p.mode==='pending')return '参与人待定';if(p.mode==='all'&&!p.excludedIds.length)return `全员 · ${ids.length} 人`;return ids.length?membersOf(families).filter(m=>ids.includes(m.id)).map(m=>m.name).join('、'):'尚未选择参与人'}
export function cleanParticipants(p:Participants,families:Family[]):Participants{const ids=membersOf(families).map(m=>m.id);return {...p,familyIds:p.familyIds.filter(id=>families.some(f=>f.id===id)),memberIds:p.memberIds.filter(id=>ids.includes(id)),excludedIds:p.excludedIds.filter(id=>ids.includes(id))}}
export const defaultCover:Cover={subtitle:'我们的家庭旅行手账',kicker:'AUTUMN DAYS · FAMILY TRIP',headline:'一起，走进山野的秋天。',route:'北京 → 长春 → 二道白河',note:'把想去的地方、想吃的东西，慢慢装进行程里。'};
const dayTitles=['汇合，向长白山出发','北坡一日，去看天池','旅拍、温泉与小镇夜色','森林漂流，然后回长春','长春慢生活','闲逛、美食与返程'];
export function defaultDay(i:number):DayInfo{return {title:dayTitles[i]||'自由探索的一天',region:i<4?'长白山':i<6?'长春':'待安排',note:i===2?'上午分头活动，下午一起泡温泉。':i===3?'漂流与高铁同一天，留足返程缓冲。':''}}
function place(id:string,name:string,category:string,description:string,source='',highlights=''):Place{return {id,name,category,address:'',description,source,highlights,hours:'',phone:'',url:'',mapUrl:'',notes:'',status:'待确认',favorite:false}}
export const defaultPlaces:Place[]=[
place('place-stay','二道白河民宿（名称待补充）','住宿','计划连续住三晚，作为北坡、旅拍、温泉和漂流的落脚点。请在这里补全实际民宿名称、门牌地址和联系方式。'),
place('place-north','长白山北景区','景点','这一天以北景区游览为主。北景区有天池、长白瀑布、聚龙温泉群、绿渊潭、小天池和森林景观，具体路线由当天开放情况与预订服务决定。','https://changbaishan.gov.cn/hdjl/zfsqpt/jlszbsbhkfqglwyh/sqck/blhf/202410/t20241017_265041.html','想看天池、瀑布与秋日森林。主峰天气和山下不同；VIP 服务范围需与官方订单核对。'),
place('place-enduli','恩都里','景点','二道白河的休闲商旅社区，汇集餐饮、文创、民俗演艺等内容，适合安排晚餐与夜游。','https://www.changbaishan.gov.cn/mtcbs/202507/t20250715_267687.html','本次旅行想看烟花；具体场次、天气取消规则与就餐店铺仍待确认。'),
place('place-river','露水河长白山狩猎度假区','景点','露水河漂流方向的目的地资料卡。准确套餐、集合点和入口需按最终商家订单填写。','https://www.cbsslc.com/','秋日森林、漂流。计划购买六人门票、漂流和往返接送；预留换衣、取行李与高铁缓冲。'),
place('place-spa','聚龙温泉（具体场馆待选）','温泉','这是六人泡温泉的计划资料卡，尚未指定具体温泉酒店或泡浴场馆。北景区内的温泉群观景点不等同于泡浴产品。','','核对场馆名称、套餐包含项目、泳衣用品和来回交通。')
];
function legacyParticipants(text:string,families:Family[]):Participants{if(text==='全员')return allPeople();const exact=text.split(/[、，,；;]/).map(s=>s.trim());const matches=membersOf(families).filter(m=>exact.includes(m.name));const remaining=exact.filter(s=>!membersOf(families).some(m=>m.name===s));return {mode:matches.length?'selected':'pending',familyIds:[],memberIds:matches.map(m=>m.id),excludedIds:[],note:remaining.length?text:''}}
// Pure, deterministic compatibility conversion. Loading never overwrites cloud data.
export function normalizeTrip(raw:unknown):Trip{
 const r=raw as Record<string,any>;
 const families:Family[]=(r.families||[]).map((f:any,i:number)=>({...f,id:f.id||`legacy-family-${i}`,members:f.members.map((m:any,j:number)=>typeof m==='string'?{id:`legacy-member-${i}-${j}`,name:m}:m)}));
 const places:Place[]=r.places===undefined?structuredClone(defaultPlaces):r.places;
 const legacyLinks:Record<string,string[]>={'入住二道白河民宿':['place-stay'],'长白山北坡 · 六人 VIP 游览':['place-north'],'恩都里 · 晚餐与夜游':['place-enduli'],'露水河 · 森林漂流':['place-river'],'一起泡聚龙温泉':['place-spa']};
 const events:Event[]=r.events.map((e:any)=>({...e,participants:e.participants||legacyParticipants(e.people||'',families),placeIds:e.placeIds||((legacyLinks[e.title]||[]).filter(id=>places.some(p=>p.id===id))),category:e.category||(/高铁|出发|返京|回到长春/.test(e.title)?'交通':/民宿/.test(e.title)?'住宿':/旅拍/.test(e.title)?'旅拍':/温泉/.test(e.title)?'温泉':/晚餐|热乎/.test(e.title)?'晚餐':'游览')}));
 const stays:Stay[]=r.stays===undefined?[{id:'stay-first',placeId:'place-stay',checkIn:r.start,checkOut:dateAt(r.start,3),room:'房型与房间分配待补充',status:'待确认',notes:'原计划住三晚；退房当天确认行李寄存与取行李安排。',participants:allPeople()}]:r.stays;
 const tips=r.schemaVersion===2?r.tips:[...r.tips,{id:'official-north',title:'天气与景区开放 · 临行核实',notes:'山顶与镇内天气要分别确认，出行前查看长白山官方公告。',url:'https://www.changbaishan.gov.cn/'},{id:'official-river',title:'露水河 · 套餐与接送核实',notes:'漂流开放、集合点和接送时间按最终订单与景区公告确认。',url:'https://www.cbsslc.com/'}];
 return {...r,schemaVersion:2,families,events,places,stays,tips,cover:{...defaultCover,...r.cover},dayInfo:Array.from({length:r.days},(_,i)=>r.dayInfo?.[i]||defaultDay(i))} as Trip;
}
export const initialTrip=normalizeTrip(legacy);
export function placeNames(e:Event,t:Trip){const names=e.placeIds.map(id=>t.places.find(p=>p.id===id)?.name).filter(Boolean);return names.length?names.join(' / '):e.location||'地点待补充'}
export function safeUrl(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:undefined}catch{return undefined}}
