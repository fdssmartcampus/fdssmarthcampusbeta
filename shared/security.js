/* Controles del navegador; la autorización sigue a cargo de las políticas RLS. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CampusSecurity=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const sameSession=(expected,current)=>(expected?.access_token||null)===(current?.access_token||null);
 const isIdle=(last,now,limit=30*60*1000)=>Number.isFinite(last)&&Number.isFinite(now)&&now-last>=limit;
 return Object.freeze({sameSession,isIdle});
});
