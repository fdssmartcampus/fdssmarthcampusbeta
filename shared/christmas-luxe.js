'use strict';
// Reusable Christmas trim. No content, credentials, records or permissions change.
(()=>{
 const watched=new WeakSet();
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.dataset.seasonVisible=String(isIntersecting)),{rootMargin:'60px'}):null;
 function watch(node){if(watched.has(node))return;watched.add(node);if(observer)observer.observe(node);else node.dataset.seasonVisible='true';}
 function evergreen(){
  let needles='';
  for(let i=0;i<17;i++){
   const x=18+i*16,y=11+i*.55;
   needles+=`<path d="M${x} ${y}l-19 -9m19 9l-17 11m25 -10l-17 -13m17 13l-13 13"/>`;
  }
  const branch=needles;
  // A small vector bough frames the photoreal baubles without covering headings.
  return `<svg class="campus-evergreen" viewBox="0 0 1200 55" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#49775e" stroke-width="2.2" stroke-linecap="round"><path d="M0 7q150 21 320 15M880 22q170 6 320-15" stroke="#9c8950"/><g>${branch}</g><g transform="translate(1200 0) scale(-1 1)">${branch}</g></g><g fill="#b34b4f"><circle cx="72" cy="18" r="3"/><circle cx="145" cy="25" r="3.5"/><circle cx="1128" cy="18" r="3"/><circle cx="1055" cy="25" r="3.5"/></g></svg>`;
 }
 const collections={
  inicio:[4,0,8,3,11,6], areas:[7,10,5,12,2,9], laboratorios:[8,1,11,0,6,10],
  almanaque:[12,3,9,7,4,8], 'horario-clases':[6,11,2,5,10,12], noticias:[9,4,7,1,12,0],
  motivacion:[5,3,6,10,8,2], 'video-motivador':[11,6,4,12,9,1], campusStores:[10,7,9,4,5,12],
  registro:[2,5,11,8,3,6], campusMobileHome:[4,5,12,2], login:[6,3,10,4],
  footer:[12,3,0,8], menu:[4,8,11,6]
 };
 function modelsFor(key,count){
  if(collections[key])return collections[key].slice(0,count);
  let seed=Array.from(key).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);
  const models=Array.from({length:13},(_,i)=>i);
  for(let i=models.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[models[i],models[j]]=[models[j],models[i]];}
  return models.slice(0,count);
 }
 function garland(count=6,compact=false,key='inicio'){
  const models=modelsFor(key,count);
  const sizes=compact?[68,77,67,74]:[104,118,99,112,103,115];
  const drops=compact?[9,18,7,15]:[18,33,10,27,14,31];
  return evergreen()+`<span class="campus-gold-cord"></span>`+Array.from({length:count},(_,i)=>`<span class="campus-ornament" data-ornament="${i}" data-ornament-model="${models[i]}" style="--ornament-x:${(i+.5)*100/count}%;--ornament-size:${sizes[i%sizes.length]}px;--ornament-drop:${drops[i%drops.length]}px;--ornament-delay:${-i*.71}s;--ornament-period:${5.7+i*.45}s"><i class="campus-ornament-sprite campus-ornament-${models[i]}"></i><i class="campus-ornament-glint"></i></span>`).join('')+Array.from({length:8},(_,i)=>`<i class="campus-trim-light" style="left:${5+i*12.8}%;--light-delay:${-i*.6}s"></i>`).join('');
 }
 function trim(host,compact=false){
  let banner=host.querySelector(':scope > .section-season-banner,:scope > .campus-luxe-trim');
  if(banner?.dataset.luxeReady)return;
  if(!banner){banner=document.createElement('div');host.prepend(banner);}
  banner.className='section-season-banner campus-luxe-trim'+(compact?' campus-luxe-compact':'');banner.dataset.luxeReady='true';banner.setAttribute('aria-hidden','true');banner.innerHTML=garland(compact?4:6,compact,host.id||'footer');watch(banner);
 }
 function decorate(){
  document.querySelectorAll('#inicio > .bauble-row,#modalLogin .modal-box > .bauble-row').forEach(row=>{
   if(row.dataset.luxeReady)return;
   const compact=!!row.closest('#modalLogin');row.classList.add('campus-luxe-hanging');row.dataset.luxeReady='true';row.setAttribute('aria-hidden','true');row.innerHTML=garland(compact?4:6,compact,compact?'login':'inicio');watch(row);
  });
  for(const id of ['areas','laboratorios','almanaque','horario-clases','noticias','motivacion','video-motivador','campusStores','registro','campusMobileHome']){const host=document.getElementById(id);if(host)trim(host,id==='campusMobileHome');}
  document.querySelectorAll('.admin-content > .panel-tab').forEach(host=>trim(host,true));
  const footer=document.querySelector('.site-footer');if(footer)trim(footer,true);
  const drawer=document.getElementById('cmDrawer');
  if(drawer&&!drawer.querySelector('.campus-drawer-season')){const band=document.createElement('div');band.className='campus-drawer-season';band.setAttribute('aria-hidden','true');band.innerHTML=garland(4,true,'menu');drawer.querySelector('.cm-drawer-head').after(band);watch(band);}
 }
 let pending=false;
 function queue(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate();});}
 function init(){
  decorate();document.addEventListener('campus:route',queue);
  new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('section,.panel-tab,#cmDrawer')||n.querySelector('.panel-tab,#cmDrawer')))))queue();}).observe(document.body,{childList:true,subtree:true});
  const visibility=()=>document.documentElement.dataset.holidayVisibility=document.hidden?'hidden':'visible';visibility();document.addEventListener('visibilitychange',visibility);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
