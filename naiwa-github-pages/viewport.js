// Safari's visible viewport shrinks when its address and bottom bars are shown.
function fitViewport(){
 const view=window.visualViewport,root=document.documentElement;
 root.style.setProperty('--visible-height',`${Math.round(view?.height||window.innerHeight)}px`);
 root.style.setProperty('--visible-width',`${Math.round(view?.width||window.innerWidth)}px`);
}
fitViewport();window.addEventListener('resize',fitViewport,{passive:true});
window.addEventListener('orientationchange',fitViewport,{passive:true});
window.visualViewport?.addEventListener('resize',fitViewport,{passive:true});
