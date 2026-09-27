import {initialTrip as legacy} from './legacy-trip-data';
export type Reminder={id:string;title:string;notes:string;tripDate:string;publishedAt:string};
export const expenseCategories=['交通','包车与接送','住宿','餐饮','门票','温泉','漂流','旅拍','购物','其他'];
export type Member={id:string;name:string};
export type Family={id:string;name:string;members:Member[]};
export type Participants={mode:'all'|'selected'|'pending';familyIds:string[];memberIds:string[];excludedIds:string[];note:string};
export type MealPlan={mode:"pending"|"restaurant"|"home"|"snacks";food:string;shopping:string;preparation:string};
export type Event={mealPlan?:MealPlan;ticketId?:string;id:string;day:number;time:string;title:string;location:string;people:string;status:string;notes:string;participants:Participants;placeIds:string[];category:string;meal?:string};
export type Task={deadline?:{kind:"before"|"date"|"none";date:string};id:string;title:string;category:string;owner:string;ownerId?:string;done:boolean};
export type Media={id:string;name:string};
export type Fund={id:string;kind:'in'|'refund';amount:number;person:string;personId?:string;date:string;notes:string};
export type PackingItem={id:string;title:string;category:string;notes:string;done:boolean};
export type Expense={id:string;title:string;category:string;amount:number;date:string;payer:string;group:string;notes:string;payerId?:string;familyId?:string;receipts?:Media[];fromFund?:boolean};
export type Tip={id:string;title:string;notes:string;url?:string};
export type Place={priceLevel?:number;id:string;name:string;category:string;address:string;description:string;highlights:string;hours:string;phone:string;url:string;mapUrl:string;source:string;notes:string;status:string;favorite:boolean;contactName?:string;wechat?:string;appointment?:string;mapEnabled?:boolean;internalMap?:Media;mapNotes?:string};
export type Stay={id:string;placeId:string;checkIn:string;checkOut:string;room:string;status:string;notes:string;participants:Participants};
export type DayInfo={title:string;region:string;note:string};
export type Cover={subtitle:string;kicker:string;headline:string;route:string;note:string};
export type Trip={schemaVersion:10;statusOptions:string[];categoryLabels:Record<string,string>;expenseCategories:string[];taskCategories:string[];packingCategories:string[];tickets:Ticket[];reminders:Reminder[];funds:Fund[];packing:PackingItem[];title:string;start:string;days:number;families:Family[];events:Event[];tasks:Task[];expenses:Expense[];tips:Tip[];budget:number;places:Place[];stays:Stay[];dayInfo:DayInfo[];cover:Cover};
export const allPeople=():Participants=>({mode:'all',familyIds:[],memberIds:[],excludedIds:[],note:''});
export const placeCategories=['住宿','景点','餐厅','旅拍','用车与联络','其他'];
export const placeFilters=['住宿','必去 / 必吃',...placeCategories.filter(c=>c!=='住宿')];
export const defaultCategoryLabels:Record<string,string>=Object.fromEntries(placeFilters.map(c=>[c,c==='旅拍'?'体验':c]));
export type SeatAssignment={memberId:string;carriage:string;seat:string};
export type Ticket={seatAssignments:SeatAssignment[];id:string;title:string;mode:string;date:string;time:string;arrival:string;from:string;to:string;number:string;status:string;seats:string;notes:string;participants:Participants};
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
 const places:Place[]=(r.places===undefined?structuredClone(defaultPlaces):r.places).map((p:Place)=>({...p,category:r.schemaVersion>=9?p.category:placeCategories.includes(p.category)?p.category:p.category==='交通'?'用车与联络':'景点',mapEnabled:p.mapEnabled??['place-north','place-river'].includes(p.id)}));
 const legacyLinks:Record<string,string[]>={'入住二道白河民宿':['place-stay'],'长白山北坡 · 六人 VIP 游览':['place-north'],'恩都里 · 晚餐与夜游':['place-enduli'],'露水河 · 森林漂流':['place-river'],'一起泡聚龙温泉':['place-spa']};
 const events:Event[]=r.events.map((e:any)=>({...e,participants:e.participants||legacyParticipants(e.people||'',families),placeIds:e.placeIds||((legacyLinks[e.title]||[]).filter(id=>places.some(p=>p.id===id))),category:e.category||(/高铁|出发|返京|回到长春/.test(e.title)?'交通':/民宿/.test(e.title)?'住宿':/旅拍/.test(e.title)?'旅拍':/温泉/.test(e.title)?'温泉':/晚餐|热乎/.test(e.title)?'晚餐':'游览')}));
 const stays:Stay[]=r.stays===undefined?[{id:'stay-first',placeId:'place-stay',checkIn:r.start,checkOut:dateAt(r.start,3),room:'房型与房间分配待补充',status:'待确认',notes:'原计划住三晚；退房当天确认行李寄存与取行李安排。',participants:allPeople()}]:r.stays;
 const oldTips=r.schemaVersion>=2?r.tips:[...r.tips,{id:'official-north',title:'天气与景区开放 · 临行核实',notes:'山顶与镇内天气要分别确认，出行前查看长白山官方公告。',url:'https://www.changbaishan.gov.cn/'},{id:'official-river',title:'露水河 · 套餐与接送核实',notes:'漂流开放、集合点和接送时间按最终订单与景区公告确认。',url:'https://www.cbsslc.com/'}];
 const tips=r.schemaVersion>=3?oldTips:oldTips.filter((t:Tip)=>!(t.id==='p4'&&t.notes===legacy.tips.find(x=>x.id==='p4')?.notes)).map((t:Tip)=>t.id==='p1'&&t.notes===legacy.tips[0].notes?{...t,notes:'顶部天气栏可切换山顶附近与二道白河镇。出发前再核对预报、风力和景区开放公告，按当天情况调整穿衣。'}:t);
 const tasks=(r.schemaVersion>=3?r.tasks:migrateTasks(r.tasks)).map((t:Task)=>({...t,ownerId:t.ownerId??uniqueMemberId(t.owner,families)}));
 const packing=r.packing??defaultPacking.map(p=>({...p,done:!!r.tasks.find((t:Task)=>t.id===(p.category==='衣物与鞋袜'?'t11':p.category==='温泉与漂流'?'t12':'t13')&&t.done)}));
 const funds=(r.funds??[{id:'initial-fund-20000',kind:'in',amount:20000,person:'大姨妈',date:'',notes:'首笔旅行备用金，已收到；具体转账日期待补充。'}]).map((f:Fund)=>({...f,personId:f.personId??uniqueMemberId(f.person,families)}));
 const expenses=r.expenses.map((e:Expense)=>({...e,payerId:e.payerId??uniqueMemberId(e.payer,families),familyId:e.familyId??(families.filter(f=>f.name===e.group).length===1?families.find(f=>f.name===e.group)?.id:undefined)}));
 const tickets:Ticket[]=(r.tickets??events.filter(e=>e.category==='交通').map(e=>({id:'ticket-'+e.id,title:e.title,mode:'高铁',date:dateAt(r.start,e.day),time:e.time,arrival:'',from:e.location.split('→')[0]?.trim()||'',to:e.location.includes('→')?e.location.split('→')[1].trim():'',number:'',status:e.status,seats:'',notes:e.notes,participants:e.participants}))).map((t:Ticket)=>({...t,seatAssignments:t.seatAssignments??[]}));
 const migratedEvents=events.map(e=>({...e,meal:e.meal||(['早餐','午餐','晚餐'].includes(e.category)?e.category:undefined),category:r.schemaVersion>=9?e.category:placeFilters.includes(e.category)?e.category:['早餐','午餐','晚餐'].includes(e.category)?'餐厅':e.category==='游览'?'景点':e.category==='温泉'?'旅拍':'其他'}));
 return {...r,schemaVersion:10,statusOptions:r.statusOptions??[...new Set(['候选','待确认','待预订','确认','已预订','已出票','已取消',...events.map(e=>e.status),...places.map(p=>p.status),...stays.map(s=>s.status),...tickets.map(t=>t.status)])],expenseCategories:r.expenseCategories??[...new Set([...expenseCategories,...expenses.map((e:Expense)=>e.category)])],categoryLabels:r.schemaVersion>=9?r.categoryLabels:{...defaultCategoryLabels,...r.categoryLabels},taskCategories:r.taskCategories??(tasks.length?[...new Set(tasks.map((t:Task)=>t.category))]:['其他']),packingCategories:r.packingCategories??(packing.length?[...new Set(packing.map((p:PackingItem)=>p.category))]:['其他']),tickets,reminders:r.reminders??[],families,events:migratedEvents,places,stays,tips,tasks,packing,funds,expenses,cover:{...defaultCover,...r.cover},dayInfo:Array.from({length:r.days},(_,i)=>r.dayInfo?.[i]||defaultDay(i))} as Trip;
}
export const defaultPacking:PackingItem[]=[
 ['身份证原件','证件与随身','放在随身包，乘车与景区入园时使用。'],
 ['手机、充电线、充电宝','证件与随身','出发前充满电。'],
 ['贴身排汗长袖','衣物与鞋袜','三明治穿衣第一层：贴身舒适、便于排汗。'],
 ['抓绒或薄羽绒中层','衣物与鞋袜','第二层：负责保暖，按当天预报增减。'],
 ['防风防水外套','衣物与鞋袜','第三层：挡风防雨；上山带在身边。'],
 ['长裤、防滑运动鞋','衣物与鞋袜','选择已经穿习惯的鞋。'],
 ['帽子、手套、备用袜子','衣物与鞋袜','山顶和小镇温差较大，厚度按临行预报调整。'],
 ['泳衣、拖鞋','温泉与漂流','单独装袋，核对场馆提供哪些用品。'],
 ['替换衣裤、防水袋','温泉与漂流','漂流后方便换衣，湿衣物分开装。'],
 ['个人常用药','药品','按自己的日常需要准备。'],
 ['洗漱用品','个人用品','牙刷、护肤品和个人清洁用品。'],
 ['水杯、纸巾、雨具','个人用品','放进当天随身包。']
].map((r,i)=>({id:'pack-'+i,title:r[0],category:r[1],notes:r[2],done:false}));
const taskReplacements:Record<string,[string,string][]>= {
 t0:[['订北坡六人 VIP','门票与体验'],['确认北坡 VIP 接送和退改','用车与接送']],
 t1:[['订长春 → 长白山高铁票','高铁与交通'],['订长白山 → 长春高铁票','高铁与交通'],['核对北京 → 长春高铁票','高铁与交通']],
 t2:[['订长春 → 北京高铁票','高铁与交通']],
 t3:[['确认民宿三晚预订','住宿'],['补全民宿地址与入住方式','住宿'],['确认退房日行李寄存','住宿']],
 t4:[['预订朝鲜族服饰旅拍','门票与体验']],
 t5:[['安排长辈 3 日上午活动','行程核对']],
 t6:[['订聚龙温泉六人票','门票与体验'],['预约温泉接送','用车与接送']],
 t7:[['订露水河包车','用车与接送'],['买露水河门票','门票与体验'],['买露水河漂流票','门票与体验']],
 t8:[['确认恩都里烟花时间','行程核对'],['预订恩都里晚餐','餐饮']],
 t9:[['确定长白山正餐餐厅','餐饮']],
 t10:[['出发前核对天气','行程核对'],['上山当天核对开放公告','行程核对']]
};
function migrateTasks(tasks:Task[]):Task[]{return tasks.flatMap(t=>{const original=legacy.tasks.find(x=>x.id===t.id);if(!original||original.title!==t.title)return [t];if(['t11','t12','t13'].includes(t.id))return [];return (taskReplacements[t.id]||[[t.title,t.category]]).map(([title,category],i)=>({...t,id:i?t.id+'-split-'+i:t.id,title,category,owner:t.owner==='全员'?'我':t.owner}));});}
export function fundTotals(t:Trip){const cents=(n:number)=>Math.round(n*100);const received=t.funds.filter(f=>f.kind==='in').reduce((a,f)=>a+cents(f.amount),0);const refunded=t.funds.filter(f=>f.kind==='refund').reduce((a,f)=>a+cents(f.amount),0);const spent=t.expenses.filter(e=>e.fromFund!==false).reduce((a,e)=>a+cents(e.amount),0);return {received:received/100,refunded:refunded/100,spent:spent/100,balance:(received-refunded-spent)/100};}
export const initialTrip=normalizeTrip(legacy);
export function placeNames(e:Event,t:Trip){const names=e.placeIds.map(id=>t.places.find(p=>p.id===id)?.name).filter(Boolean);return names.length?names.join(' / '):e.location||'地点待补充'}
export function safeUrl(value:string){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:undefined}catch{return undefined}}

export function uniqueMemberId(name:string,families:Family[]){const matches=membersOf(families).filter(m=>m.name===name);return matches.length===1?matches[0].id:undefined}
export function memberName(id:string|undefined,fallback:string,families:Family[]){return membersOf(families).find(m=>m.id===id)?.name||fallback||"待选择"}
