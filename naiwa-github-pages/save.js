import {rng} from './engine.js';
import {DIFFICULTIES} from './world.js';
export const SAVE_KEY='naiwa-ai-expedition-v2';
const MODES=['play','paused','map','upgrade','shop','fountain','event'];
export function serializeRun(g){if(!g||!MODES.includes(g.mode))return null;const {rand,nav,...run}=g;return JSON.stringify({version:2,savedAt:Date.now(),rngState:rand.state,run:{...run,mode:g.mode==='paused'?'play':g.mode,events:[],nav:null}});}
export function restoreRun(raw){try{const v=typeof raw==='string'?JSON.parse(raw):raw,g=v?.run;if(v?.version!==2||!g||!MODES.includes(g.mode)||!Number.isFinite(g.p?.hp)||g.p.hp<=0||!Array.isArray(g.enemies)||!Array.isArray(g.floor?.nodes)||!Number.isInteger(v.rngState))return null;if(!DIFFICULTIES[g.difficulty]||!Number.isInteger(g.floorIndex)||g.floorIndex<0||g.floorIndex>2)return null;g.totalFloors=Math.max(DIFFICULTIES[g.difficulty].floors,g.floorIndex+1);g.rand=rng(0);g.rand.state=v.rngState;g.nav=null;g.events=[];g.savedAt=v.savedAt;return g;}catch{return null;}}
