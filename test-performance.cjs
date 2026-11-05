const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=__dirname,html=fs.readFileSync(root+'/index.html','utf8');
const app=fs.readFileSync(root+'/app/app.js','utf8');
const block=(start,end)=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)));
const refresh=block('async function campusRecargar(', 'function campusRenderTodo()');
const login=block('iniciarSesionFormulario=async function(e)', 'accesoDirectoRol=function');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
async function testWebsite(){
 const gate=deferred(),reads=[],pending=[],ctx={campusCargando:false,campusSession:{user:{id:'one'}},USUARIO_ACTUAL:{id:'one'},campusDisponible:false,campusDatosListos:false,Promise,Set,Date,
  campusMensaje(){},campusError:()=> 'error',mostrarToast(){},campusClave:r=>`${r.laboratorio}|${r.dia}|${r.bloque}`,
  campusPerfilSesion:()=>gate.promise,campusResultado:v=>v,campusRenderTodo(){ctx.rendered=(ctx.rendered||0)+1;}};
 const read=(name,data)=>{reads.push(name);const d=deferred();pending.push(()=>d.resolve(data));return d.promise;};
 ctx.campusCargarContenido=()=>read('content',[]);
 ctx.campusDB={rpc:()=>read('availability',[{laboratorio:'lab1',dia:'lunes',bloque:1}])};
 ctx.campusTodas=table=>read(table,[]);
 vm.createContext(ctx);vm.runInContext(refresh,ctx);
 const done=ctx.campusRecargar();await tick();assert.equal(reads.length,0,'wait for approved profile');
 gate.resolve();await tick();assert.deepEqual(reads.sort(),['availability','content','requerimientos','reservas']);
 assert(!ctx.campusDatosListos);pending.forEach(f=>f());await done;
 assert(ctx.campusDatosListos);assert.equal(ctx.rendered,1);assert.equal(ctx.SEPARACIONES[0].soloDisponibilidad,true);
 // A denied profile must prevent every protected read.
 reads.length=0;ctx.campusPerfilSesion=async()=>{throw Error('denied')};
 await ctx.campusRecargar();assert.equal(reads.length,0);assert.equal(ctx.campusDatosListos,false);assert.equal(ctx.campusDisponible,false);
 // The login's successful server/profile validation is reused by exactly one refresh.
 let profiles=0,signouts=0,entered=0;
 const pass={value:'test'},l={campusDB:{auth:{signInWithPassword:async()=>({data:{session:{user:{id:'one'}}}}),signOut:async()=>{signouts++}}},
  campusAccion:async(_,fn)=>fn(),campusIdentificador:x=>x,document:{getElementById:id=>id==='loginPass'?pass:{value:'test'}},
  campusPerfilSesion:async()=>{profiles++},campusRecargar:async o=>{assert.equal(o.perfilVerificado,true)},campusDatosListos:true,USUARIO_ACTUAL:{id:'one'},autenticarUsuario:()=>entered++};
 vm.createContext(l);vm.runInContext(login,l);await l.iniciarSesionFormulario({});assert.equal(profiles,1);assert.equal(entered,1);
 l.campusPerfilSesion=async()=>{throw Error('pending')};await assert.rejects(l.iniciarSesionFormulario({}),/pending/);assert.equal(signouts,1);assert.equal(entered,1);
 // The web only requests its own content keys, avoiding app PDFs in the web response.
 const contentFn=block('async function campusCargarContenido()', 'async function campusRecargar(');let selected,keys;
 const q={campusDB:{from:()=>({select:columns=>{selected=columns;return{in:(_,v)=>{keys=v;return []}}}})},campusResultado:async x=>x};
 vm.createContext(q);vm.runInContext(contentFn,q);await q.campusCargarContenido();
 assert.equal(selected,'clave,datos');assert.deepEqual(Array.from(keys),['noticias','inventario','horario','portada']);
}
async function testApp(){
 const fn=app.match(/ async function validateUser\([^\n]+/)[0];let authChecks=0,ids=[];
 let profile={id:'one',nombre:'Prueba',rol:'estudiante',estado:'Aprobado'};
 const ctx={db:{auth:{getUser:async()=>{authChecks++;return{data:{user:{id:'one'}}}}},from:()=>({select:()=>({eq:(_,id)=>{ids.push(id);return{single:async()=>({data:profile})}}})})}};
 vm.createContext(ctx);vm.runInContext(fn,ctx);
 await ctx.validateUser({id:'one'});assert.equal(authChecks,0);assert.equal(ids[0],'one');
 await ctx.validateUser();assert.equal(authChecks,1,'restored and privileged sessions still verified by server');
 profile={...profile,estado:'Pendiente'};await assert.rejects(ctx.validateUser({id:'one'}),/pendiente/);
}
async function testCache(){
 const scope='https://campus.test/fdssmarthcampusbeta/',events={},stored=new Map();let network=0;
 const ctx={URL,Request,Response,Set,Promise,self:{location:{href:scope+'sw.js'},addEventListener:(n,f)=>events[n]=f,clients:{claim:async()=>{}},skipWaiting(){}},
  caches:{open:async()=>({addAll:async files=>{for(const f of files)stored.set(f.url,new Response('public asset'))},match:async url=>stored.get(url)?.clone()}),keys:async()=>[],delete:async()=>{}},
  fetch:async()=>{network++;return new Response('network')}};
 vm.runInNewContext(fs.readFileSync(root+'/sw.js','utf8'),ctx);let p;events.install({waitUntil:v=>p=v});await p;
 const request=(url,mode='cors',method='GET')=>{let response;events.fetch({request:{url,mode,method},respondWith:r=>response=r});return response};
 assert.equal(await (await request(scope+'app/app.js?v=20261105-student')).text(),'public asset');assert.equal(network,0);
 assert.equal(await (await request(scope+'vendor/supabase.js')).text(),'public asset');assert.equal(network,0);
 await request(scope+'index.html','navigate');assert.equal(network,1,'private pages always use network');
 for(const url of ['https://project.supabase.co/auth/v1/token','https://project.supabase.co/rest/v1/perfiles',scope+'api/reservas',scope+'app/secret.pdf'])assert.equal(request(url),undefined);
 assert.equal(request(scope+'app/app.js?v=20261105-student','cors','POST'),undefined);
}
(async()=>{for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc=/.test(match[1]))new vm.Script(match[2]);
 new vm.Script(app);await testWebsite();await testApp();await testCache();
 console.log('PASS: concurrent reads gated by approval, failed auth isolation, one login profile check, scoped content, app server validation, static cache hits and private/API cache exclusions.');
})().catch(e=>{console.error(e);process.exit(1)});
