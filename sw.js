/* A complete, versioned game is activated together: no mixing old art/code. */
importScripts('./offline-assets.js');
const {version,files}=self.NAIWA_OFFLINE;
const PREFIX='naiwa-ai-offline-',CACHE=PREFIX+version;
const base=new URL('./',self.location.href),indexURL=new URL('index.html',base).href;
const allowed=new Set(files.map(path=>new URL(path,base).href));
let preparing=null;
async function notify(done,error=false){const clients=await self.clients.matchAll({includeUncontrolled:true,type:'window'});for(const client of clients)client.postMessage({type:'OFFLINE_PROGRESS',done,total:files.length,error,version});}
async function validResponse(response,url){if(!response.ok||response.redirected||response.type==='opaque')return false;if(response.url&&response.url!==url)return false;if(url!==indexURL&&response.headers.get('content-type')?.includes('text/html'))return false;if(url===indexURL){const html=await response.clone().text();return html.includes('<title>奶蛙大战ai</title>')&&html.includes('manifest.webmanifest');}return true;}
async function prepare(){
 if(preparing)return preparing;
 preparing=(async()=>{const cache=await caches.open(CACHE);let done=0;await notify(done);try{for(const path of files){const url=new URL(path,base).href;if(!await cache.match(url)){const response=await fetch(url,{cache:'no-cache',credentials:'same-origin'});if(!await validResponse(response,url))throw Error('Game resource unavailable');await cache.put(url,response);}done++;await notify(done);}return true;}catch(error){await notify(done,true);throw error;}})();
 try{return await preparing;}finally{preparing=null;}
}
self.addEventListener('install',event=>event.waitUntil((async()=>{await prepare();if(!self.registration.active)await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();await notify(files.length);})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());if(event.data?.type==='PREPARE_OFFLINE')event.waitUntil(prepare().catch(()=>{}));});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==base.origin)return;
 // Only the actual game entry and explicit game resources are handled.
 const entry=request.mode==='navigate'&&(url.pathname===base.pathname||url.pathname===new URL(indexURL).pathname);
 const resource=new URL(url.pathname,base.origin).href;
 if(!entry&&!allowed.has(resource))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(entry?indexURL:resource);return cached||fetch(request);})());
});
