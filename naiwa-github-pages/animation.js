export const WALK_FRAME_COUNT=8,IDLE_FRAME=8;
export const CHARACTER_FRAME_SIZE=176,CHARACTER_BODY_HEIGHT=144,CHARACTER_BASELINE=160;
export const CHARACTER_ATLAS_OPTIONS={frameSize:CHARACTER_FRAME_SIZE,bodyHeight:CHARACTER_BODY_HEIGHT,baseline:CHARACTER_BASELINE,logicalSize:384,isolateFigure:true};
export const backingScale=(width,dpr=1)=>Math.max(1,Math.min(3,Math.ceil(width/960*dpr)));
export const characterState=p=>p.laughLeft>0?'laugh':p.moving>.04?'walk':'idle';
export const walkFrame=p=>p.moving>.04?Math.floor(p.walk)%WALK_FRAME_COUNT:0;
// All motion cells face left; one shared atlas is mirrored for right-facing poses.
// Index 8 is the planted idle, so stopping never changes face or direction.
export const locomotionFrame=p=>characterState(p)==='walk'?walkFrame(p):IDLE_FRAME;
export const laughFrame=p=>Math.floor(p.laughElapsed*9)%4;
export const LAUGH_INTRO_DURATION=.14,LAUGH_RECOVERY_DURATION=.2;
export function advanceLaughPose(p,dt,duration=3.2){
 p.laughRecovery=Math.max(0,(p.laughRecovery||0)-dt);
 if(p.laughLeft>0){p.laughLeft=Math.max(0,p.laughLeft-dt);p.laughElapsed=duration-p.laughLeft;if(p.laughLeft===0)p.laughRecovery=LAUGH_RECOVERY_DURATION;}
}
export function heroPose(p){
 if(p.laughLeft>0){if(p.laughElapsed<LAUGH_INTRO_DURATION)return {atlas:'motion',index:p.laughElapsed<LAUGH_INTRO_DURATION/2?9:10,phase:'anticipation'};return {atlas:'laugh',index:laughFrame(p),phase:'laugh'};}
 if(p.laughRecovery>0)return {atlas:'motion',index:p.laughRecovery>.11?9:11,phase:'recovery'};
 return {atlas:'motion',index:locomotionFrame(p),phase:characterState(p)};
}
// Align sprite-sheet cells to their feet. All poses share one scale so a laugh
// contraction stays a contraction instead of being stretched to a fixed height.
export class SpriteAtlas{
 constructor(src,columns=1,rows=1,options={}){this.frames=[];this.options=options;this.image=new Image();this.ready=new Promise(resolve=>{this.image.onload=()=>{this.prepare(columns,rows);resolve(true);};this.image.onerror=()=>resolve(false);});this.image.src=src;}
 prepare(columns,rows){const im=this.image,cw=im.naturalWidth/columns,ch=im.naturalHeight/rows,body=this.options.bodyOnly,size=this.options.frameSize||(body?144:88),logical=this.options.logicalSize||(body?256:192);const poses=[];
 for(let i=0;i<(body?columns:columns*rows);i++){const probe=document.createElement('canvas');probe.width=logical;probe.height=Math.round(logical*ch/cw);const ctx=probe.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(im,(i%columns)*cw,Math.floor(i/columns)*ch,cw,ch,0,0,probe.width,probe.height);let pixels=ctx.getImageData(0,0,probe.width,probe.height);const {data}=pixels,w=probe.width,h=probe.height;
 if(body||this.options.isolateFigure){const seen=new Uint8Array(w*h);let largest=[];for(let at=0;at<w*h;at++){if(seen[at]||data[at*4+3]<175)continue;const group=[at];seen[at]=1;for(let q=0;q<group.length;q++){const n=group[q],x=n%w,y=Math.floor(n/w);for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){const nn=yy*w+xx;if(!seen[nn]&&data[nn*4+3]>=175){seen[nn]=1;group.push(nn);}}}if(group.length>largest.length)largest=group;}const keep=new Uint8Array(w*h);for(const n of largest)keep[n]=1;for(let n=0;n<w*h;n++)if(!keep[n])data[n*4+3]=0;ctx.putImageData(pixels,0,0);}
 const rc=new Uint16Array(h),cc=new Uint16Array(w);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>195){rc[y]++;cc[x]++;}let l=0,r=w-1,t=0,b=h-1;while(l<r&&cc[l]<2)l++;while(r>l&&cc[r]<2)r--;while(t<b&&rc[t]<2)t++;while(b>t&&rc[b]<2)b--;let sum=0,n=0;for(let y=Math.floor(b-(b-t)*.1);y<=b;y++)for(let x=l;x<=r;x++)if(data[(y*w+x)*4+3]>195){sum+=x;n++;}poses.push({probe,l,t,w:r-l+1,h:b-t+1,anchor:(n?sum/n:(l+r)/2)-l});}
 if(this.options.steadyWalk){const idle=poses[IDLE_FRAME],headAnchor=p=>{const data=p.probe.getContext('2d').getImageData(0,0,p.probe.width,p.probe.height).data;let sum=0,n=0;for(let y=p.t;y<p.t+p.h*.2;y++)for(let x=p.l;x<p.l+p.w;x++)if(data[(y*p.probe.width+x)*4+3]>195){sum+=x;n++;}return (n?sum/n:p.l+p.w/2)-p.l;};const offset=idle.anchor-headAnchor(idle);for(const p of poses.slice(0,IDLE_FRAME+1))p.anchor=headAnchor(p)+offset;}
 const scale=Math.min((this.options.bodyHeight||72)/Math.max(...poses.map(p=>p.h)),(size-16)/Math.max(...poses.map(p=>p.w)));this.frames=poses.map(p=>{const frame=document.createElement('canvas');frame.width=frame.height=size;const c=frame.getContext('2d');c.imageSmoothingEnabled=false;const baseline=this.options.baseline||(body?112:80);c.drawImage(p.probe,p.l,p.t,p.w,p.h,Math.round(size/2-p.anchor*scale),Math.round(baseline-p.h*scale),Math.round(p.w*scale),Math.round(p.h*scale));const pixels=c.getImageData(0,0,size,size);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]<200?0:255;c.putImageData(pixels,0,0);return frame;});
 }
}
