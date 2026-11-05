const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const root=__dirname,context={window:{},Date,Intl};vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/app/daily-core.js','utf8'),context);const D=context.window.CampusDaily;
assert(D.validDate('2028-02-29'));assert(!D.validDate('2026-02-29'));assert(!D.validTime('24:00'));
const rows=[{id:'today',title:'Anatomía',day:4,start:'09:00',end:'10:00'},{id:'friday',title:'Farmacología',day:5,start:'08:00',end:'09:00'},{id:'invalid',title:'Incorrecta',day:0,start:'12:00',end:'10:00'}];
assert.equal(D.schedule(rows).length,2);
assert.equal(D.nextClass(rows,'2026-11-05','09:15').id,'today');assert.equal(D.nextClass(rows,'2026-11-05','10:00').id,'friday');assert.equal(D.nextClass(rows,'2026-11-06','09:00').id,'today');assert.equal(D.nextClass([],'2026-11-05','09:00'),null);
const tasks=D.tasks([{id:'t',title:'Examen',due:'2026-11-10',done:true,type:'exam'},{title:'Inválida',due:'2026-02-31'}]);assert.equal(tasks.length,1);assert.equal(tasks[0].done,true);assert.equal(tasks[0].type,'exam');assert.equal(D.average([]),null);assert.equal(D.average([{percent:80},{percent:100}]),90);
const assistant=fs.readFileSync(root+'/app/assistant.js','utf8');new vm.Script(assistant);
const start=assistant.indexOf(' const COMMANDS='),end=assistant.indexOf(' // La figura');vm.runInContext(assistant.slice(start,end)+'\nwindow.resolve=resolve;window.commands=COMMANDS;',context);
for(const [input,key]of [['MI HORARIO','horario'],['¿Qué clases tengo hoy?','horario'],['Cuestionarios','cuestionarios'],['Mis pensiones','pensiones'],['EVENTOS','eventos'],['Mis premios','premios'],['Mi progreso','progreso'],['Recuérdame entregar una tarea','recordatorio'],['Biblioteca anatomía','biblioteca']])assert.equal(context.window.resolve(input)?.key,key,input);
assert.equal(context.window.resolve('biblioteca anatomía').query,'anatomia');assert.equal(context.window.resolve('borra todas mis cuentas'),null);assert.equal(context.window.resolve('<script>alert(1)</script>'),null);
for(const c of Object.values(context.window.commands)){assert(['horario','agenda','biblioteca','quiz','pensiones','eventos','juegos','premios','progreso','newTask','laboratorios','talleres'].includes(c.target));assert(c.mode);}
// La identidad raster suministrada se conserva exactamente dentro del recurso SVG.
const svg=fs.readFileSync(root+'/assets/brand/sello-fds.svg','utf8'),encoded=svg.match(/base64,([^"']+)/)[1];const bytes=Buffer.from(encoded,'base64');assert.equal(bytes.subarray(1,4).toString(),'PNG');
assert(!/\bfetch\s*\(|XMLHttpRequest|SpeechRecognition|speechSynthesis|eval\s*\(/.test(assistant));
const app=fs.readFileSync(root+'/app/app.js','utf8');new vm.Script(app);
// La migración local conserva los campos anteriores y añade solo las herramientas nuevas.
const original={reminders:[{id:'fee',due:'2026-11-08'}],attended:['fee'],history:[{percent:80}],best:{math:10},interested:['event'],tasks:[{id:'task',title:'Entrega',due:'2026-11-10'}],schedule:rows,favorites:['book']};
const pctx={window:{},user:{id:'test'},D,localStorage:{getItem:()=>JSON.stringify(original)},C:{dateValid:D.validDate},personal:null};
vm.createContext(pctx);const fn=app.slice(app.indexOf(' function loadPersonal()'),app.indexOf(' function savePersonal()'));vm.runInContext(fn,pctx);pctx.loadPersonal();
assert.equal(pctx.personal.reminders[0].id,'fee');assert.equal(pctx.personal.attended[0],'fee');assert.equal(pctx.personal.history[0].percent,80);assert.equal(pctx.personal.best.math,10);assert.equal(pctx.personal.interested[0],'event');assert.equal(pctx.personal.favorites[0],'book');assert.equal(pctx.personal.tasks.length,1);assert.equal(pctx.personal.schedule.length,2);
console.log('PASS: local command routing, unknown commands, safe action list, no remote AI calls, valid agenda/schedules, next-class week rollover, existing personal data retained and supplied PNG embedded unchanged.');

;(()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const root=__dirname;
const ctx={window:{},URL,Date,Intl};vm.createContext(ctx);for(const f of ['shared/campus-shared.js','app/daily-core.js','app/core.js','shared/workshops.js'])vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),ctx);
const S=ctx.window.CampusShared,C=ctx.window.CampusCore;
const source=[{area:'Enfermería',dia:'Lunes',bloque:'09:00 - 10:00',curso:'Anatomía',aula:'Laboratorio 1',color:'#275fa0'}];
const shared=S.classes(source);assert.equal(shared[0].start,'09:00');assert.equal(shared[0].day,1);assert.equal(shared[0].color,'#275fa0');assert.equal(S.classes([{curso:'Bad',bloque:'x'}]).length,0);
const copy=S.effective(shared,[],{[shared[0].id]:{title:'Mi copia',start:'10:00'}});assert.equal(copy[0].title,'Mi copia');assert.equal(source[0].curso,'Anatomía');assert.equal(shared[0].title,'Anatomía');assert.equal(S.effective(shared,[],{[shared[0].id]:{hidden:true}}).length,0);
assert.equal(S.safeColor('red; background:url(x)'), '');assert.equal(S.color('Materia',{}, {'materia':'#aabbcc'}),'#aabbcc');assert.equal(S.color('Materia'),S.color(' materia '));
const W=ctx.window.CampusWorkshops;for(const role of ['estudiante','facilitador','',null])assert(!W.allowed({rol:role,estado:'Aprobado'}));assert(W.allowed({rol:'docente',estado:'Aprobado'}));assert(W.allowed({rol:'administrador',estado:'Aprobado'}));assert(!W.allowed({rol:'docente',estado:'Pendiente'}));
(async()=>{let fetched=false;await W.mount({replaceChildren(){}},{db:{from(){fetched=true}},user:{rol:'estudiante',estado:'Aprobado'}});assert(!fetched,'student must never request workshops');
const normalized=C.normalize({...C.defaults(),tasks:[{id:'g',title:'Tarea general',due:'2026-11-12'}],settings:{notice:'Aviso'}});assert.equal(normalized.tasks[0].title,'Tarea general');assert.equal(normalized.settings.notice,'Aviso');assert.equal(C.normalize(normalized).tasks.length,1);
const app=fs.readFileSync(root+'/app/app.js','utf8');new vm.Script(app);assert(app.includes("db.rpc('campus_disponibilidad_apolo')"));assert(app.includes("['aplicacion','horario','materia_colores']"));assert(!app.includes("juegos:'Minijuegos'"));assert(!app.includes('juegos:games'));assert(app.includes("tab==='talleres'&&!staff()"));
const assistant=fs.readFileSync(root+'/app/assistant.js','utf8');new vm.Script(assistant);assert(!assistant.includes('<form class="fds-assistant-form">'));assert(!assistant.includes('Comandos locales · Sin IA de pago'));assert(assistant.includes('Hola, soy Apolo, tu ayudante virtual.'));assert(!assistant.includes("juegos:{"));assert(!assistant.includes("premios:{"));
const html=fs.readFileSync(root+'/app/index.html','utf8');assert(!html.includes('data-tab="juegos"'));assert(html.includes('data-tab="horario"'));assert(html.includes('https://isfutsur.edu.pe/'));assert(html.includes('Visitar FDS Smart Campus'));
const web=fs.readFileSync(root+'/index.html','utf8');for(const m of web.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(web.includes('campus_disponibilidad_apolo'));assert(web.includes("clave:'materia_colores'"));assert(web.includes('campusNavTalleres'));
console.log('PASS: same schedule schema, personal overrides preserve official records, subject colors, no workshop request for students, staff/approval gates, shared task normalization, Apolo UI without input/technical notices/games, and both website links.');})().catch(e=>{console.error(e);process.exit(1)});

})();

;(()=>{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const root=__dirname;
const env={window:{},Date,Intl};vm.createContext(env);for(const p of ['shared/campus-shared.js','app/daily-core.js','app/core.js'])vm.runInContext(fs.readFileSync(root+'/'+p,'utf8'),env);
const S=env.window.CampusShared,D=env.window.CampusDaily,C=env.window.CampusCore,app=fs.readFileSync(root+'/app/app.js','utf8');
const get=(start,end)=>app.slice(app.indexOf(start),app.indexOf(end,app.indexOf(start)));
const row={area:'Enfermería',dia:'Lunes',bloque:'09:00 - 10:00',curso:'Anatomía',aula:'Laboratorio 1',modalidad:''};let writes=0,admin=false;
const context={S,D,C,user:{id:'student'},isAdmin:()=>admin,
 personal:{schedule:[],tasks:[],classOverrides:{},taskOverrides:{},feeOverrides:{},subjectColors:{},reminders:[]},
 content:{tasks:[{id:'global-task',title:'Actividad institucional',due:'2026-11-12',type:'task'}],fees:[{id:'global-fee',title:'Aviso general',due:'2026-11-15',amount:200}]},
 uid:()=> 'new',savePersonal(){},render(){},toast(){},$:()=>({close(){}}),validateUser:async()=>({}),loadContent:async()=>{},saveClassColors:async()=>{writes++},saveShared:async()=>{writes++}
};
context.db={from(){return {select(){return {eq(){return {maybeSingle:async()=>({data:{datos:[row]}})};}};},upsert:async()=>{writes++;return {};}};}};

context.effectiveTasks=()=>S.effective(context.content.tasks.map(t=>({...t,shared:true})),context.personal.tasks,context.personal.taskOverrides);context.fees=()=>S.effective(context.content.fees.map(t=>({...t,shared:true})),context.personal.reminders,context.personal.feeOverrides);
vm.createContext(context);vm.runInContext(get(' async function saveClassForm(', ' async function removeClass('),context);vm.runInContext(get(' async function saveTaskForm(', ' function toggleTask('),context);vm.runInContext(get(' async function saveFeeForm(', ' function studentPage('),context);
const fields=obj=>({get:k=>obj[k]});
(async()=>{const id=S.classId(row);const f={title:'Mi anatomía',color:'#aa5599',day:'1',area:'Enfermería',scope:'personal',start:'10:00',end:'11:00',room:'Mi aula'};
await context.saveClassForm({dataset:{id,source:'shared'}},fields(f));assert.equal(writes,0);assert.equal(row.curso,'Anatomía');assert.equal(context.personal.classOverrides[id].title,'Mi anatomía');
await assert.rejects(context.saveClassForm({dataset:{id,source:'shared'}},fields({...f,scope:'shared',block:'09:00 - 10:00'})),/administración/);assert.equal(writes,0);
await context.saveTaskForm({dataset:{id:'global-task',scope:'personal',source:'shared'}},fields({title:'Mi tarea',course:'Curso',due:'2026-11-20',type:'task'}));assert.equal(writes,0);assert.equal(context.content.tasks[0].title,'Actividad institucional');assert.equal(context.personal.taskOverrides['global-task'].title,'Mi tarea');
await context.saveFeeForm({dataset:{id:'global-fee',shared:'false',source:'shared'}},fields({title:'Mi aviso',due:'2026-11-25',amount:'250'}));assert.equal(writes,0);assert.equal(context.content.fees[0].amount,200);assert.equal(context.personal.feeOverrides['global-fee'].amount,250);
admin=true;await context.saveClassForm({dataset:{id,source:'shared'}},fields({...f,scope:'shared',block:'09:00 - 10:00'}));assert.equal(writes,2,'approved administrator publishes both class and shared color');
console.log('PASS: student class/task/fee customization performs zero database writes and preserves institutional records; forged shared publication rejected; administrator can publish class and color.');})().catch(e=>{console.error(e);process.exit(1)});

})();
// Calendar geometry follows real months, including leap years, not sample-image dates.
{
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync(__dirname+'/app/app.js','utf8'),ctx={C:{today:()=> '2026-11-05'}};vm.createContext(ctx);
vm.runInContext(app.slice(app.indexOf(' function monthDays('),app.indexOf(' function redrawPensions(')),ctx);
for(const [m,n,offset] of [['2024-02',29,4],['2025-02',28,6],['2026-11',30,0],['2026-08',31,6]]){const cells=ctx.monthDays(m);assert.equal(cells.length%7,0);assert.equal(cells.filter(Boolean).length,n);assert.equal(cells.findIndex(Boolean),offset);assert.equal(cells.filter(Boolean).at(-1),m+'-'+n);}
const gridContext={C:{today:()=> '2026-11-05'},matchMedia:()=>({matches:false}),action:()=>'',S:{blocks:['09:00 - 10:00','10:00 - 11:00','11:20 - 12:10','12:10 - 13:00','14:30 - 15:15','15:15 - 16:00','16:20 - 16:55','16:55 - 17:30'],days:['','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']},esc:s=>String(s)};vm.createContext(gridContext);vm.runInContext(app.slice(app.indexOf(' const overlaps='),app.indexOf(' function classCell(')),gridContext);
const grid=gridContext.timetable('Weekly','morning',[],(day,a,b)=>day+':'+a+'-'+b);assert.equal((grid.match(/<tr>/g)||[]).length,6);assert(grid.includes('colspan="6"'));assert(grid.includes('11:00–11:20'));assert(!grid.includes('14:30'));
const pm=gridContext.timetable('PM','afternoon',[],()=> 'free');assert(pm.includes('16:00–16:20'));assert(!pm.includes('09:00'));
const split=gridContext.timetable('custom','morning',[{start:'09:30',end:'10:30'}],()=> 'custom');assert(split.includes('09:00–09:30'));assert(split.includes('10:00–10:30'));
assert(app.includes("const viewUser=()=>previewRole&&user?.rol==='administrador'"));assert(app.includes("readonly:!!previewRole"));assert(app.includes("if(previewRole){e.preventDefault();e.stopImmediatePropagation()"));
console.log('PASS: month boundaries/leap years, weekly morning/afternoon recess and custom times, administrator-only read-only role preview.');
}

{
const a=fs.readFileSync(root+'/app/app.js','utf8'),part=(s,e)=>a.slice(a.indexOf(s),a.indexOf(e,a.indexOf(s)));
const scope={window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(root+'/shared/campus-shared.js','utf8'),scope);const S=scope.window.CampusShared;
const email=new Function(part(' function campusSignupEmail(', " $('createAccount')")+';return campusSignupEmail;')();assert.equal(email('ALUMNO.01'),'alumno.01@fdssmartcampus.edu.pe');for(const bad of ['a@example.com','a b',''])assert.throws(()=>email(bad));
const normalize=new Function('S',part(' function normalizeLabReminders(',' function labReminderKey(')+';return normalizeLabReminders;')(S);
const demo={lab:'enf-01',day:'Lunes',block:'09:00 - 10:00',title:'Prueba'};
const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
const isolated=new Function('localStorage','S','D','C','normalizeLabReminders', `let user={id:'A'},previewRole='',personal={reminders:[{id:'A',due:'2026-11-12'}],labReminders:[${JSON.stringify(demo)}]};${part(' function loadPersonal(',' function showAccess(')}savePersonal();user={id:'B'};loadPersonal();if(personal.reminders.length||personal.labReminders.length)throw Error('Cross-user reminder data');personal.reminders=[{id:'B',due:'2026-11-15'}];savePersonal();user={id:'A'};loadPersonal();if(personal.reminders[0].id!=='A'||personal.labReminders.length!==1)throw Error('Own reminders lost');return true;`)(storage,S,{schedule:x=>x||[],tasks:x=>x||[]},{dateValid:x=>/^\\d{4}-\\d{2}-\\d{2}$/.test(x)},normalize);assert(isolated);
for(const compact of [true,false]){const grid=new Function('S','C','matchMedia','esc','action',part(' const overlaps=',' function classCell(')+";return timetable('Test','morning',[],d=>'day-'+d);")(S,{today:()=> '2026-11-05'},()=>({matches:compact}),String,()=> '');assert.equal((grid.match(/day-\\d/g)||[]).length,compact?4:24);assert(grid.includes('colspan="'+(compact?1:6)+'"'));}
assert(a.includes("r.usuario_id===user.id&&r.estado==='Aprobado'"));assert(!a.includes("action('refreshShared','Sincronizar'"));assert.equal(JSON.parse(fs.readFileSync(root+'/manifest.webmanifest','utf8')).orientation,'portrait');
const workshops=fs.readFileSync(root+'/shared/workshops.js','utf8');assert(workshops.includes('data-workshop="confirm-delete"'));assert(workshops.includes(".delete().eq('id',id).select('id').single()"));assert(workshops.includes("row.autor_id===user.id||user.rol==='administrador'"));
console.log('PASS: institutional signup identifiers, private per-account reminders, compact mobile schedule, own laboratory reminder, portrait manifest and author/admin workshop deletion.');
}
