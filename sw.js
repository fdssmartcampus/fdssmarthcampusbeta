'use strict';
// Retirada definitiva del trabajador y de la caché de la aplicación anterior.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const base=new URL('./',self.location.href);
 for(const key of await caches.keys()){if(key.startsWith('fds-campus-pwa-'))await caches.delete(key);}
 await self.clients.claim();
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 await self.registration.unregister();
 await Promise.allSettled(windows.filter(client=>{const url=new URL(client.url);return url.origin===base.origin&&url.pathname.startsWith(base.pathname);}).map(client=>client.navigate(base.href)));
})()));
