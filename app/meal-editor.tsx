'use client';
import {Event,Trip,MealPlan,dateAt,participantLabel} from './trip-data';
import {Choice,Field,Notes,ParticipantPicker,PlacePicker} from './trip-controls';
export const mealModes=[{value:'pending',label:'还没决定'},{value:'restaurant',label:'餐厅用餐'},{value:'home',label:'在家 / 住处吃'},{value:'snacks',label:'零食 / 简餐'}];
export function mealModeLabel(event:Event){return mealModes.find(m=>m.value===event.mealPlan?.mode)?.label||'用餐方式待定'}
export function MealFields({event,trip,onChange,onDetail}:{event:Event;trip:Trip;onChange:(event:Event)=>void;onDetail:(id:string)=>void}){
 const plan=event.mealPlan||{mode:'pending',food:'',shopping:'',preparation:''};
 const set=(value:Partial<Event>)=>onChange({...event,...value});
 const detail=(value:Partial<MealPlan>)=>set({mealPlan:{...plan,...value}});
 return <>
  <Field label="这顿叫什么" required value={event.title} onChange={title=>set({title})}/>
  <p className="muted">例如：早午餐、回家煮面、景区补充能量。不必按早中晚安排。</p>
  <div className="form-grid"><Choice label="旅行第几天" value={String(event.day+1)} options={Array.from({length:trip.days},(_,i)=>String(i+1))} onChange={v=>set({day:Number(v)-1})}/><Field label="时间 / 时段（可留空）" value={event.time} onChange={time=>set({time})}/></div>
  <Choice label="用餐方式" value={plan.mode} options={mealModes} onChange={mode=>detail({mode:mode as MealPlan['mode']})}/>
  <Choice label="状态" value={event.status} options={trip.statusOptions} onChange={status=>set({status})}/>
  {plan.mode==='restaurant'&&<><h3>餐厅与候选店铺</h3><p className="muted">从地点收藏选择，可留空或保留多家候选。地址和介绍随地点资料更新。</p><Notes label="想吃什么 / 点菜计划" value={plan.food} onChange={food=>detail({food})}/><Notes label="订位 / 排队安排" value={plan.preparation} onChange={preparation=>detail({preparation})}/></>}
  {plan.mode==='home'&&<><Field label="在哪里吃（家里 / 住处）" value={event.location} onChange={location=>set({location})}/><Notes label="吃什么 / 菜单" value={plan.food} onChange={food=>detail({food})}/><Notes label="需要采购的食材 / 用品" value={plan.shopping} onChange={shopping=>detail({shopping})}/><Notes label="谁来采购、准备 / 其他分工" value={plan.preparation} onChange={preparation=>detail({preparation})}/><h3>关联住处或采购地点（可选）</h3></>}
  {plan.mode==='snacks'&&<><Field label="在哪吃 / 沿途补给点" value={event.location} onChange={location=>set({location})}/><Notes label="吃什么 / 喝什么" value={plan.food} onChange={food=>detail({food})}/><Notes label="提前购买 / 随身携带" value={plan.shopping} onChange={shopping=>detail({shopping})}/><Notes label="准备提醒" value={plan.preparation} onChange={preparation=>detail({preparation})}/><h3>关联景区或购买地点（可选）</h3></>}
  {plan.mode==='pending'&&<><p className="muted">先记录大致想法，确定用餐方式后再补充对应内容。</p><Notes label="大致吃什么" value={plan.food} onChange={food=>detail({food})}/></>}
  {(plan.mode!=='pending'||event.placeIds.length>0)&&<PlacePicker labels={trip.categoryLabels} places={trip.places} selected={event.placeIds} onChange={placeIds=>set({placeIds})} onDetail={onDetail}/>}
  {(plan.mode==='pending'||plan.mode==='restaurant')&&<Field label="地点补充（可留空）" value={event.location} onChange={location=>set({location})}/>}
  <ParticipantPicker value={event.participants} families={trip.families} onChange={participants=>set({participants})}/>
  <Notes label="备注 / 饮食偏好" value={event.notes} onChange={notes=>set({notes})}/>
  <p className="muted">切换方式会保留已填内容和关联地点；不需要的地点可取消勾选。</p>
 </>
}
export function MealRead({event,trip,onDetail}:{event:Event;trip:Trip;onDetail:(id:string)=>void}){const p=event.mealPlan;return <div className="read-event"><span className="badge">{mealModeLabel(event)} · {event.status}</span><h3>{event.title}</h3><p>{dateAt(trip.start,event.day)} · {event.time||'时间待定'}</p><h4>一起吃的家人</h4><p>{participantLabel(event.participants,trip.families)}</p>{event.participants.note&&<p>{event.participants.note}</p>}{p?.food&&<><h4>吃什么</h4><p className="prewrap">{p.food}</p></>}{p?.shopping&&<><h4>采购 / 携带清单</h4><p className="prewrap">{p.shopping}</p></>}{p?.preparation&&<><h4>准备与安排</h4><p className="prewrap">{p.preparation}</p></>}{event.location&&<p>用餐地点：{event.location}</p>}{event.placeIds.length>0&&<h4>关联地点</h4>}{event.placeIds.map(id=>{const place=trip.places.find(p=>p.id===id);return place?<div className="linked-place" key={id}><button className="text-button" onClick={()=>onDetail(id)}>{place.name} ↗</button><p>{place.address||'地址待补充'}</p></div>:null})}{event.notes&&<><h4>备注 / 饮食偏好</h4><p className="prewrap">{event.notes}</p></>}</div>}
