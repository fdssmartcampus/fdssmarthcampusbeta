'use strict';
(()=>{
 const homeSections=['inicio','areas','laboratorios','noticias','motivacion','video-motivador'];
 const otherSections=['almanaque','horario-clases','registro','campusStores'];
 const defaults={frases:[{texto:'Cada paso que das hoy te acerca al profesional que quieres ser.',autor:'FDS SMART CAMPUS'}],video:{titulo:'Un momento para inspirarte',descripcion:'Las grandes metas se construyen con pequeños pasos. Aquí compartiremos historias e ideas para acompañarte en tu formación.',path:'',url:''}};
 let content=structuredClone(defaults),revision=null,seen=false,signedPath='',signedAt=0,mediaRevision=0,currentRoute='inicio',panel,activeMenu;
 const byId=id=>document.getElementById(id),canEdit=()=>!!esAdmin()&&!campusVistaPrueba;
 const esc=v=>textoSeguro(String(v??''));
 function normalize(value){
  const v=value&&typeof value==='object'?value:{};
  return {frases:(Array.isArray(v.frases)?v.frases:defaults.frases).slice(0,8).map(q=>({texto:String(q.texto||'').slice(0,1000),autor:String(q.autor||'').slice(0,140)})).filter(q=>q.texto.trim()),video:{titulo:String(v.video?.titulo??defaults.video.titulo).slice(0,180),descripcion:String(v.video?.descripcion??defaults.video.descripcion).slice(0,4000),path:validPath(v.video?.path),url:safeVideoURL(v.video?.url)}};
 }
 function validPath(p){return typeof p==='string'&&/^[a-z0-9-]+\/[a-z0-9-]+\.(mp4|webm)$/.test(p)?p:'';}
 function safeVideoURL(s){if(!s)return '';try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
 function youtubeURL(s){try{const u=new URL(s);let id='';if(['www.youtube.com','youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1]||'';if(u.hostname==='youtu.be')id=u.pathname.slice(1);return /^[\w-]{11}$/.test(id)?'https://www.youtube-nocookie.com/embed/'+id:'';}catch{return '';}}
 function cleanMedia(){mediaRevision++;signedPath='';signedAt=0;const host=byId('institutionalVideoMedia');const v=host?.querySelector('video');v?.pause();if(host)host.innerHTML='';}
 function emptyMedia(message){const host=byId('institutionalVideoMedia');if(host)host.innerHTML='<div class="institutional-video-empty"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="3" y="8" width="42" height="32" rx="7" stroke="currentColor" stroke-width="2"/><path d="m20 17 13 7-13 7Z" fill="currentColor"/></svg><span>'+esc(message)+'</span></div>';}
 async function renderMedia(force=false){
  if(!USUARIO_ACTUAL||!campusSession){cleanMedia();emptyMedia('Inicia sesión para ver el video del campus.');return;}
  const v=content.video,key=v.path||v.url;if(key===signedPath&&!force&&(Date.now()-signedAt)<2700000)return;
  const request=++mediaRevision;signedPath=key;signedAt=Date.now();
  if(!key){emptyMedia('Próximamente compartiremos un video para inspirarte.');return;}
  let source=v.url;
  if(v.path){
   emptyMedia('Preparando el video…');
   const r=await campusDB.storage.from('campus-motivacion').createSignedUrl(v.path,3600);
   if(request!==mediaRevision)return;
   if(r.error){signedPath='';emptyMedia('No se pudo cargar el video. Usa Actualizar o inténtalo más tarde.');return;}
   source=r.data.signedUrl;
  }
  if(request!==mediaRevision)return;
  const host=byId('institutionalVideoMedia');host.replaceChildren();
  const embed=youtubeURL(source);
  if(embed){const frame=document.createElement('iframe');frame.src=embed;frame.title=v.titulo||'Video motivador';frame.loading='lazy';frame.allow='fullscreen; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('allowfullscreen','');host.append(frame);}
  else {const video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload='none';video.src=source;video.setAttribute('aria-label',v.titulo||'Video motivador');host.append(video);const note=byId('institutionalVideoError');video.addEventListener('error',()=>{note.hidden=false;note.textContent='Este video no pudo reproducirse. Comprueba la conexión o vuelve a cargarlo en formato MP4 o WebM.';},{once:true});}
 }
 function render(){
  document.body.classList.toggle('institutional-can-edit',canEdit());
  const quotes=byId('institutionalQuotes');
  const quoteHTML=content.frases.length?content.frases.map(q=>'<blockquote class="institutional-quote"><p>'+esc(q.texto)+'</p>'+(q.autor?'<footer>'+esc(q.autor)+'</footer>':'')+'</blockquote>').join(''):'<p class="institutional-empty-copy">Pronto compartiremos nuevas palabras para acompañarte.</p>';
  if(quotes&&quotes.campusQuoteHTML!==quoteHTML){quotes.innerHTML=quoteHTML;quotes.campusQuoteHTML=quoteHTML;}
  if(byId('institutionalVideoTitle'))byId('institutionalVideoTitle').textContent=content.video.titulo;
  if(byId('institutionalVideoDescription'))byId('institutionalVideoDescription').textContent=content.video.descripcion;
  if(byId('institutionalVideoError'))byId('institutionalVideoError').hidden=true;
  renderMedia().catch(()=>emptyMedia('No se pudo cargar el video. Inténtalo nuevamente.'));
 }
 function receive(value,version){content=normalize(value);revision=version||null;seen=true;render();}
 async function save(next){
  campusExigir(true);
  const row={clave:'motivacion',datos:normalize(next),actualizado_en:new Date().toISOString()};
  if(seen){
   const r=await campusDB.from('campus_contenido').update(row).eq('clave','motivacion').eq('actualizado_en',revision).select('actualizado_en').maybeSingle();
   if(r.error)throw r.error;if(!r.data)throw Error('El contenido cambió desde otra sesión. Cierra el editor, pulsa Actualizar y vuelve a intentarlo.');
  }else{
   const r=await campusDB.from('campus_contenido').insert(row).select('actualizado_en').single();
   if(r.error){if(r.error.code==='23505')throw Error('Otra sesión ya publicó contenido. Pulsa Actualizar y vuelve a intentarlo.');throw r.error;}
  }
  receive(row.datos,row.actualizado_en);
 }
 function openQuotes(){
  try{campusExigir(true);}catch(e){mostrarToast(campusError(e));return;}
  abrirModalGenerico('<button class="modal-close" type="button" onclick="cerrarModal(\'modalDinamico\')" aria-label="Cerrar editor">×</button><h3>Palabras que inspiran</h3><p class="institutional-editor-status">Añade hasta 8 frases. Los cambios se mostrarán a toda la comunidad.</p><form id="institutionalQuoteForm"><div id="institutionalQuoteRows"></div><button type="button" class="btn btn-white btn-sm" data-institutional-add>+ Añadir frase</button><p id="institutionalQuoteStatus" class="institutional-editor-status" role="status"></p><div class="institutional-editor-actions"><button class="btn btn-accent" type="submit">Guardar frases</button><button class="btn btn-white" type="button" onclick="cerrarModal(\'modalDinamico\')">Cancelar</button></div></form>');
  const rows=byId('institutionalQuoteRows');
  const add=(q={texto:'',autor:''})=>{if(rows.children.length>=8){mostrarToast('Puedes añadir hasta 8 frases.');return;}const item=document.createElement('div');item.className='institutional-editor-row';const n=crypto.randomUUID();item.innerHTML='<label for="quote-'+n+'">Frase motivadora</label><textarea id="quote-'+n+'" class="form-control" data-quote-text maxlength="1000" required>'+esc(q.texto)+'</textarea><label for="author-'+n+'" style="margin-top:12px">Autor o firma (opcional)</label><input id="author-'+n+'" class="form-control" data-quote-author maxlength="140" value="'+esc(q.autor)+'"><button type="button" class="btn btn-white btn-xs" style="margin-top:12px" data-institutional-remove>Quitar frase</button>';item.querySelector('[data-institutional-remove]').onclick=()=>item.remove();rows.append(item);};
  content.frases.forEach(add);if(!rows.children.length)add();
  byId('institutionalQuoteForm').querySelector('[data-institutional-add]').onclick=()=>add();
  byId('institutionalQuoteForm').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;try{const frases=[...rows.children].map(el=>({texto:el.querySelector('[data-quote-text]').value.trim(),autor:el.querySelector('[data-quote-author]').value.trim()})).filter(q=>q.texto);await save({...content,frases});cerrarModal('modalDinamico');mostrarToast('Frases guardadas para todos los usuarios.');}catch(error){byId('institutionalQuoteStatus').textContent=campusError(error);}finally{button.disabled=false;}};
 }
 function openVideo(){
  try{campusExigir(true);}catch(e){mostrarToast(campusError(e));return;}
  const video=content.video;
  abrirModalGenerico('<button class="modal-close" type="button" onclick="cerrarModal(\'modalDinamico\')" aria-label="Cerrar editor">×</button><h3>Video motivador y descripción</h3><p class="institutional-editor-status">Sube un video MP4 o WebM de hasta 50 MB, o utiliza un enlace HTTPS a un video o a YouTube.</p><form id="institutionalVideoForm"><div class="institutional-editor-row"><label for="institutionalVideoHeading">Título</label><input class="form-control" id="institutionalVideoHeading" name="titulo" maxlength="180" required value="'+esc(video.titulo)+'"><label for="institutionalVideoText" style="margin-top:16px">Palabras de descripción</label><textarea class="form-control" id="institutionalVideoText" name="descripcion" maxlength="4000" rows="5">'+esc(video.descripcion)+'</textarea><label for="institutionalVideoFile" style="margin-top:16px">Subir desde tus archivos</label><input class="form-control" id="institutionalVideoFile" type="file" accept="video/mp4,video/webm,.mp4,.webm"><label for="institutionalVideoLink" style="margin-top:16px">O pegar un enlace de video</label><input class="form-control" id="institutionalVideoLink" name="url" type="url" placeholder="https://…" value="'+esc(video.url)+'"><p class="institutional-editor-status">'+(video.path?'Hay un video subido. Si no seleccionas otro, se conservará.':'El video no se reproducirá automáticamente.')+'</p><label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="quitar"> Quitar el video actual</label></div><p id="institutionalVideoStatus" role="status" class="institutional-editor-status"></p><div class="institutional-editor-actions"><button type="submit" class="btn btn-accent">Guardar video y descripción</button><button class="btn btn-white" type="button" onclick="cerrarModal(\'modalDinamico\')">Cancelar</button></div></form>');
  byId('institutionalVideoForm').onsubmit=async e=>{
   e.preventDefault();const form=e.target,button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;let uploaded='';
   const status=byId('institutionalVideoStatus');
   try{
    campusExigir(true);const data=new FormData(form),file=byId('institutionalVideoFile').files[0];
    const url=safeVideoURL(String(data.get('url')||'').trim()),remove=data.has('quitar');
    if(String(data.get('url')||'').trim()&&!url)throw Error('Usa un enlace HTTPS válido.');
    if(file&&url)throw Error('Elige un archivo o un enlace, no ambos.');
    if(remove&&(file||url))throw Error('Desmarca Quitar el video para publicar uno nuevo.');
    let path=remove?'':video.path,link=remove?'':url;
    if(url){const parsed=new URL(url);if(!youtubeURL(url)&&!/(\.mp4|\.webm)$/i.test(parsed.pathname))throw Error('Pega un enlace de YouTube o una dirección directa que termine en .mp4 o .webm.');path='';}
    if(file){
     if(file.size>50*1024*1024)throw Error('El video debe pesar como máximo 50 MB.');
     const ext=file.name.toLowerCase().split('.').pop();if(!['mp4','webm'].includes(ext)||file.size===0)throw Error('Selecciona un video MP4 o WebM válido.');
     if(file.type&&!['video/mp4','video/webm'].includes(file.type))throw Error('El tipo de archivo no corresponde a MP4 o WebM.');
     status.textContent='Subiendo video… Mantén esta ventana abierta hasta terminar.';
     uploaded=campusSession.user.id+'/'+crypto.randomUUID()+'.'+ext;
     const r=await campusDB.storage.from('campus-motivacion').upload(uploaded,file,{cacheControl:'3600',upsert:false,contentType:ext==='mp4'?'video/mp4':'video/webm'});
     if(r.error)throw r.error;path=uploaded;link='';
    }
    status.textContent='Guardando publicación…';
    await save({...content,video:{titulo:String(data.get('titulo')||'').trim(),descripcion:String(data.get('descripcion')||'').trim(),path,url:link}});
    cerrarModal('modalDinamico');mostrarToast('Video y descripción guardados para toda la comunidad.');
   }catch(error){status.textContent=campusError(error);if(uploaded)await campusDB.storage.from('campus-motivacion').remove([uploaded]).catch(()=>{});}
   finally{button.disabled=false;}
  };
 }
 const reducedMenu=matchMedia('(prefers-reduced-motion:reduce)'),hoverMenu=matchMedia('(hover:hover) and (pointer:fine)');
 let menuEffect=null,leaveTimer=0,skipFocusOpen=false;
 function closeMenu(immediate=false){
  clearTimeout(leaveTimer);menuEffect?.cancel();menuEffect=null;
  if(activeMenu){activeMenu.setAttribute('aria-expanded','false');activeMenu.closest('li')?.querySelector('.campus-top-label>a')?.setAttribute('aria-expanded','false');}activeMenu=null;
  if(!panel||panel.hidden)return;
  if(immediate||reducedMenu.matches||!panel.animate){panel.hidden=true;return;}
  panel.style.pointerEvents='none';menuEffect=panel.animate([{clipPath:'inset(0 0 0 0)',transform:'translateY(0)'},{clipPath:'inset(0 0 100% 0)',transform:'translateY(-12px)'}],{duration:240,easing:'ease-in-out'});
  menuEffect.onfinish=()=>{panel.hidden=true;menuEffect=null;};
 }
 function openMenu(button,toggle=true){
  clearTimeout(leaveTimer);
  if(!button)return;
  if(activeMenu===button&&!panel.hidden){if(toggle)closeMenu();return;}
  const list=button.closest('li')?.querySelector('.campus-top-submenu');if(!list)return;
  closeMenu(true);panel.innerHTML=list.innerHTML;panel.hidden=false;panel.style.pointerEvents='auto';activeMenu=button;button.setAttribute('aria-expanded','true');button.setAttribute('aria-controls',panel.id);button.closest('li')?.querySelector('.campus-top-label>a')?.setAttribute('aria-expanded','true');
  const header=button.closest('.topbar'),rect=button.closest('li').getBoundingClientRect(),width=panel.getBoundingClientRect().width,left=Math.min(rect.left,innerWidth-width-20)-header.getBoundingClientRect().left;panel.style.left=Math.max(16,left)+'px';
  if(!reducedMenu.matches&&panel.animate)menuEffect=panel.animate([{clipPath:'inset(0 0 100% 0)',transform:'translateY(-24px)'},{clipPath:'inset(0 0 0 0)',transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.2,.75,.25,1)'});
 }
 function scheduleMenuClose(){clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{if(!panel.matches(':hover')&&!byId('mainMenu')?.matches(':hover')&&!panel.contains(document.activeElement))closeMenu();},180);}

 function route(target='inicio',scroll=true){
  const id=String(target).replace(/^#/,'');const node=byId(id);let chosen=otherSections.includes(id)?id:otherSections.find(x=>byId(x)?.contains(node))||'inicio';
  currentRoute=chosen;document.body.dataset.campusRoute=chosen;
  for(const key of [...homeSections,...otherSections]){const el=byId(key);if(el)el.classList.toggle('campus-section-off',chosen==='inicio'?!homeSections.includes(key):key!==chosen);}
  const back=byId('institutionalBackHome');if(back)back.hidden=chosen==='inicio';
  byId('mainMenu')?.querySelectorAll(':scope > li').forEach(li=>{const link=li.querySelector('.campus-top-label>a');if(link)li.classList.toggle('is-current',chosen==='inicio'?link.hash==='#'+(homeSections.includes(id)?id:'inicio'):link.hash==='#'+chosen);});
  closeMenu();document.body.classList.remove('cs-nav-open');
  if(scroll&&!document.body.classList.contains('campus-locked')){const actual=chosen==='inicio'?(node&&homeSections.some(x=>byId(x)===node||byId(x)?.contains(node))?node:byId('inicio')):byId(chosen);requestAnimationFrame(()=>actual?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'}));}
  document.dispatchEvent(new CustomEvent('campus:route',{detail:{target:id,route:chosen}}));
  return chosen;
 }
 function setup(){
  const header=document.querySelector('#vistaPublica .topbar');panel=document.createElement('ul');panel.id='institutionalMenuPanel';panel.className='institutional-menu-panel';panel.hidden=true;header.append(panel);
  header.addEventListener('pointerover',event=>{
   if(!hoverMenu.matches||event.pointerType==='touch')return;
   const item=event.target.closest('#mainMenu>li');
   if(item){const button=item.querySelector('.campus-top-toggle');if(button)openMenu(button,false);else closeMenu();}
   else if(panel.contains(event.target))clearTimeout(leaveTimer);
  });
  header.addEventListener('pointerout',event=>{if(hoverMenu.matches&&!header.contains(event.relatedTarget))scheduleMenuClose();});
  panel.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  panel.addEventListener('pointerleave',scheduleMenuClose);
  header.addEventListener('focusin',event=>{if(skipFocusOpen)return;const link=event.target.closest('#mainMenu .campus-top-label>a');if(link)openMenu(link.parentElement.querySelector('.campus-top-toggle'),false);});
  header.addEventListener('focusout',event=>{if(!header.contains(event.relatedTarget))closeMenu();});
  const syncOffset=()=>document.documentElement.style.setProperty('--campus-nav-offset',Math.ceil(header.getBoundingClientRect().height+28)+'px');
  if('ResizeObserver'in window)new ResizeObserver(syncOffset).observe(header);syncOffset();
  reducedMenu.addEventListener('change',()=>{if(reducedMenu.matches)closeMenu(true);});
  const gate=byId('gateStatus'),state=byId('campusEstado');
  if(gate&&state){const syncGate=()=>{gate.hidden=campusCargando||campusDisponible;};new MutationObserver(syncGate).observe(state,{childList:true,characterData:true,subtree:true});syncGate();}
  document.querySelectorAll('.institutional-subtitle').forEach(el=>el.remove());
  header.querySelectorAll('.campus-top-label>a').forEach(a=>{a.setAttribute('aria-haspopup','true');a.setAttribute('aria-controls',panel.id);a.setAttribute('aria-expanded','false');});
  document.addEventListener('click',event=>{
   const menuButton=event.target.closest('#mainMenu .campus-top-toggle');if(menuButton){event.preventDefault();event.stopImmediatePropagation();openMenu(menuButton);return;}
   const edit=event.target.closest('[data-institutional-edit]');if(edit){event.preventDefault();edit.dataset.institutionalEdit==='frases'?openQuotes():openVideo();return;}
   const anchor=event.target.closest('a[href^="#"]');
   if(anchor&&byId('vistaPublica')?.contains(anchor)){
    const id=anchor.getAttribute('href').slice(1);if(!id)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(USUARIO_ACTUAL&&byId('panelInternoView').style.display!=='none')volverSitioPublico();
    if(anchor.dataset.storeLink){campusAbrirTienda(anchor.dataset.storeLink);return;}
    if(anchor.dataset.campusRegister&&document.body.classList.contains('campus-locked')){campusSeleccionarAcceso(anchor.dataset.campusRegister);campusVerRegistro(true,anchor.dataset.campusRegister);return;}
    const button=anchor.closest('.campus-top-label')?.querySelector('.campus-top-toggle');
    route(id);history.replaceState(null,'','#'+id);if(button)openMenu(button,false);return;
   }
   if(!event.target.closest('.topbar'))closeMenu();
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeMenu){const previous=activeMenu.closest('li')?.querySelector('.campus-top-label>a');closeMenu();skipFocusOpen=true;previous?.focus();skipFocusOpen=false;}if(e.key==='ArrowDown'&&e.target.matches('#mainMenu .campus-top-label>a')){e.preventDefault();openMenu(e.target.parentElement.querySelector('.campus-top-toggle'),false);panel.querySelector('a')?.focus();}});
  window.addEventListener('hashchange',()=>route(location.hash||'inicio'));
  window.addEventListener('resize',()=>closeMenu(true));
  byId('institutionalBackHome')?.addEventListener('click',()=>{route('inicio');history.replaceState(null,'','#inicio');});
  route('inicio',false);render();
 }
 const previousRole=campusSeleccionarAcceso;campusSeleccionarAcceso=function(role){previousRole(role);const title=document.querySelector('#modalLogin h3');if(title)title.textContent='FDS SMART CAMPUS';const intro=byId('institutionalLoginIntro');if(intro)intro.textContent='Iniciar sesión como '+({administrador:'administrador',docente:'docente',estudiante:'estudiante'}[role]||'usuario');};
 const previousAuth=autenticarUsuario;autenticarUsuario=function(user){previousAuth(user);if(!document.body.classList.contains('campus-locked')&&USUARIO_ACTUAL){volverSitioPublico();route('inicio',false);window.scrollTo(0,0);render();}};
 const previousHome=volverSitioPublico;volverSitioPublico=function(){previousHome();route('inicio',false);};
 const previousStore=window.campusAbrirTienda;window.campusAbrirTienda=function(store){previousStore(store);route('campusStores');};
 const previousLab=irAlAlmanaqueDeLab;irAlAlmanaqueDeLab=function(id){previousLab(id);route('almanaque');};
 const previousRender=campusRenderTodo;campusRenderTodo=function(){previousRender();render();};
 const previousLogout=cerrarSesion;cerrarSesion=async function(){await previousLogout();if(!USUARIO_ACTUAL){content=structuredClone(defaults);revision=null;seen=false;cleanMedia();render();}};
 window.CampusInstitutional={receive,route};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
 setInterval(()=>{const video=byId('institutionalVideoMedia')?.querySelector('video');if(USUARIO_ACTUAL&&!document.hidden&&Date.now()-signedAt>2700000&&(!video||video.paused))renderMedia().catch(()=>{});},60000);
})();
