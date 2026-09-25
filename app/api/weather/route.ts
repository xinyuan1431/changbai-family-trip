import {parseDistrictWeather,WeatherResult} from '@/app/weather-data';
let cache:{expires:number;data:WeatherResult}|undefined;
let pending:Promise<WeatherResult>|undefined;
export async function GET(r:Request){
 const area=new URL(r.url).searchParams.get('area');
 if(area!=='mountain'&&area!=='town')return Response.json({error:'请选择天气区域'},{status:400});
 if(area==='mountain')return Response.json({area,error:'免费数据源暂不提供北景区实时温度，请查看中国天气网景区预报。'},{headers:{'Cache-Control':'public, max-age=600'}});
 if(cache&&cache.expires>Date.now())return Response.json(cache.data,{headers:{'Cache-Control':'public, max-age=600'}});
 try{
  pending??=(async()=>{const res=await fetch('https://uapis.cn/api/v1/misc/weather?adcode=222426',{signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error('天气服务暂不可用');const data=parseDistrictWeather(await res.json());cache={expires:Date.now()+600000,data};return data;})();
  return Response.json(await pending,{headers:{'Cache-Control':'public, max-age=600'}});
 }catch{return Response.json({area,error:'参考天气暂时无法更新，请查看中国天气网。'},{status:503,headers:{'Cache-Control':'no-store'}})}finally{pending=undefined}
}
