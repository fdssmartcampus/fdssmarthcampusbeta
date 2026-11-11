'use strict';
// Presentation only. Auth, routes, forms and data remain owned by the campus.
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const active=new WeakMap();
 function stop(node){const effect=active.get(node);effect?.kill?.();effect?.cancel?.();active.delete(node);}
 function screen(node){
  if(!node||!node.getClientRects().length)return;
  const target=node.querySelector(':scope > .wrap')||node.querySelector('.sec-title-wrap,.cm-greeting,.institutional-heading')||node;
  stop(target);
  if(reduced.matches)return;
  if(window.gsap){active.set(target,gsap.fromTo(target,{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:.55,ease:'power2.out',clearProps:'transform,opacity,visibility',overwrite:true}));}
  else if(target.animate)active.set(target,target.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'}));
 }
 function open(drawer,fresh=true){
  stop(drawer);
  const children=[drawer.querySelector('.cm-drawer-head'),...drawer.querySelectorAll('.cm-menu-list > .cm-menu-row,.cm-menu-list > .cm-menu-disclosure > summary')].filter(Boolean);
  window.gsap?.killTweensOf(children);
  if(reduced.matches){drawer.style.removeProperty('opacity');drawer.style.removeProperty('transform');return;}
  if(window.gsap){
   const tl=gsap.timeline();
   if(fresh)gsap.set(drawer,{autoAlpha:.2,y:-24});
   tl.to(drawer,{autoAlpha:1,y:0,duration:.3,ease:'power3.out',clearProps:'transform,opacity,visibility'});
   if(fresh)tl.fromTo(children,{opacity:0,y:12},{opacity:1,y:0,duration:.26,stagger:.035,ease:'power2.out',clearProps:'opacity,transform'},.07);
   active.set(drawer,tl);
  }else if(drawer.animate)active.set(drawer,drawer.animate([{opacity:.2,transform:'translateY(-24px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'}));
 }
 function close(drawer,done,immediate=false){
  stop(drawer);
  window.gsap?.killTweensOf([...drawer.querySelectorAll('.cm-menu-row,summary,.cm-drawer-head')]);
  if(immediate||reduced.matches){done();return;}
  if(window.gsap)active.set(drawer,gsap.to(drawer,{opacity:0,y:-16,duration:.18,ease:'power2.out',onComplete:done,overwrite:true}));
  else if(drawer.animate){const effect=drawer.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-16px)'}],{duration:180,easing:'ease-out'});active.set(drawer,effect);effect.finished.then(done).catch(()=>{});}
  else done();
 }
 function clear(drawer){stop(drawer);drawer.style.removeProperty('opacity');drawer.style.removeProperty('visibility');drawer.style.removeProperty('transform');}
 function disclosure(details){
  const content=details.querySelector(':scope > div');if(!content)return;
  const wasOpen=details.open,opening=content.dataset.motionOpen?content.dataset.motionOpen!=='true':!wasOpen;
  stop(content);content.dataset.motionOpen=String(opening);
  if(reduced.matches){details.open=opening;content.style.removeProperty('height');content.style.removeProperty('overflow');content.style.removeProperty('opacity');delete content.dataset.motionOpen;return;}
  // Measure once. Only this small accordion changes height; page motion uses transforms.
  if(opening)details.open=true;
  const height=wasOpen?content.getBoundingClientRect().height:0,fullHeight=content.scrollHeight;
  content.style.overflow='hidden';
  const finish=()=>{details.open=opening;content.style.removeProperty('height');content.style.removeProperty('overflow');content.style.removeProperty('opacity');delete content.dataset.motionOpen;};
  if(window.gsap)active.set(content,gsap.fromTo(content,{height,opacity:opening?0:1},{height:opening?fullHeight:0,opacity:opening?1:0,duration:.24,ease:'power2.out',onComplete:finish,overwrite:true}));
  else if(content.animate){const effect=content.animate([{height:height+'px',opacity:opening?0:1},{height:(opening?fullHeight:0)+'px',opacity:opening?1:0}],{duration:240,easing:'ease-out'});active.set(content,effect);effect.finished.then(finish).catch(()=>{});}
  else finish();
 }
 window.CampusMotion={screen,open,close,clear,disclosure};
 document.addEventListener('campus:route',event=>{
  if(document.body.classList.contains('cm-device'))return;
  requestAnimationFrame(()=>screen(document.getElementById(event.detail.target)||document.getElementById(event.detail.route)));
 });
})();

