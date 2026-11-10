'use strict';
/* Semester selection uses the existing approved schedule records and admin persistence. */
window.CampusSemesters=(()=>{
 const values=Object.freeze(['I','II','III','IV','V','VI']);
 const normalize=value=>{const text=String(value??'').trim().toUpperCase();return values.includes(text)?text:/^[1-6]$/.test(text)?values[Number(text)-1]:'';};
 const of=record=>normalize(record?.semestre);
 const matches=(record,selection)=>!selection||(selection==='sin-asignar'?!of(record):of(record)===normalize(selection));
 const suffix=mode=>mode==='publico'?'Publico':'Panel';
 const read=mode=>document.getElementById('semestreClases'+suffix(mode))?.value||'';
 const validSelection=value=>value===''||value==='sin-asignar'||values.includes(value);
 let restoredKey='';
 function preferenceKey(){return 'fds-horario-semestre:'+((typeof USUARIO_ACTUAL!=='undefined'&&USUARIO_ACTUAL?.id)||'visitante');}
 function change(mode){
  const value=read(mode);if(!validSelection(value))return;
  for(const m of ['publico','panel']){const select=document.getElementById('semestreClases'+suffix(m));if(select)select.value=value;}
  try{localStorage.setItem(preferenceKey(),value);}catch{}
  for(const m of ['publico','panel'])if(typeof renderizarHorarioClases==='function')renderizarHorarioClases(m);
 }
 function restore(){
  const key=preferenceKey();if(key===restoredKey)return;restoredKey=key;
  let value='';try{value=localStorage.getItem(key)||'';}catch{}if(!validSelection(value))value='';
  for(const m of ['publico','panel']){const select=document.getElementById('semestreClases'+suffix(m));if(select)select.value=value;if(typeof renderizarHorarioClases==='function')renderizarHorarioClases(m);}
 }
 function updateNote(mode,records,area){
  const note=document.getElementById('notaSemestre'+suffix(mode));if(!note)return;
  const selected=read(mode),legacy=records.some(c=>c.area===area&&!of(c)),found=records.some(c=>c.area===area&&matches(c,selected));
  let message=values.includes(selected)?'Consultando el semestre '+selected+'.':selected==='sin-asignar'?'Consultando clases sin semestre asignado.':'Consultando todos los semestres.';
  if(values.includes(selected)&&!found)message+=' Todavía no hay clases asignadas a este semestre en el área seleccionada.';
  if(legacy&&selected!=='sin-asignar')message+=' Las clases anteriores están en «Sin semestre asignado» hasta que el administrador las clasifique.';
  note.textContent=message;
 }
 function init(){restore();new MutationObserver(restore).observe(document.body,{attributes:true,attributeFilter:['class']});}
 document.addEventListener('DOMContentLoaded',init,{once:true});
 return Object.freeze({values,normalize,of,matches,read,change,updateNote});
})();
