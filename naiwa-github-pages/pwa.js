import {label} from './ui.js';
const $=id=>document.getElementById(id);
export function initAppMode({beforeUpdate=()=>true}={}){
 let deferredInstall=null,registration=null,reloading=false,updating=false;
 const status=(text)=>{$('offlineStatus').textContent=text;};
 const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 function installation(){if(installed()){$('installStatus').textContent='已在独立游戏窗口中。横屏即可游玩。';$('appBtn').innerHTML=label('app','应用');$('installAppBtn').classList.add('hidden');}}
 installation();matchMedia('(display-mode: standalone)').addEventListener?.('change',installation);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(!installed())$('installAppBtn').classList.remove('hidden');});
 window.addEventListener('appinstalled',()=>{deferredInstall=null;$('installAppBtn').classList.add('hidden');$('installStatus').textContent='已添加到主屏幕，请从奶蛙图标打开。';});
 $('installAppBtn').onclick=async()=>{if(!deferredInstall)return;const prompt=deferredInstall;deferredInstall=null;$('installAppBtn').classList.add('hidden');try{await prompt.prompt();await prompt.userChoice;}catch{$('installStatus').textContent='请从浏览器菜单选择“安装应用”或“添加到主屏幕”。';}};
 if(!('serviceWorker' in navigator)||!window.isSecureContext){status('当前浏览器不支持离线缓存。请使用 HTTPS 网址在 Safari / Chrome 打开。');$('cacheGameBtn').disabled=true;return;}
 function updateReady(){if(registration?.waiting){$('applyUpdateBtn').classList.remove('hidden');$('applyUpdateBtn').innerHTML=label('refresh','新版已备妥 · 保存并更新');}}
 navigator.serviceWorker.addEventListener('message',({data})=>{if(!data||data.type!=='OFFLINE_PROGRESS')return;const value=data.total?Math.round(data.done/data.total*100):0;$('offlineProgress').value=value;
  if(data.error){status('资源暂未全部缓存，请联网后点“重试准备”。');$('cacheGameBtn').disabled=false;$('cacheGameBtn').innerHTML=label('save','重试准备');}
  else if(data.done===data.total&&data.total>0){status('离线资源已就绪 · 可断网游玩');$('cacheGameBtn').disabled=false;$('cacheGameBtn').innerHTML=label('save','检查离线资源');updateReady();}
  else{status(`正在准备离线资源 ${value}%（${data.done} / ${data.total}）`);$('cacheGameBtn').disabled=true;}
 });
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating&&!reloading){reloading=true;location.reload();}});
 function listen(reg){registration=reg;updateReady();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed')updateReady();});});}
 async function register(){status('正在准备离线实验室…');$('cacheGameBtn').disabled=true;try{listen(await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}));const ready=await navigator.serviceWorker.ready;ready.active?.postMessage({type:'PREPARE_OFFLINE'});}catch{status('离线准备未完成，请联网后重试。');$('cacheGameBtn').disabled=false;}}
 $('cacheGameBtn').onclick=()=>{if(registration?.active){$('cacheGameBtn').disabled=true;status('正在检查离线资源…');registration.active.postMessage({type:'PREPARE_OFFLINE'});}else register();};
 $('applyUpdateBtn').onclick=()=>{if(!registration?.waiting)return;if(!beforeUpdate()){status('暂存失败，未更新游戏。请先返回游戏保存进度。');return;}updating=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
 window.addEventListener('online',()=>{registration?.update().catch(()=>{});registration?.active?.postMessage({type:'PREPARE_OFFLINE'});});
 register();
}
