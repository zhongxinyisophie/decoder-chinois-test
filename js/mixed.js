(function(){
 const $=Decoder.$;
 const cfg=window.DECODER_MIXING||{count:4,pairs:[]};
 let i=0;
 const storageKey='decoder-mixed-review-v1';
 let history={};
 try{history=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch(e){}
 const now=Date.now();
 function buildTasks(){
  const pool=cfg.pairs.flatMap(p=>p.tasks.map((t,j)=>({...t,pair:p.lessons,id:p.lessons.join('-')+':'+j,baseWeight:p.weight||1})));
  const selected=[];
  const pairCounts={};
  while(pool.length&&selected.length<(cfg.count||10)){
   const weights=pool.map(t=>{
    const h=history[t.id]||{};
    const days=h.last?Math.max(0,(now-h.last)/86400000):7;
    const interval=Math.min(30,Math.pow(2,Math.min(h.streak||0,5)));
    const need=h.again?3:1;
    const diversity=1/(1+(pairCounts[t.pair.join('-')]||0)*2);
    return t.baseWeight*need*(1+Math.min(8,days/interval))*diversity;
   });
   let r=Math.random()*weights.reduce((a,b)=>a+b,0),index=weights.length-1;
   for(let j=0;j<weights.length;j++){r-=weights[j];if(r<=0){index=j;break;}}
   const t=pool.splice(index,1)[0];
   selected.push(t);const pair=t.pair.join('-');pairCounts[pair]=(pairCounts[pair]||0)+1;
  }
  return selected;
 }
 function record(task,again){
  const old=history[task.id]||{};
  history[task.id]={last:Date.now(),again,streak:again?0:(old.streak||0)+1};
  try{localStorage.setItem(storageKey,JSON.stringify(history));}catch(e){}
 }
 const tasks=buildTasks();
 function render(){
  $('count').textContent=(i+1)+' / '+tasks.length;
  $('bar').style.width=((i+1)/tasks.length*100)+'%';
  const t=tasks[i];
  const pair=t.pair?`Leçons ${t.pair.join(' + ')}`:'Révision mixte';
  if(t.kind==='card') {
   $('host').innerHTML=`<div class="card stack"><div class="small">${t.eyebrow||pair}</div><div class="bigcn" style="font-size:26px">${t.title}</div><div class="notice">${t.body}</div><button id="n" class="btn primary">Continuer</button></div>`;
  } else {
   $('host').innerHTML=`<div class="card stack"><div class="small">${pair} · Réponse rapide</div><div class="bigcn">${t.q}</div><div class="small">Réponds à voix haute avant d’ouvrir l’indice.</div><button id="hintBtn" class="btn link">Je bloque → indice</button><div id="hint" class="hidden notice">${t.hint}</div><button id="n" class="btn primary">Continuer</button></div>`;
  }
  $('n').insertAdjacentHTML('beforebegin','<div class="small">Après avoir répondu, évalue ta réponse. Ton choix aide à préparer les prochaines révisions.</div><button id="again" class="btn">À retravailler</button>');
  $('n').textContent='Réussi · Continuer';
  $('again').onclick=()=>{record(t,true);i++;if(i>=tasks.length)done();else render();};
  if($('hintBtn'))$('hintBtn').onclick=()=>$('hint').classList.toggle('hidden');
  $('n').onclick=()=>{record(t,false);i++;if(i>=tasks.length)done();else render();};
 }
 function done(){
  $('bar').style.width='100%';
  $('count').textContent='Terminé';
  $('host').innerHTML='<div class="card stack"><div class="title">Révision mixte terminée ✓</div><div class="small">Tu as réutilisé des éléments des Leçons 1 à 4 dans de nouvelles combinaisons.</div><div class="grid2"><a class="btn" href="index.html">Accueil</a><a class="btn primary" href="feedback.html">Donner mon avis</a></div></div>';
 }
 $('start').onclick=()=>{$('startCard').classList.add('hidden');$('session').classList.remove('hidden');render();};
})();
