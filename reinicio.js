'use strict';
// Retira únicamente datos locales y registros de esta versión del campus.
(async()=>{
 const base=new URL('./',document.currentScript.src);
 const oldKey=key=>key.startsWith('fds-mi-campus:')||key.startsWith('fds-app-auth-v1')||key.startsWith('fds-app-signup-temporal');
 for(const name of ['localStorage','sessionStorage']){
  try{const storage=window[name];for(const key of Object.keys(storage)){if(oldKey(key))storage.removeItem(key);}}catch{}
 }
 if('caches' in window){try{for(const key of await caches.keys()){if(key.startsWith('fds-campus-pwa-'))await caches.delete(key);}}catch{}}
 if('serviceWorker' in navigator){try{for(const registration of await navigator.serviceWorker.getRegistrations()){
  if(registration.scope===base.href){try{await registration.update();}catch{await registration.unregister();}}
 }}catch{}}
})();
