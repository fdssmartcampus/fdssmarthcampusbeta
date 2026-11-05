/* Utilidades locales: sin servicios externos ni almacenamiento por sí mismas. */
window.CampusDaily=(()=>{
 'use strict';
 const text=(v,n=180)=>String(v??'').trim().slice(0,n);
 const validTime=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v||'');
 const validDate=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return false;const d=new Date(v+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===v;};
 function tasks(value){return(Array.isArray(value)?value:[]).filter(x=>x&&typeof x==='object'&&validDate(x.due)&&text(x.title)).slice(0,200).map(x=>({id:text(x.id,80),title:text(x.title),course:text(x.course,100),due:x.due,type:x.type==='exam'?'exam':'task',done:x.done===true}));}
 function schedule(value){return(Array.isArray(value)?value:[]).filter(x=>x&&text(x.title)&&Number.isInteger(Number(x.day))&&Number(x.day)>=1&&Number(x.day)<=7&&validTime(x.start)&&validTime(x.end)&&x.end>x.start).slice(0,100).map(x=>({id:text(x.id,80),title:text(x.title),day:Number(x.day),start:x.start,end:x.end,room:text(x.room,100),teacher:text(x.teacher,100)})).sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));}
 const weekday=date=>{const n=new Date(date+'T12:00:00Z').getUTCDay();return n===0?7:n;};
 function nextClass(list,date,time){if(!validDate(date)||!validTime(time))return null;const today=weekday(date);return schedule(list).map(x=>({...x,daysAway:(x.day-today+7)%7+(x.day===today&&x.end<=time?7:0)})).sort((a,b)=>a.daysAway-b.daysAway||a.start.localeCompare(b.start))[0]||null;}
 const average=history=>{const values=(Array.isArray(history)?history:[]).map(x=>Number(x.percent)).filter(x=>Number.isFinite(x)&&x>=0&&x<=100);return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):null;};
 return{tasks,schedule,validTime,validDate,weekday,nextClass,average};
})();
