'use strict';
(()=>{
 window.lucide?.createIcons();
 const menu=document.getElementById('mainMenu'),burger=document.getElementById('burgerToggle');
 burger?.setAttribute('aria-expanded','false');
 burger?.addEventListener('click',()=>{const opened=menu.classList.toggle('open');burger.setAttribute('aria-expanded',String(opened));});
 menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');burger?.setAttribute('aria-expanded','false');}));
 document.querySelectorAll('.campus-top-dropdown').forEach(item=>{
  const button=item.querySelector('.campus-top-toggle'),list=item.querySelector('.campus-top-submenu');
  if(!button||!list)return;
  const expand=value=>{list.hidden=!value;button.setAttribute('aria-expanded',String(value));};
  button.addEventListener('click',()=>expand(list.hidden));
  item.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)expand(true);});
  item.addEventListener('mouseleave',()=>expand(false));
  item.addEventListener('keydown',e=>{if(e.key==='Escape'){expand(false);button.focus();}});
 });
 document.querySelector('[data-public-video]')?.addEventListener('click',()=>{const video=document.getElementById('labVideo');video?.scrollIntoView({behavior:'smooth',block:'center'});video?.play().catch(()=>{});});
 const gallery=document.getElementById('campusStudentGallery'),image=document.getElementById('campusStudentImage'),caption=document.getElementById('campusStudentCaption');
 if(!gallery||!image)return;
 const slides=[{src:image.src,alt:image.alt,title:caption?.textContent||''},{src:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=85',alt:'Celebración de graduación universitaria',title:'Formación que abre nuevas oportunidades'},{src:'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=85',alt:'Comunidad de estudiantes en un entorno académico',title:'Una comunidad conectada con su aprendizaje'}];
 let current=0,timer,playing=!matchMedia('(prefers-reduced-motion:reduce)').matches;
 const pause=document.getElementById('campusStudentPlay');
 function schedule(){clearTimeout(timer);if(playing&&!document.hidden)timer=setTimeout(()=>show(current+1),5000);}
 function show(n){current=(n+slides.length)%slides.length;image.src=slides[current].src;image.alt=slides[current].alt;if(caption)caption.textContent=slides[current].title;gallery.querySelectorAll('[data-student-index]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.studentIndex)===current)));schedule();}
 gallery.querySelectorAll('[data-student-step]').forEach(b=>b.addEventListener('click',()=>show(current+Number(b.dataset.studentStep))));
 gallery.querySelectorAll('[data-student-index]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.studentIndex))));
 pause.textContent=playing?'Ⅱ Pausar':'▶ Reproducir';pause.addEventListener('click',()=>{playing=!playing;pause.textContent=playing?'Ⅱ Pausar':'▶ Reproducir';schedule();});
 document.addEventListener('visibilitychange',schedule);schedule();
})();
