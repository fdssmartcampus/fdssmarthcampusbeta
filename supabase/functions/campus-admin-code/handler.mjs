// Passwords and service credentials never leave the server or enter logs.
export function createHandler({url, anonKey, serviceKey, fetcher=fetch}) {
 const origin='https://fdssmartcampus.github.io';
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private','Pragma':'no-cache','Vary':'Origin','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','X-Content-Type-Options':'nosniff'};
 const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers});
 const call=(path,options={})=>fetcher(url+path,{...options,signal:AbortSignal.timeout(12000)});
 const privileged={apikey:serviceKey,Authorization:'Bearer '+serviceKey,'Content-Type':'application/json'};
 async function profile(id){
  const r=await call('/rest/v1/perfiles?id=eq.'+encodeURIComponent(id)+'&select=rol,estado',{headers:privileged});
  if(!r.ok)throw Error('profile');
  const rows=await r.json(); return rows.length===1&&rows[0].rol==='administrador'&&rows[0].estado==='Aprobado';
 }
 return async req=>{
  if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply(403,{error:'Origen no permitido.'});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,{error:'Método no permitido.'});
  try {
   const auth=req.headers.get('authorization')||'';
   if(!auth.startsWith('Bearer '))return reply(401,{error:'Inicia sesión para continuar.'});
   const who=await call('/auth/v1/user',{headers:{apikey:anonKey,Authorization:auth}});
   if(!who.ok)return reply(401,{error:'La sesión no es válida.'});
   const user=await who.json();
   if(!user.id||!user.email||!await profile(user.id))return reply(403,{error:'Solo administradores aprobados.'});
   if(Number(req.headers.get('content-length')||0)>4096)return reply(413,{error:'Solicitud demasiado grande.'});
   const raw=await req.text();if(raw.length>4096)return reply(413,{error:'Solicitud demasiado grande.'});
   let body;try{body=JSON.parse(raw);}catch{return reply(400,{error:'Solicitud no válida.'});}
   if(typeof body.password!=='string'||!body.password||body.password.length>1024)return reply(400,{error:'Introduce tu contraseña de administrador.'});
   const limit=await call('/rest/v1/rpc/campus_code_attempt',{method:'POST',headers:privileged,body:JSON.stringify({p_user:user.id})});
   if(!limit.ok)throw Error('rate limit');
   if(!await limit.json())return reply(429,{error:'Demasiados intentos. Espera 15 minutos antes de volver a probar.'});
   const check=await call('/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:anonKey,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,password:body.password})});
   body.password='';
   if(!check.ok){await check.body?.cancel();return reply(403,{error:'No se pudo verificar la contraseña.'});}
   const verified=await check.json();
   if(verified.access_token)await call('/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:anonKey,Authorization:'Bearer '+verified.access_token}});
   if(verified.user?.id!==user.id||!await profile(user.id))return reply(403,{error:'No se pudo verificar el acceso.'});
   const repo='fdssmartcampus/fdssmarthcampusbeta';
   const commitResponse=await fetcher('https://api.github.com/repos/'+repo+'/commits/main',{headers:{Accept:'application/vnd.github+json','User-Agent':'FDS-Code-Viewer'},signal:AbortSignal.timeout(15000)});
   if(!commitResponse.ok)throw Error('revision');
   const commit=await commitResponse.json();const revision=commit.sha;
   if(!/^[a-f0-9]{40}$/.test(revision))throw Error('revision');
   const treeResponse=await fetcher('https://api.github.com/repos/'+repo+'/git/trees/'+revision+'?recursive=1',{headers:{Accept:'application/vnd.github+json','User-Agent':'FDS-Code-Viewer'},signal:AbortSignal.timeout(15000)});
   if(!treeResponse.ok)throw Error('repository');
   const tree=await treeResponse.json();if(tree.truncated||!Array.isArray(tree.tree)||!/^[a-f0-9]{40}$/.test(tree.sha))throw Error('tree');
   // Read only this fixed repository and one immutable revision; never arbitrary URLs.
   const entries=tree.tree.filter(e=>e.type==='blob'&&e.mode!=='120000');
   const sources=entries.filter(e=>/\.(html?|css|[cm]?js|jsx|tsx?|json|webmanifest|sql|md|txt|svg|xml|ya?ml|toml)$/i.test(e.path));
   if(sources.length>250||sources.reduce((n,e)=>n+e.size,0)>8000000)throw Error('size');
   const files=[];
   for(let i=0;i<sources.length;i+=6){
    const batch=await Promise.all(sources.slice(i,i+6).map(async e=>{
     const path=e.path.split('/').map(encodeURIComponent).join('/');
     const r=await fetcher('https://raw.githubusercontent.com/'+repo+'/'+revision+'/'+path,{signal:AbortSignal.timeout(15000)});
     if(!r.ok)throw Error('file');return {path:e.path,content:await r.text()};
    }));files.push(...batch);
   }
   return reply(200,{revision,files,assets:entries.filter(e=>!sources.includes(e)).map(e=>e.path)});
  }catch{return reply(503,{error:'No se pudo abrir el código. Inténtalo de nuevo más tarde.'});}
 };
}
