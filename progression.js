export const META_KEY='naiwa-ai-meta-v1';
export const TALENTS=[
{id:'vitality',stage:1,name:'厚一点',desc:'每级生命上限 +4。',icon:'♡',max:3},
{id:'saliva',stage:1,name:'浓一点',desc:'每级基础伤害 +3%。',icon:'✦',max:3},
{id:'feet',stage:1,name:'快一点',desc:'每级移动速度 +1.5%。',icon:'»',max:3},
{id:'reflex',stage:1,name:'滑一点',desc:'每级冲刺冷却缩短 2%。',icon:'↗',max:3},
{id:'voice',stage:1,name:'响一点',desc:'每级大笑伤害 +3%。',icon:'⊗',max:3},
{id:'learning',stage:1,name:'记住了',desc:'每级结算奶币 +5%。',icon:'⊹',max:3},
{id:'vitality2',stage:2,name:'第二层皮',desc:'每级生命上限 +6。',icon:'♡',max:3},
{id:'saliva2',stage:2,name:'稳定输出',desc:'每级基础伤害 +4%。',icon:'✦',max:3},
{id:'armor',stage:2,name:'奶质装甲',desc:'每级受到伤害减少 1 点。',icon:'⬡',max:3},
{id:'recovery',stage:2,name:'缓慢修复',desc:'每级清空战斗房恢复 2 生命。',icon:'+',max:3},
{id:'capacity',stage:2,name:'共鸣中枢',desc:'每级大笑冷却缩短 3%。',icon:'◉',max:3},
{id:'clarity',stage:2,name:'看清破绽',desc:'每级口水暴击率 +2%。',icon:'⌖',max:3}
];
export const SUPERS=[
{id:'echoVoice',stage:1,name:'回声声带',desc:'大笑 0.6 秒后额外爆发一次，造成主笑声 65% 的伤害。',icon:'⊗'},
{id:'eggGuardian',stage:1,name:'护蛙本能',desc:'开局额外携带 1 颗奶蛋；每个战斗房获得 16 点护盾。',icon:'◉'},
{id:'regeneration',stage:1,name:'奶蛙不灭',desc:'每局可复活一次，恢复 40% 生命；击败 Boss 后恢复 15%。',icon:'♡'},
{id:'endlessLaugh',stage:2,name:'恒笑领域',desc:'大笑冷却缩短 20%，大笑期间受到的伤害降低 25%。',icon:'⊕'},
{id:'quantumEgg',stage:2,name:'量子卵膜',desc:'获得 1 颗额外奶蛋；每次大笑增加 12 点临时护盾，奶蛋伤害 +20%。',icon:'◈'},
{id:'overclock',stage:2,name:'奶脑超频',desc:'口水间隔缩短 18%，冲刺后 3 秒全部伤害 +20%。',icon:'ϟ'}
];
export const emptyMeta=()=>({version:1,wallet:0,totalEarned:0,ranks:{},supers:{},settled:[]});
export function normalizeMeta(value){const m=emptyMeta();if(!value||typeof value!=='object')return m;m.wallet=Math.max(0,Math.floor(Number(value.wallet)||0));m.totalEarned=Math.max(m.wallet,Math.floor(Number(value.totalEarned)||0));for(const t of TALENTS)m.ranks[t.id]=Math.max(0,Math.min(t.max,Math.floor(Number(value.ranks?.[t.id])||0)));for(const stage of [1,2])if(SUPERS.some(s=>s.stage===stage&&s.id===value.supers?.[stage]))m.supers[stage]=value.supers[stage];m.settled=Array.isArray(value.settled)?value.settled.filter(x=>typeof x==='string').slice(-150):[];return m;}
export const stagePoints=(m,stage)=>TALENTS.filter(t=>t.stage===stage).reduce((sum,t)=>sum+(m.ranks[t.id]||0),0);
export function talentCost(m,id){const t=TALENTS.find(t=>t.id===id);if(!t)return Infinity;return (t.stage===1?[30,50,80]:[90,150,240])[m.ranks[id]||0]??Infinity;}
export function canLearn(m,id){const t=TALENTS.find(t=>t.id===id);return !!t&&(!t.stage||t.stage===1||!!m.supers[1])&&(m.ranks[id]||0)<t.max&&m.wallet>=talentCost(m,id);}
export function learnTalent(m,id){if(!canLearn(m,id))return false;const cost=talentCost(m,id);m.wallet-=cost;m.ranks[id]=(m.ranks[id]||0)+1;return true;}
export const superCost=stage=>stage===1?240:540;
export function canChooseSuper(m,id){const s=SUPERS.find(s=>s.id===id);return !!s&&!m.supers[s.stage]&&(s.stage===1||!!m.supers[1])&&stagePoints(m,s.stage)>=10&&m.wallet>=superCost(s.stage);}
export function chooseSuper(m,id){if(!canChooseSuper(m,id))return false;const s=SUPERS.find(s=>s.id===id);m.wallet-=superCost(s.stage);m.supers[s.stage]=id;return true;}
export function metaStats(m=emptyMeta()){const r=m.ranks||{},supers=Object.values(m.supers||{}),first=!!m.supers?.[1],second=!!m.supers?.[2];return {hp:(first?18:0)+(second?16:0)+(r.vitality||0)*4+(r.vitality2||0)*6,damage:(first?.1:0)+(second?.1:0)+(r.saliva||0)*.03+(r.saliva2||0)*.04,speed:(r.feet||0)*.015,dash:(r.reflex||0)*.02,laugh:(r.voice||0)*.03,reward:(r.learning||0)*.05,armor:(r.armor||0)+(first?2:0)+(second?1:0),heal:(r.recovery||0)*2,laughCd:(r.capacity||0)*.03,crit:(r.clarity||0)*.02,supers};}
export function runReward(g,quit=false){if(!g||(!g.kills&&!g.roomsCleared))return {total:0,combat:0,exploration:0,boss:0,clear:0};const combat=Math.floor(g.kills*.2+(g.wavesCleared||0)*.8),exploration=g.roomsCleared*3,boss=(g.bossKills||0)*12,clear=g.mode==='won'?25:0,base=combat+exploration+boss+clear;const difficulty=g.difficulty==='easy'?.8:g.difficulty==='hard'?1.25:1;const total=Math.floor(base*difficulty*(1+(g.meta?.reward||0))*(quit?.7:1));return {total,combat,exploration,boss,clear};}
export function settleRun(m,g,quit=false){const key=String(g.runId);if(m.settled.includes(key))return {total:0,duplicate:true};const reward=runReward(g,quit);m.wallet+=reward.total;m.totalEarned+=reward.total;m.settled.push(key);m.settled=m.settled.slice(-150);return reward;}
