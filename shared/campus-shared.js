/* Fuente común de horarios y colores para la web y Mi Campus. */
window.CampusShared=(()=>{
 'use strict';
 const palette=['#275fa0','#7e55a7','#1d7a6b','#b26220','#a13e65','#5065a1'];
 const days=['','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
 const labs=[['enf-01','Enfermería','Laboratorio 1'],['enf-02','Enfermería','Laboratorio 2'],['enf-03','Enfermería','Laboratorio 3'],['far-01','Farmacia','Laboratorio 1'],['far-02','Farmacia','Laboratorio 2'],['gas-01','Gastronomía','Laboratorio 1'],['com-01','Cómputo','Laboratorio 1']].map(([id,area,name])=>({id,area,name}));
 const blocks=['09:00 - 10:00','10:00 - 11:00','11:20 - 12:10','12:10 - 13:00','14:30 - 15:15','15:15 - 16:00','16:20 - 16:55','16:55 - 17:30'];
 const key=v=>String(v||'').trim().toLocaleLowerCase('es');
 const safeColor=v=>/^#[a-f\d]{6}$/i.test(v||'')?v.toLowerCase():'';
 function color(title,global={},personal={}){const k=key(title);return safeColor(personal[k])||safeColor(global[k])||palette[Array.from(k).reduce((s,c)=>s+c.codePointAt(0),0)%palette.length];}
 const classId=r=>JSON.stringify([r.area,r.dia,r.bloque,r.modalidad||'']);
 function classes(rows,colors={}){return(Array.isArray(rows)?rows:[]).filter(r=>r&&typeof r==='object'&&r.curso&&days.includes(r.dia)&&/^\d\d:\d\d\s*-\s*\d\d:\d\d$/.test(r.bloque||'')).map(r=>{const [start,end]=r.bloque.split(/\s*-\s*/);return{id:classId(r),title:String(r.curso),day:days.indexOf(r.dia),start,end,room:String(r.aula||''),teacher:String(r.docente||''),area:String(r.area||''),modalidad:r.modalidad||'',shared:true,color:safeColor(colors[key(r.curso)])||safeColor(r.color)||color(r.curso,colors),raw:r};});}
 function effective(shared,personal,overrides={}){return [...shared.filter(x=>!overrides[x.id]?.hidden).map(x=>({...x,...overrides[x.id],id:x.id,shared:true,personalized:!!overrides[x.id]})),...personal];}
 const staff=user=>user?.estado==='Aprobado'&&['administrador','docente'].includes(user.rol);
 return{palette,days,labs,blocks,key,safeColor,color,classId,classes,effective,staff};
})();
