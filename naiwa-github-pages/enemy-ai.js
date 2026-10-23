import {DIFFICULTIES} from './world.js';
import {pursuit,lineOfSight} from './pathing.js';
import {spawnModel,armScene,beamLength} from './combat-models.js';
export const ENEMY_TYPES={eye:{role:'chaser',row:0,hp:28,speed:51,r:11,damage:12},blob:{role:'tank',row:3,hp:72,speed:29,r:17,damage:16},runner:{role:'charger',row:2,hp:25,speed:40,r:11,damage:16},shooter:{role:'ranged',row:1,hp:34,speed:28,r:12,damage:12},support:{role:'support',row:1,hp:40,speed:32,r:12,damage:10},bomber:{role:'bomber',row:0,hp:24,speed:59,r:10,damage:15},sniper:{role:'sniper',row:1,hp:32,speed:21,r:12,damage:13},splitter:{role:'splitter',row:0,hp:38,speed:43,r:13,damage:12},turret:{role:'turret',row:1,hp:42,speed:0,r:13,damage:10},familiar:{role:'familiar',row:0,hp:24,speed:64,r:9,damage:12}};
const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function bullet(g,e,a,speed=135,r=4,extra={}){const d=DIFFICULTIES[g.difficulty],shot={x:e.x,y:e.y-9,vx:Math.cos(a)*speed*d.bullets,vy:Math.sin(a)*speed*d.bullets,r,life:7,damage:(8+g.floorIndex*2)*d.damage,theme:g.floorIndex,model:['bubble','page','star'][g.floorIndex],...extra};if(e.fear>0)shot.damage*=1-(e.weaken||.15);g.hostile.push(shot);}
function fan(g,e,a,count,spread,speed=130,extra={}){for(let i=0;i<count;i++)bullet(g,e,a+(i-(count-1)/2)*spread,speed,4,extra);}
function warning(g,kind,x,y,size,time=.8,extra={}){const owner=g.enemies.find(e=>e.id===extra.source)||g.enemies.find(e=>e.kind==='boss'&&!e.dead);const h={kind,x,y,size,left:time,max:time,...extra};if(owner?.fear>0)h.damage*=1-(owner.weaken||.15);g.hazards.push(h);}
export function updateBoss(g,e,dt){const p=g.p,d=distance(e,p),a=angle(e,p),rage=e.hp<e.maxHp*.5;let vx=0,vy=0;e.phaseTime-=dt;e.attack-=dt;e.anim+=dt;e.rage=rage;e.breakLock=Math.max(0,(e.breakLock||0)-dt);
 if(e.phase==='broken'){if(e.phaseTime<=0){e.phase='recover';e.phaseTime=.6;}return {vx:0,vy:0};}
 if(e.phase==='charge'){vx=e.tx*e.chargeSpeed;vy=e.ty*e.chargeSpeed;if(e.phaseTime<=0){if(e.bossId==='Deepseek'&&e.chainCharges>0){e.chainCharges--;e.phase='windup';e.phaseTime=.75;e.tx=Math.cos(a);e.ty=Math.sin(a);}else{e.phase='recover';e.phaseTime=1.15;}}}
 else if(e.phase==='recover'){if(e.phaseTime<=0){e.phase='walk';e.attack=.45;}}
 else if(e.phase==='windup'){if(e.phaseTime<=0){const pattern=e.pattern;
  if(pattern===3){armScene(g);for(let i=0;i<(rage?2:1);i++)if(g.enemies.filter(x=>x.role==='turret'&&!x.dead).length+i<3)g.pendingSummons.push({kind:'turret',x:Math.max(80,Math.min(880,e.x+(i?100:-100))),y:Math.max(100,Math.min(450,e.y+85))});e.phase='recover';e.phaseTime=1.45;}
  else if(e.bossId==='Deepseek'){
   if(pattern===0){fan(g,e,e.targetAngle,5+(rage?2:0),.18,145);e.phase='recover';e.phaseTime=1.05;}
   else if(pattern===1){spawnModel(g,'whale',e.x,e.y,e.targetAngle);if(rage)for(const off of [-.48,.48])spawnModel(g,'whale',e.x,e.y,e.targetAngle+off,{r:18});e.phase='recover';e.phaseTime=1.35;}
   else{e.phase='charge';e.phaseTime=.85;e.chargeSpeed=310;}
  }else if(e.bossId==='Claude'){
   if(pattern===0){fan(g,e,e.targetAngle,7,.17,145);e.phase='recover';e.phaseTime=1.1;}
   else if(pattern===1){for(const q of e.targetPoints)warning(g,'blast',q.x,q.y,46,.95,{damage:18,theme:1,color:'#e19a67'});e.phase='recover';e.phaseTime=1.45;}
   else{for(const off of [-.32,0,.32])spawnModel(g,'fireOrb',e.x,e.y,e.targetAngle+off);e.phase='recover';e.phaseTime=1.2;}
  }else{
   if(pattern===0){for(let i=0;i<22;i++){const b=i*Math.PI/11;if(Math.abs(Math.atan2(Math.sin(b-e.targetAngle),Math.cos(b-e.targetAngle)))<.4)continue;bullet(g,e,b,115,4);}e.phase='recover';e.phaseTime=1.15;}
   else if(pattern===1){e.x=e.teleport.x;e.y=e.teleport.y;spawnModel(g,'dragon',e.x,e.y,angle(e,p));if(rage)g.pendingSummons.push({kind:'familiar',x:e.x+70,y:e.y});e.phase='recover';e.phaseTime=1.3;}
   else{warning(g,'beam',e.x,e.y,13,.95,{angle:e.targetAngle,length:beamLength(g,e,e.targetAngle),damage:22,theme:2,color:'#c8b0fa'});e.phase='recover';e.phaseTime=1.55;}
  }
 }}else{
  if(e.attack<=0){e.cycle++;e.pattern=e.cycle%4;e.chainCharges=e.bossId==='Deepseek'&&rage&&e.pattern===2?1:0;e.phase='windup';e.phaseTime=e.pattern===3?1.35:e.pattern===2?1.05:.9;e.targetAngle=a;e.tx=Math.cos(a);e.ty=Math.sin(a);e.targetPoints=[{x:p.x,y:p.y},{x:Math.max(90,Math.min(870,p.x+110)),y:Math.max(100,Math.min(450,p.y-70))}];if(rage&&e.bossId==='Claude')e.targetPoints.push({x:Math.max(90,p.x-110),y:Math.min(450,p.y+70)});e.teleport={x:Math.max(100,Math.min(860,p.x+(p.x<480?220:-220))),y:Math.max(115,Math.min(440,p.y+(p.y<280?125:-125)))};
   if(e.bossId==='Astra'&&e.pattern===1)warning(g,'teleport',e.teleport.x,e.teleport.y,35,.9,{damage:0,theme:2,color:'#c8b0fa'});
   if(e.pattern===3)g.events.push('mechanism');
  }else{const target={x:490+Math.cos(g.time*.35)*200,y:195+Math.sin(g.time*.45)*65},dd=distance(e,target)||1;vx=(target.x-e.x)/dd*31;vy=(target.y-e.y)/dd*31;}
 }
 return {vx,vy};}
