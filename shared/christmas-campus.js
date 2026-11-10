'use strict';
/* Seasonal presentation: no credentials, session changes, database writes or demo records. */
(()=>{
 const root=document.documentElement;
 const nightLogo=new URL('../assets/brand/sello-fds-nocturno.svg?v=20261110-1',document.currentScript.src).href;
 let season='christmas',paused=matchMedia('(prefers-reduced-motion:reduce)').matches;
 try{season=localStorage.getItem('fds-season')==='classic'?'classic':'christmas';paused=paused||localStorage.getItem('fds-season-paused')==='true';}catch{}
 function sync(){root.dataset.season=season;root.dataset.campusMotion=paused?'paused':'running';document.querySelectorAll('[data-campus-season]').forEach(b=>{b.setAttribute('aria-pressed',String(season==='christmas'));b.textContent=season==='christmas'?'Navidad activada':'Activar Navidad';});document.querySelectorAll('button[data-campus-motion]').forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.textContent=paused?'Reanudar adornos':'Pausar adornos';});}
 sync();
 const presents=[['El regalo de aprender','Cada idea nueva amplía lo que puedes hacer. Sigue dando tu próximo paso.'],['El regalo de compartir','Lo que sabes puede ayudar a alguien más. Crecemos cuando aprendemos juntos.'],['El regalo de la constancia','Un pequeño esfuerzo cada día puede convertirse en una gran oportunidad.'],['El regalo de creer en ti','Reconoce lo que has avanzado. Todavía tienes mucho por descubrir.']];
 let giftDialog,returnFocus;
 function gift(index,button){
  if(!giftDialog){giftDialog=document.createElement('dialog');giftDialog.className='campus-gift-dialog';giftDialog.setAttribute('aria-labelledby','campusGiftTitle');giftDialog.innerHTML='<span aria-hidden="true">✧</span><h2 id="campusGiftTitle"></h2><p></p><button type="button">Seguir explorando</button>';document.body.append(giftDialog);giftDialog.querySelector('button').addEventListener('click',()=>giftDialog.close());giftDialog.addEventListener('click',e=>{if(e.target===giftDialog){const r=giftDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)giftDialog.close();}});giftDialog.addEventListener('close',()=>{giftDialog.style.removeProperty('display');returnFocus?.focus();});}
  const [title,copy]=presents[Number(index)%presents.length];giftDialog.querySelector('h2').textContent=title;giftDialog.querySelector('p').textContent=copy;returnFocus=button;giftDialog.style.setProperty('display','block','important');giftDialog.showModal();
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('button[data-campus-season],button[data-campus-motion],button[data-gift]');if(!b)return;
  if(b.hasAttribute('data-campus-season')){season=season==='christmas'?'classic':'christmas';try{localStorage.setItem('fds-season',season);}catch{}sync();}
  else if(b.hasAttribute('data-campus-motion')){paused=!paused;try{localStorage.setItem('fds-season-paused',String(paused));}catch{}sync();}
  else gift(b.dataset.gift,b);
 });
 function decorate(){
  const sample=document.querySelector('#inicio>.bauble-row');
  if(!sample)return;
  for(const id of ['areas','laboratorios','almanaque','horario-clases','noticias','motivacion','video-motivador','campusStores','registro']){
   const section=document.getElementById(id);if(!section||section.querySelector(':scope>.section-season-banner'))continue;
   const row=document.createElement('div');row.className='section-season-banner';row.setAttribute('aria-hidden','true');row.append(sample.cloneNode(true));
   row.insertAdjacentHTML('beforeend','<svg class="section-santa" viewBox="0 0 140 185"><use href="#campusSanta"/></svg>');section.prepend(row);
  }
 }
 function init(){decorate();sync();
  document.querySelectorAll('.topbar .fds-brand-image,.site-footer .fds-brand-image,.admin-sidebar .fds-brand-image,.cm-brand img').forEach(image=>{image.src=nightLogo;});
  const title=document.getElementById('heroTitleText');
  const formatDefaultTitle=()=>{if(title&&/^FDS SMART CAMPUS\s+CIENCIA E INNOVACIÓN$/i.test(title.textContent.trim())){title.replaceChildren(document.createTextNode('Ciencia e '),document.createElement('br'));const emphasis=document.createElement('span');emphasis.textContent='innovación.';title.append(emphasis);}};
  if(title){formatDefaultTitle();new MutationObserver(formatDefaultTitle).observe(title,{childList:true,characterData:true,subtree:true});}
  // The institutional module creates additional sections at DOMContentLoaded.
  document.addEventListener('campus:route',decorate);
  const host=document.getElementById('vistaPublica');if(host)new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.matches('section'))))decorate();}).observe(host,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
