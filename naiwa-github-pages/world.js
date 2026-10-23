export const DIFFICULTIES={easy:{name:'简单',floors:1,hp:.78,speed:.9,damage:.78,bullets:.88,count:-2},normal:{name:'中等',floors:2,hp:1,speed:1,damage:1,bullets:1,count:0},hard:{name:'困难',floors:3,hp:1.18,speed:1.07,damage:1.2,bullets:1.12,count:2}};
export const THEMES=[{id:'deepsea',name:'深海演算舱',boss:'Deepseek',color:'#75d6f2',floor:'#152a3a',accent:'#306c87'},{id:'archive',name:'余烬档案馆',boss:'Claude',color:'#f0b27c',floor:'#30251e',accent:'#80583c'},{id:'astral',name:'星穹龙庭',boss:'Astra',color:'#c9b1ff',floor:'#25213a',accent:'#67558d'}];
export const FLOOR_NAMES=THEMES.map(t=>t.name);
export const ROOMS_PER_FLOOR=6;
export const ROOM_TYPES={elite:{name:'精英房',icon:'♛',color:'#e69476'},monster:{name:'怪物房',icon:'✦',color:'#d99d80'},fountain:{name:'治疗泉水',icon:'≈',color:'#8dc9c3'},shop:{name:'商店',icon:'¤',color:'#e3ca83'},event:{name:'奇遇',icon:'?',color:'#b7a5dc'},boss:{name:'守卫房',icon:'♜',color:'#ee8d74'}};
const shuffle=(a,r)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function generateFloor(rand,index){
 const types=[['monster'],shuffle(['monster','shop','event'],rand),shuffle(['fountain','monster','event','monster'],rand),shuffle(['monster','shop','event','elite'],rand),shuffle(['monster','fountain','elite'],rand),['boss']];
 const layers=types.map((kinds,depth)=>kinds.map((type,lane)=>({id:`${index}-${depth}-${lane}`,depth,lane,type,next:[],visited:false,cleared:false,variant:Math.floor(rand()*6),seed:Math.floor(rand()*1e8)})));
 for(let d=0;d<layers.length-1;d++){const a=layers[d],b=layers[d+1];const link=(x,y)=>{if(!x.next.includes(y.id))x.next.push(y.id);};for(let i=0;i<a.length;i++){const at=a.length===1?1:i/(a.length-1),j=Math.round(at*(b.length-1));link(a[i],b[j]);if(a.length===1)b.forEach(n=>link(a[i],n));else if(b.length>1){const near=Math.max(0,Math.min(b.length-1,j+(rand()<.5?-1:1)));link(a[i],b[near]);}}for(let j=0;j<b.length;j++){if(!a.some(n=>n.next.includes(b[j].id))){const i=Math.round(j/Math.max(1,b.length-1)*(a.length-1));link(a[i],b[j]);}}}
 return {index,name:FLOOR_NAMES[index],layers,nodes:layers.flat()};
}
export function roomObstacles(variant=0,boss=false,floor=0){
 const layouts=[
  [[{x:160,y:135,w:200,h:38},{x:320,y:173,w:40,h:145},{x:600,y:315,w:190,h:44},{x:715,y:165,w:42,h:80}],
   [{x:180,y:180,w:44,h:210},{x:224,y:350,w:160,h:40},{x:580,y:130,w:220,h:40},{x:650,y:250,w:44,h:140}],
   [{x:145,y:135,w:100,h:100},{x:315,y:350,w:210,h:42},{x:660,y:175,w:130,h:42},{x:710,y:217,w:42,h:160}],
   [{x:210,y:140,w:40,h:170},{x:250,y:140,w:150,h:40},{x:595,y:335,w:230,h:40},{x:595,y:220,w:40,h:115}],
   [{x:170,y:240,w:190,h:42},{x:320,y:282,w:40,h:115},{x:570,y:145,w:40,h:190},{x:610,y:145,w:150,h:40}],
   [{x:140,y:150,w:160,h:44},{x:380,y:350,w:42,h:100},{x:575,y:140,w:150,h:44},{x:760,y:270,w:42,h:160}]],
  [[{x:155,y:125,w:250,h:35},{x:155,y:160,w:35,h:195},{x:590,y:205,w:195,h:35},{x:650,y:355,w:35,h:100},{x:320,y:375,w:130,h:35}],
   [{x:160,y:180,w:190,h:35},{x:315,y:215,w:35,h:170},{x:575,y:130,w:35,h:120},{x:610,y:130,w:200,h:35},{x:610,y:370,w:150,h:35}],
   [{x:155,y:145,w:35,h:230},{x:190,y:145,w:210,h:35},{x:555,y:330,w:230,h:35},{x:750,y:170,w:35,h:160}],
   [{x:170,y:145,w:210,h:35},{x:170,y:310,w:160,h:35},{x:580,y:225,w:220,h:35},{x:580,y:260,w:35,h:140}],
   [{x:180,y:160,w:35,h:210},{x:215,y:335,w:180,h:35},{x:580,y:150,w:210,h:35},{x:620,y:280,w:35,h:155}],
   [{x:150,y:140,w:250,h:35},{x:260,y:260,w:35,h:130},{x:295,y:355,w:150,h:35},{x:600,y:195,w:170,h:35},{x:735,y:230,w:35,h:160}]],
  [[{x:175,y:145,w:70,h:90},{x:310,y:355,w:140,h:40},{x:615,y:175,w:45,h:160},{x:730,y:365,w:75,h:55}],
   [{x:155,y:230,w:130,h:42},{x:300,y:135,w:55,h:100},{x:565,y:345,w:180,h:40},{x:750,y:190,w:45,h:90}],
   [{x:175,y:135,w:45,h:200},{x:310,y:350,w:180,h:40},{x:590,y:165,w:160,h:40},{x:740,y:300,w:50,h:115}],
   [{x:150,y:165,w:155,h:40},{x:290,y:205,w:45,h:120},{x:590,y:355,w:170,h:40},{x:690,y:140,w:45,h:150}],
   [{x:165,y:330,w:210,h:40},{x:315,y:145,w:45,h:100},{x:580,y:210,w:180,h:40},{x:715,y:250,w:45,h:140}],
   [{x:155,y:160,w:45,h:180},{x:200,y:305,w:155,h:35},{x:580,y:130,w:180,h:40},{x:650,y:325,w:45,h:110}]]
 ];
 if(boss)return [[{x:220,y:260,w:42,h:92},{x:685,y:170,w:42,h:75}],[{x:200,y:170,w:105,h:36},{x:685,y:330,w:36,h:95}],[{x:245,y:170,w:40,h:90},{x:705,y:335,w:70,h:40}]][floor%3].map(o=>({...o}));
 return layouts[floor%3][variant%6].map(o=>({...o}));
}
export function roomTerrain(floor,variant,boss=false){const a=variant%2===0;if(boss)return [];return floor===0?[{x:a?375:390,y:125,w:a?165:70,h:a?75:265,type:'water'},{x:545,y:375,w:150,h:45,type:'water'}]:floor===1?[{x:a?370:530,y:195,w:80,h:55,type:'vent',period:4.6,offset:0},{x:a?535:360,y:345,w:100,h:55,type:'vent',period:4.6,offset:2.3}]:[{x:380,y:190,w:70,h:70,type:'gravity'},{x:a?525:590,y:350,w:85,h:70,type:'gravity'}];}
export const SCENE_NAMES=[['退潮装卸港','迂回泵房','断电观测舱','深潜维修站','双水位实验池','废弃运输廊'],['残页阅览室','禁书回廊','燃烧索引库','错架档案室','旧馆装订间','地下借阅处'],['碎桥观星台','失重温室','龙晶遗址','坠星祈祷庭','折断的轨道','月蚀中转站']];