export function updateEnemyAI(g,e,dt){if(e.kind==='boss')return updateBoss(g,e,dt);const p=g.p,d=distance(e,p),a=angle(e,p),role=e.role;e.attack-=dt;e.phaseTime-=dt;e.anim+=dt;let {vx,vy}=pursuit(g,e,e.speed);e.facing=p.x>e.x?1:-1;
 if(role==='ranged'||role==='sniper'||role==='turret'){
  if(role==='turret'){vx=vy=0;}else if(d<170){vx=-Math.cos(a)*e.speed*.6;vy=-Math.sin(a)*e.speed*.6;}else if(d<330){vx=vy=0;}
  if(e.phase==='windup'){vx=vy=0;if(e.phaseTime<=0){fan(g,e,e.targetAngle,role==='sniper'?1:role==='turret'?5:3,.18,role==='sniper'?245:140,{damage:(role==='sniper'?15:9)*DIFFICULTIES[g.difficulty].damage});e.phase='recover';e.phaseTime=.65;e.attack=role==='sniper'?3.8:2.8;}}
  else if(e.phase==='recover'){vx=vy=0;if(e.phaseTime<=0)e.phase='walk';}
  else if(e.attack<=0&&lineOfSight(g,e,p)){e.phase='windup';e.phaseTime=role==='sniper'?.95:.65;e.targetAngle=Math.atan2(p.y+(p.moving?p.dy:0)*d*.28-e.y,p.x+(p.moving?p.dx:0)*d*.28-e.x);e.tx=Math.cos(e.targetAngle);e.ty=Math.sin(e.targetAngle);}
 }
 if(role==='charger'){
  if(e.phase==='windup'){vx=vy=0;if(e.phaseTime<=0){e.phase='charge';e.phaseTime=.48;}}
  else if(e.phase==='charge'){vx=e.tx*245;vy=e.ty*245;if(e.phaseTime<=0){e.phase='recover';e.phaseTime=.9;e.attack=2.8;}}
  else if(e.phase==='recover'){vx=vy=0;if(e.phaseTime<=0)e.phase='walk';}
  else if(e.attack<=0&&d<430){e.phase='windup';e.phaseTime=.72;e.tx=Math.cos(a);e.ty=Math.sin(a);}
 }
 if(role==='tank'){e.guard=e.phase!=='recover';if(d<125&&e.attack<=0){e.phase='windup';e.phaseTime=.8;e.attack=4;}if(e.phase==='windup'){vx=vy=0;if(e.phaseTime<=0){warning(g,'blast',e.x,e.y,70,.45,{damage:17,color:'#e2c48c',source:e.id});e.phase='recover';e.phaseTime=1.2;}}if(e.phase==='recover'&&e.phaseTime<=0)e.phase='walk';}
 if(role==='support'){if(d<230){vx=-Math.cos(a)*e.speed;vy=-Math.sin(a)*e.speed;}e.link=null;if(e.attack<=0){const ally=g.enemies.filter(x=>!x.dead&&x.id!==e.id&&x.role!=='support'&&x.kind!=='boss'&&x.hp<x.maxHp&&distance(e,x)<220).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(ally){ally.hp=Math.min(ally.maxHp,ally.hp+10);e.link={x:ally.x,y:ally.y,left:.4};e.attack=3;}else e.attack=1;}}
 if(role==='bomber'&&d<65&&e.phase!=='windup'){e.phase='windup';e.phaseTime=.9;e.tx=e.x;e.ty=e.y;}if(role==='bomber'&&e.phase==='windup'){vx=vy=0;if(e.phaseTime<=0){warning(g,'blast',e.x,e.y,65,.15,{damage:18,color:'#efaa67'});e.exploded=true;e.hp=0;e.dead=true;g.deaths.push({...e,life:.3,max:.3});g.events.push('shatter');}}
 const slow=e.chill>0?.45:e.slow>0?.65:1;vx*=slow;vy*=slow;return {vx,vy};}
