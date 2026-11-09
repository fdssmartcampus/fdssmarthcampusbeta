'use strict';
/* La vista móvil usa los mismos contenidos, sesión y permisos del sitio. */
(()=>{
 const mobile=matchMedia('(max-width:820px), (max-width:1100px) and (hover:none) and (pointer:coarse)');
 const esc=s=>textoSeguro(String(s??''));
 const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h1m6 0h1m-8 3h1"/>',lab:'<path d="M9 3h6m-5 0v7L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2l-6-9V3M7 15h10"/><path d="M10 18h.1m4-1h.1"/>',news:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h3m-3 4h8m-8 3h8m-1-7h1"/>',shop:'<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',play:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 5 2 10 8 15 6-5 12-10 8-15Z"/>',edit:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14l-1 7Z"/>',exit:'<path d="M9 3H4v18h5m5-5 5-4-5-4m-6 4h12"/>',book:'<path d="M12 5v16M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 2-4-4-9-2Z"/>'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.grid)+'</svg>';
 const labels={home:'Inicio','horario-clases':'Mis clases',almanaque:'Uso de laboratorios',laboratorios:'Laboratorios',areas:'Áreas académicas',noticias:'Noticias',campusStores:'Catálogo',motivacion:'Palabras que inspiran','video-motivador':'Video motivador',registro:'Registro',portada:'Nuestro campus',panel:'Mi panel'};
 let header,home,bottom,drawer,ready=false,screen='home',lastFocus=null,drawerPanelButtons=[],queued=false;
 const byId=id=>document.getElementById(id),approved=()=>!!USUARIO_ACTUAL&&!document.body.classList.contains('campus-locked');
 const canEdit=()=>approved()&&!!esAdmin()&&!campusVistaPrueba;
 function adminIdentity(){return typeof campusPerfilAdministrador!=='undefined'&&campusPerfilAdministrador?.rol==='administrador'||USUARIO_ACTUAL?.rol==='administrador';}
 function resolve(id){
  if(!id||id==='inicio'||id==='home')return 'home';if(id==='portada'||id==='video-laboratorios'||id==='campusStudentGallery')return 'portada';
  if(labels[id])return id;const node=byId(id);
  for(const key of ['areas','laboratorios','noticias','almanaque','horario-clases','registro','campusStores','motivacion','video-motivador'])if(node&&byId(key)?.contains(node))return key;
  return 'home';
 }
 function applyScreen(id,{scroll=false}={}){
  screen=resolve(id);document.body.dataset.cmScreen=screen;
  if(!ready)return;
  header.querySelector('[data-cm-context]').textContent=screen==='home'?'':labels[screen]||'';
  bottom.querySelectorAll('[data-cm-route]').forEach(b=>{const active=screen===b.dataset.cmRoute;b.classList.toggle('is-active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  bottom.querySelector('[data-cm-open]').classList.toggle('is-active',!['home','horario-clases'].includes(screen));
  if(mobile.matches&&scroll)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}));
 }
 function navigate(id){
  if(!approved())return;
  closeDrawer();if(id==='panel'){irAlPanelInterno();applyScreen('panel',{scroll:true});return;}
  if(byId('panelInternoView').style.display!=='none')volverSitioPublico();
  const target=id==='home'||id==='portada'?'inicio':id;
  window.CampusInstitutional.route(target,false);applyScreen(id,{scroll:true});
  history.replaceState(null,'','#'+(id==='home'?'inicio':id));
 }
 function queueRender(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;renderHome();});}
 function renderHome(){
  if(!ready)return;document.body.classList.toggle('cm-signed-in',approved());
  if(!approved()){closeDrawer();return;}
  const user=USUARIO_ACTUAL,nombre=String(user.nombre||'').trim().split(/\s+/)[0]||'estudiante';
  byId('cmGreeting').textContent='Hola, '+nombre;byId('cmRole').textContent=({administrador:'Administración',docente:'Docente',estudiante:'Estudiante'}[user.rol]||'Mi campus');
  home.querySelector('[data-cm-manage]').hidden=!canEdit();
  const quote=byId('institutionalQuotes')?.querySelector('blockquote p')?.textContent?.trim();
  byId('cmQuote').textContent=quote||'Cada paso cuenta. Sigue construyendo tu futuro.';
  const news=Array.isArray(NOTICIAS)?NOTICIAS[0]:null;
  byId('cmNewsTitle').textContent=news?.titulo||'Noticias de tu campus';
  byId('cmNewsSummary').textContent=news?.resumen||'Consulta los últimos avisos y comunicados.';
 }
 function row(label,name,attrs){return '<button type="button" class="cm-menu-row" '+attrs+'><span class="cm-menu-icon">'+icon(name)+'</span><span>'+esc(label)+'</span></button>';}
 function renderDrawer(){
  const user=USUARIO_ACTUAL;if(!user)return;
  const entries=[['Inicio','home','home'],['Mis clases','horario-clases','calendar'],['Uso de laboratorios','almanaque','lab'],['Laboratorios','laboratorios','lab'],['Áreas académicas','areas','grid'],['Noticias','noticias','news'],['Catálogo','campusStores','shop'],['Palabras que inspiran','motivacion','heart'],['Video motivador','video-motivador','play'],['Nuestro campus','portada','book'],['Registro','registro','user']];
  let html='<div class="cm-menu-account"><span class="cm-avatar">'+esc(String(user.nombre||'U').charAt(0).toUpperCase())+'</span><div><strong>'+esc(user.nombre||'Mi cuenta')+'</strong><small>'+esc(({administrador:'Administración',docente:'Docente',estudiante:'Estudiante'}[user.rol]||''))+'</small></div></div><div class="cm-menu-list">'+entries.map(([label,id,name])=>row(label,name,'data-cm-route="'+id+'"')).join('')+'</div>';
  drawerPanelButtons=[...document.querySelectorAll('#sidebarMenuLinks .admin-nav-btn')].filter(b=>{const handler=b.getAttribute('onclick')||'';return /mostrarTabPanel/.test(handler)&&!/(tabHorarioClases|tabAlmanaque|tabNoticiasWeb)/.test(handler);});
  if(drawerPanelButtons.length)html+='<section class="cm-menu-group"><h3>Mis gestiones</h3>'+drawerPanelButtons.map((b,i)=>row(b.textContent.trim(),'user','data-cm-panel="'+i+'"')).join('')+'</section>';
  if(window.CampusWorkshops?.allowed(user))html+='<section class="cm-menu-group">'+row('Talleres','book','data-cm-action="workshops"')+'</section>';
  if(canEdit())html+='<section class="cm-menu-group" id="cmContentTools"><h3>Administrar contenido</h3>'+row('Editar portada','edit','data-cm-action="cover"')+row('Imágenes del carrusel','edit','data-cm-action="gallery"')+row('Editar frases motivadoras','heart','data-cm-action="quotes"')+row('Subir video motivador','play','data-cm-action="video"')+'</section>';
  if(adminIdentity())html+='<section class="cm-menu-group"><h3>Comprobar vistas</h3><div class="cm-preview-buttons"><button type="button" data-cm-preview="estudiante">Estudiante</button><button type="button" data-cm-preview="docente">Docente</button>'+(campusVistaPrueba?'<button type="button" data-cm-preview="">Volver a administrador</button>':'')+'</div></section>';
  html+='<section class="cm-menu-group">'+row('Cerrar sesión','exit','data-cm-action="logout"')+'</section><p class="cm-menu-footer">FDS SMART CAMPUS</p>';
  byId('cmDrawerBody').innerHTML=html;
 }
 function openDrawer(manage=false){
  if(!mobile.matches||!approved())return;renderDrawer();lastFocus=document.activeElement;if(!drawer.open)drawer.showModal();document.body.classList.add('cm-menu-open');
  header.querySelector('[data-cm-open]').setAttribute('aria-expanded','true');bottom.querySelector('[data-cm-open]').setAttribute('aria-expanded','true');
  if(manage)drawer.querySelector('#cmContentTools button')?.focus();
 }
 function closeDrawer(){if(drawer?.open){drawer.close();document.body.classList.remove('cm-menu-open');header?.querySelector('[data-cm-open]')?.setAttribute('aria-expanded','false');bottom?.querySelector('[data-cm-open]')?.setAttribute('aria-expanded','false');}}
 function action(event){
  const b=event.target.closest('[data-cm-route],[data-cm-open],[data-cm-close],[data-cm-manage],[data-cm-action],[data-cm-panel],[data-cm-preview]');if(!b)return;
  if(b.hasAttribute('data-cm-route')){navigate(b.dataset.cmRoute);return;}
  if(b.hasAttribute('data-cm-open')||b.hasAttribute('data-cm-manage')){openDrawer(b.hasAttribute('data-cm-manage'));return;}
  if(b.hasAttribute('data-cm-close')){closeDrawer();return;}
  if(b.hasAttribute('data-cm-preview')){closeDrawer();campusCambiarVista(b.dataset.cmPreview);queueRender();return;}
  if(b.hasAttribute('data-cm-panel')){const target=drawerPanelButtons[Number(b.dataset.cmPanel)];closeDrawer();if(!target)return;irAlPanelInterno();target.click();applyScreen('panel',{scroll:true});return;}
  const type=b.dataset.cmAction;closeDrawer();
  if(type==='logout'){cerrarSesion();return;}if(type==='workshops'){campusAbrirTalleres();applyScreen('panel',{scroll:true});return;}
  if(!canEdit())return;
  if(type==='cover')abrirModalEditarHero();if(type==='gallery')campusEditarGaleria();
  if(type==='quotes'||type==='video')document.querySelector('[data-institutional-edit="'+(type==='quotes'?'frases':'video')+'"]').click();
 }
 function screenChanged(){
  document.body.classList.toggle('cm-device',mobile.matches);
  if(!mobile.matches){closeDrawer();return;}
  if(byId('panelInternoView')?.style.display!=='none')applyScreen('panel');else applyScreen(screen);
 }
 function init(){
  if(ready)return;const website=byId('vistaPublica');if(!website)return;
  const logo=document.querySelector('.brand-logo img')?.src||document.querySelector('link[rel=icon]')?.href||'';
  header=document.createElement('header');header.id='cmHeader';header.className='cm-only cm-header';header.innerHTML='<button type="button" class="cm-brand" data-cm-route="home" aria-label="FDS SMART CAMPUS, ir al inicio"><img src="'+esc(logo)+'" alt="Logo FDS SMART CAMPUS"><span><strong>FDS SMART CAMPUS</strong><small data-cm-context></small></span></button><button type="button" class="cm-menu-toggle" data-cm-open aria-label="Abrir menú" aria-controls="cmDrawer" aria-expanded="false">'+icon('menu')+'<span>Menú</span></button>';
  document.body.prepend(header);
  home=document.createElement('section');home.id='campusMobileHome';home.className='cm-only cm-home';home.setAttribute('aria-label','Inicio móvil');
  const tile=(title,id,name,sub)=>'<button type="button" class="cm-tile cm-tile-'+name+'" data-cm-route="'+id+'"><span class="cm-tile-icon">'+icon(name)+'</span><strong>'+title+'</strong><small>'+sub+'</small></button>';
  home.innerHTML='<div class="cm-greeting"><div><p>MI CAMPUS</p><h1 id="cmGreeting">Hola</h1><span id="cmRole"></span></div><button type="button" class="cm-edit-button" data-cm-manage hidden>'+icon('edit')+'<span>Editar</span></button></div><div class="cm-welcome"><div><small>UN PASO A LA VEZ</small><h2>Tu futuro empieza<br>con lo que haces hoy.</h2></div><span class="cm-welcome-art" aria-hidden="true">'+icon('book')+'</span></div><section class="cm-home-section" aria-labelledby="cmAccessTitle"><h2 id="cmAccessTitle">¿Qué necesitas?</h2><div class="cm-tiles">'+tile('Mis clases','horario-clases','calendar','Consulta tus horarios')+tile('Laboratorios','almanaque','lab','Revisa los turnos')+tile('Noticias','noticias','news','Avisos del campus')+tile('Catálogo','campusStores','shop','Antojitos y Bazar')+'</div></section><section class="cm-home-section cm-news-preview" aria-labelledby="cmNewsTitle"><div class="cm-section-top"><span class="cm-label">AL DÍA CONTIGO</span>'+icon('news')+'</div><h2 id="cmNewsTitle">Noticias de tu campus</h2><p id="cmNewsSummary"></p><button type="button" class="cm-text-button" data-cm-route="noticias">Ver comunicados</button></section><section class="cm-home-section cm-quote-preview" aria-labelledby="cmQuoteTitle"><span class="cm-label" id="cmQuoteTitle">UNA IDEA PARA TU DÍA</span><p id="cmQuote"></p><div class="cm-quote-links"><button type="button" data-cm-route="motivacion">Más frases</button><button type="button" data-cm-route="video-motivador">'+icon('play')+'Ver video</button></div></section><button type="button" class="cm-campus-card" data-cm-route="areas"><span>'+icon('grid')+'</span><span><strong>Explora tu campus</strong><small>Conoce nuestras áreas académicas</small></span></button>';
  website.querySelector('header').after(home);
  bottom=document.createElement('nav');bottom.className='cm-only cm-bottom';bottom.id='cmBottom';bottom.setAttribute('aria-label','Navegación móvil principal');bottom.innerHTML='<button type="button" data-cm-route="home">'+icon('home')+'<span>Inicio</span></button><button type="button" data-cm-route="horario-clases">'+icon('calendar')+'<span>Mis clases</span></button><button type="button" data-cm-open aria-controls="cmDrawer" aria-expanded="false">'+icon('menu')+'<span>Menú</span></button>';document.body.append(bottom);
  drawer=document.createElement('dialog');drawer.id='cmDrawer';drawer.className='cm-drawer';drawer.setAttribute('aria-labelledby','cmMenuTitle');drawer.innerHTML='<div class="cm-drawer-head"><div><span>FDS SMART CAMPUS</span><h2 id="cmMenuTitle">Tu campus</h2></div><button type="button" data-cm-close aria-label="Cerrar menú">×</button></div><div id="cmDrawerBody"></div>';document.body.append(drawer);
  for(const el of [header,home,bottom,drawer])el.addEventListener('click',action);
  drawer.addEventListener('close',()=>{document.body.classList.remove('cm-menu-open');header.querySelector('[data-cm-open]').setAttribute('aria-expanded','false');bottom.querySelector('[data-cm-open]').setAttribute('aria-expanded','false');if(lastFocus?.isConnected)lastFocus.focus();});
  drawer.addEventListener('click',e=>{if(e.target===drawer){const r=drawer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDrawer();}});
  const quoteHost=byId('institutionalQuotes');if(quoteHost)new MutationObserver(queueRender).observe(quoteHost,{childList:true,subtree:true});
  for(const id of ['contenedorHorarioClasesPublico','contenedorAlmanaquePublico']){const parent=byId(id)?.parentElement;if(parent&&!parent.querySelector('.cm-scroll-hint')){const hint=document.createElement('p');hint.className='cm-only cm-scroll-hint';hint.textContent='Desliza el horario hacia los lados para ver todos los días.';byId(id).before(hint);}}
  document.querySelectorAll('[data-login-role]').forEach(b=>b.dataset.cmLabel=({administrador:'Admin',docente:'Docente',estudiante:'Estudiante'}[b.dataset.loginRole]||''));
  ready=true;mobile.addEventListener('change',screenChanged);screenChanged();renderHome();
 }
 document.addEventListener('campus:route',e=>{applyScreen(e.detail.target,{scroll:mobile.matches});queueRender();});
 const oldRender=campusRenderTodo;campusRenderTodo=function(...args){const value=oldRender.apply(this,args);queueRender();return value;};
 const oldAuth=autenticarUsuario;autenticarUsuario=function(...args){const value=oldAuth.apply(this,args);if(approved()){applyScreen('home');queueRender();}return value;};
 const oldTab=mostrarTabPanel;mostrarTabPanel=function(...args){const value=oldTab.apply(this,args);if(byId('panelInternoView')?.style.display!=='none')applyScreen('panel');return value;};
 const oldLogout=cerrarSesion;cerrarSesion=async function(...args){const value=await oldLogout.apply(this,args);if(!USUARIO_ACTUAL){closeDrawer();queueRender();}return value;};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
