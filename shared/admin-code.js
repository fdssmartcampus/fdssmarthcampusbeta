/* The server authorizes every unlock. This file contains no password or source bundle. */
(()=>{
'use strict';
let files=[],revision='',owner='',timer=0,controller=null,epoch=0;
const allowed=()=>typeof USUARIO_ACTUAL!=='undefined'&&USUARIO_ACTUAL?.rol==='administrador'&&USUARIO_ACTUAL.estado==='Aprobado'&&!(typeof campusVistaPrueba!=='undefined'&&campusVistaPrueba);
const el=id=>document.getElementById(id);
function lock(){epoch++;controller?.abort();controller=null;clearTimeout(timer);files=[];revision='';owner='';el('codeText')?.replaceChildren();el('codeFiles')?.replaceChildren();el('codeRevision')?.replaceChildren();el('codeViewer')?.setAttribute('hidden','');el('codeGate')?.removeAttribute('hidden');if(el('codePassword'))el('codePassword').value='';if(el('codeStatus'))el('codeStatus').textContent='';}
function sync(){
 const nav=el('sidebarMenuLinks');if(!nav)return;
 const button=el('codeNav');
 if(!allowed()){button?.parentElement?.remove();lock();if(el('tabCodigo'))el('tabCodigo').style.display='none';return;}
 if(owner&&owner!==USUARIO_ACTUAL.id)lock();
 if(!button){const li=document.createElement('li');const b=document.createElement('button');b.id='codeNav';b.className='admin-nav-btn';b.type='button';b.textContent='Código';b.addEventListener('click',open);li.append(b);nav.append(li);}
}
function mount(){
 if(el('tabCodigo'))return;
 const section=document.createElement('section');section.id='tabCodigo';section.className='panel-tab';section.style.display='none';
 section.innerHTML=`<div class="code-heading"><h2>Código de la página web</h2><span>Solo administradores</span></div>
 <p class="code-note">Consulta los archivos de la versión actual del repositorio. Este visor es de solo lectura. El repositorio de GitHub y el código que recibe el navegador siguen siendo públicos.</p>
 <form id="codeGate" class="code-form"><label for="codePassword">Confirma tu contraseña de administrador</label><input id="codePassword" type="password" autocomplete="current-password" required maxlength="1024"><button type="submit" class="btn btn-primary">Desbloquear código</button><p>Usa la misma contraseña con la que ingresas al campus. El visor se bloquea al salir de esta sección o después de 5 minutos.</p></form>
 <p id="codeStatus" class="code-status" role="status" aria-live="polite"></p>
 <div id="codeViewer" hidden><p id="codeRevision" class="code-revision"></p><div class="code-tools"><label for="codeFiles">Archivo</label><select id="codeFiles" class="code-files"></select><button id="codeCopy" type="button" class="btn btn-primary">Copiar archivo</button><button id="codeDownload" type="button" class="btn btn-primary">Descargar archivo</button><button id="codeDownloadAll" type="button" class="btn btn-primary">Descargar todo el código</button><button id="codeLock" type="button" class="btn">Bloquear</button></div><pre class="code-pre" tabindex="0" aria-label="Código del archivo seleccionado"><code id="codeText"></code></pre></div>`;
 el('tabNoticiasWeb').after(section);
 el('codeGate').addEventListener('submit',unlock);el('codeFiles').addEventListener('change',render);
 el('codeDownloadAll').addEventListener('click',()=>{if(!files.length)return;const url=URL.createObjectURL(new Blob([JSON.stringify({revision,files},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='FDS_Codigo_'+revision.slice(0,12)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 el('codeLock').addEventListener('click',()=>{lock();el('codePassword').focus();});
 el('codeCopy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(selected()?.content||'');el('codeStatus').textContent='Archivo copiado.';}catch{el('codeStatus').textContent='No se pudo copiar. Puedes seleccionar el texto o descargarlo.';}});
 el('codeDownload').addEventListener('click',()=>{const f=selected();if(!f)return;const url=URL.createObjectURL(new Blob([f.content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=f.path.replaceAll('/','__');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}
function open(){if(!allowed())return;mount();lock();mostrarTabPanel('tabCodigo','Código de la página web',el('codeNav'));el('codePassword').focus();}
function selected(){return files.find(f=>f.path===el('codeFiles')?.value);}
function render(){el('codeText').textContent=selected()?.content||'';}
async function unlock(event){
 event.preventDefault();if(!allowed())return lock();
 const form=event.currentTarget,button=form.querySelector('button');if(button.disabled)return;
 const userId=USUARIO_ACTUAL.id,myEpoch=++epoch;let password=el('codePassword').value;el('codePassword').value='';button.disabled=true;
 controller=new AbortController();const pending=controller;
 el('codeStatus').textContent='Verificando acceso y cargando archivos…';
 try{
  const {data,error}=await campusDB.auth.getSession();if(error||!data.session)throw Error('Inicia sesión de nuevo.');
  const response=await fetch(CAMPUS_URL+'/functions/v1/campus-admin-code',{method:'POST',headers:{Authorization:'Bearer '+data.session.access_token,apikey:CAMPUS_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({password}),cache:'no-store',signal:pending.signal});password='';
  const payload=await response.json();if(!response.ok)throw Error(payload.error||'No se pudo abrir el código.');
  if(myEpoch!==epoch||!allowed()||USUARIO_ACTUAL.id!==userId||el('tabCodigo').style.display==='none')return;
  files=payload.files;revision=payload.revision;owner=userId;
  el('codeFiles').replaceChildren(...files.map(f=>{const o=document.createElement('option');o.value=f.path;o.textContent=f.path;return o;}));
  el('codeFiles').value=files.some(f=>f.path==='index.html')?'index.html':files[0]?.path||'';render();
  el('codeRevision').textContent=files.length+' archivos de código · Revisión '+revision.slice(0,12);
  el('codeGate').hidden=true;el('codeViewer').hidden=false;
  el('codeStatus').textContent='Acceso verificado. Las imágenes y videos binarios no se muestran como texto.';
  timer=setTimeout(()=>{lock();el('codeStatus').textContent='El acceso ha caducado. Confirma tu contraseña otra vez.';},5*60*1000);
 }catch(error){if(myEpoch===epoch&&error.name!=='AbortError')el('codeStatus').textContent=error.message||'No se pudo conectar.';}
 finally{password='';button.disabled=false;if(controller===pending)controller=null;}
}
// Legacy panel regenerates its menu when profiles/views change.
const configure=configurarPanelPorRol;configurarPanelPorRol=function(...args){const r=configure.apply(this,args);sync();return r;};
const show=mostrarTabPanel;mostrarTabPanel=function(id,...args){if(id!=='tabCodigo')lock();return show.call(this,id,...args);};
const signout=cerrarSesion;cerrarSesion=async function(...args){lock();el('codeNav')?.parentElement?.remove();return signout.apply(this,args);};
const publicView=volverSitioPublico;volverSitioPublico=function(...args){lock();return publicView.apply(this,args);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)lock();});window.addEventListener('pagehide',lock);
campusDB?.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'||event==='USER_UPDATED')lock();});
const nav=el('sidebarMenuLinks');if(nav)new MutationObserver(sync).observe(nav,{childList:true});sync();
})();
