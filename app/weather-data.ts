export const weatherAreas={
 mountain:{label:'长白山北景区',url:'https://wx.weather.com.cn/mweather/10106030301A.shtml'},
 town:{label:'二道白河区域',url:'https://forecast.weather.com.cn/town/weather1dn/101060303004.shtml'},
};
export type WeatherArea=keyof typeof weatherAreas;
export type WeatherResult={area:WeatherArea;temperature?:number;description?:string;wind?:string;reportTime?:string;fetchedAt?:string;reference?:string;error?:string;source?:string;sourceUrl?:string};
// UAPI supplies district data, not a mountain observation. Never substitute it for the summit.
export function parseDistrictWeather(raw:unknown):WeatherResult{
 const b=raw as Record<string,unknown>;
 if(b.adcode!=='222426'||b.district!=='安图县'||typeof b.temperature!=='number'||!Number.isFinite(b.temperature)||typeof b.weather!=='string'||!b.weather||typeof b.report_time!=='string')throw Error('天气地点或数据无效');
 return {area:'town',temperature:b.temperature,description:b.weather,wind:[b.wind_direction,b.wind_power].filter(v=>typeof v==='string').join(' '),reportTime:b.report_time,fetchedAt:new Date().toISOString(),reference:'安图县参考 · 不是二道白河镇内实测',source:'UAPI 免费天气',sourceUrl:'https://uapis.cn/docs/api-reference/get-misc-weather'};
}
