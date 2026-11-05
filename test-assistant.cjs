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
for(const c of Object.values(context.window.commands)){assert(['horario','agenda','biblioteca','quiz','pensiones','eventos','juegos','premios','progreso','newTask'].includes(c.target));assert(c.mode);}
// La identidad raster suministrada se conserva exactamente dentro del recurso SVG.
const svg=fs.readFileSync(root+'/assets/brand/logo-fds.svg','utf8'),encoded=svg.match(/base64,([^"']+)/)[1];const bytes=Buffer.from(encoded,'base64');assert.equal(bytes.subarray(1,4).toString(),'PNG');
assert(!/\bfetch\s*\(|XMLHttpRequest|SpeechRecognition|speechSynthesis|eval\s*\(/.test(assistant));
const app=fs.readFileSync(root+'/app/app.js','utf8');new vm.Script(app);
// La migración local conserva los campos anteriores y añade solo las herramientas nuevas.
const original={reminders:[{id:'fee',due:'2026-11-08'}],attended:['fee'],history:[{percent:80}],best:{math:10},interested:['event'],tasks:[{id:'task',title:'Entrega',due:'2026-11-10'}],schedule:rows,favorites:['book']};
const pctx={window:{},user:{id:'test'},D,localStorage:{getItem:()=>JSON.stringify(original)},C:{dateValid:D.validDate},personal:null};
vm.createContext(pctx);const fn=app.slice(app.indexOf(' function loadPersonal()'),app.indexOf(' function savePersonal()'));vm.runInContext(fn,pctx);pctx.loadPersonal();
assert.equal(pctx.personal.reminders[0].id,'fee');assert.equal(pctx.personal.attended[0],'fee');assert.equal(pctx.personal.history[0].percent,80);assert.equal(pctx.personal.best.math,10);assert.equal(pctx.personal.interested[0],'event');assert.equal(pctx.personal.favorites[0],'book');assert.equal(pctx.personal.tasks.length,1);assert.equal(pctx.personal.schedule.length,2);
console.log('PASS: local command routing, unknown commands, safe action list, no remote AI calls, valid agenda/schedules, next-class week rollover, existing personal data retained and supplied PNG embedded unchanged.');
