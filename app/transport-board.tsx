'use client';
import type {ReactNode} from 'react';
import {Ticket,Family,participantIds,membersOf} from './trip-data';
import {Field,Choice,Notes,ParticipantPicker} from './trip-controls';

export function TransportBoard({tickets,families,editing,onOpen,actions}:{tickets:Ticket[];families:Family[];editing:boolean;onOpen:(t:Ticket)=>void;actions:(t:Ticket)=>ReactNode}){
 const members=membersOf(families);
 return <div className="transport-board">{[...tickets].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).map(t=>{
 const passengers=participantIds(t.participants,families);
 return <article className="transport-service" key={t.id} aria-label={t.number||t.title}>
 <div className="transport-meta"><span>{t.date} <span className="transport-mode">{t.mode}</span></span><div><span>{t.status}</span>{editing?actions(t):<button className="text-button" onClick={()=>onOpen(t)}>详情</button>}</div></div>
 <div className="schedule-scroll"><table className="schedule-table"><thead><tr><th>班次</th><th>出发站 / 机场</th><th>出发</th><th>到达站 / 机场</th><th>到达</th></tr></thead><tbody><tr><td><button onClick={()=>onOpen(t)} aria-label={'查看班次 '+(t.number||t.title)} className="service-number">{t.number||'待定'}</button></td><td>{t.from||'待填写'}</td><td className="schedule-time">{t.time||'—'}</td><td>{t.to||'待填写'}</td><td className="schedule-time">{t.arrival||'—'}</td></tr></tbody></table></div>
 <table className="passenger-table"><thead><tr><th>乘坐人</th><th>{t.mode==='飞机'?'舱位':'车厢'}</th><th>座位</th></tr></thead><tbody>{passengers.map(id=>{const seat=t.seatAssignments.find(s=>s.memberId===id);return <tr key={id}><th scope="row">{members.find(m=>m.id===id)?.name}</th><td>{seat?.carriage||'—'}</td><td>{seat?.seat||'—'}</td></tr>})}{!passengers.length&&<tr><td colSpan={3}>乘坐人待选择</td></tr>}</tbody></table>
 </article>})}{!tickets.length&&<section className="panel empty">还没有交通班次。</section>}</div>
}

export function TicketFields({value:t,families,statusOptions,onChange}:{value:Ticket;families:Family[];statusOptions:string[];onChange:(t:Ticket)=>void}){
 const update=(key:keyof Ticket,value:unknown)=>onChange({...t,[key]:value});
 const members=membersOf(families),selected=participantIds(t.participants,families);
 const setSeat=(memberId:string,key:'carriage'|'seat',value:string)=>{const old=t.seatAssignments.find(s=>s.memberId===memberId)||{memberId,carriage:'',seat:''};update('seatAssignments',[...t.seatAssignments.filter(s=>s.memberId!==memberId),{...old,[key]:value}])};
 return <>
 <div className="form-grid"><Choice label="交通方式" value={t.mode} options={['高铁','火车','飞机','巴士','其他城际交通']} onChange={v=>update('mode',v)}/><Field label="车次 / 航班号" value={t.number} onChange={v=>update('number',v)}/><Field label="出发日期" type="date" required value={t.date} onChange={v=>update('date',v)}/><Choice label="订票状态" value={t.status} options={statusOptions} onChange={v=>update('status',v)}/><Field label="出发站 / 机场" value={t.from} onChange={v=>update('from',v)}/><Field label="出发时间" value={t.time} onChange={v=>update('time',v)}/><Field label="到达站 / 机场" value={t.to} onChange={v=>update('to',v)}/><Field label="到达时间（跨天可填次日）" value={t.arrival} onChange={v=>update('arrival',v)}/></div>
 <ParticipantPicker families={families} value={t.participants} onChange={v=>update('participants',v)}/>
 {selected.length>0&&<section className="seat-editor"><h3>每位乘客的座位</h3><div className="seat-editor-head"><span>乘坐人</span><span>{t.mode==='飞机'?'舱位':'车厢'}</span><span>座位</span></div>{selected.map(id=>{const m=members.find(m=>m.id===id)!,seat=t.seatAssignments.find(s=>s.memberId===id);return <div className="seat-editor-row" key={id}><b>{m.name}</b><input aria-label={m.name+(t.mode==='飞机'?'舱位':'车厢')} value={seat?.carriage||''} placeholder="待填写" onChange={e=>setSeat(id,'carriage',e.target.value)}/><input aria-label={m.name+'座位'} value={seat?.seat||''} placeholder="待填写" onChange={e=>setSeat(id,'seat',e.target.value)}/></div>})}</section>}
 <details className="ticket-more"><summary>备注与其他资料</summary><Field label="安排名称（选填）" value={t.title} onChange={v=>update('title',v)}/>{t.seats&&<Notes label="原座位备注" value={t.seats} onChange={v=>update('seats',v)}/>}<Notes label="票务与乘车备注" value={t.notes} onChange={v=>update('notes',v)}/></details>
 </>
}
