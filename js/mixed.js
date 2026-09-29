(function(){
 const $=Decoder.$;
 const cfg=window.DECODER_MIXING||{count:4,pairs:[]};
 let i=0;
 function weightedPick(pairs){
  const total=pairs.reduce((s,p)=>s+(p.weight||1),0);
  let r=Math.random()*total;
  for(const p of pairs){r-=p.weight||1;if(r<=0)return p;}
  return pairs[pairs.length-1];
 }
 function buildTasks(){
  const used=new Map();
  const out=[];
  for(let n=0;n<(cfg.count||10);n++){
   let available=cfg.pairs.filter(p=>{const k=p.lessons.join('-');return (used.get(k)||0)<p.tasks.length;});
   if(!available.length){used.clear();available=cfg.pairs.slice();}
   const p=weightedPick(available);
   const k=p.lessons.join('-');
   const taken=used.get(k)||0;
   const task={...p.tasks[taken],pair:p.lessons};
   used.set(k,taken+1);
   out.push(task);
  }
  return out;
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
  if($('hintBtn'))$('hintBtn').onclick=()=>$('hint').classList.toggle('hidden');
  $('n').onclick=()=>{i++;if(i>=tasks.length)done();else render();};
 }
 function done(){
  $('bar').style.width='100%';
  $('count').textContent='Terminé';
  $('host').innerHTML='<div class="card stack"><div class="title">Révision mixte terminée ✓</div><div class="small">Tu as réutilisé des éléments des Leçons 1 à 4 dans de nouvelles combinaisons.</div><div class="grid2"><a class="btn" href="index.html">Accueil</a><a class="btn primary" href="feedback.html">Donner mon avis</a></div></div>';
 }
 $('start').onclick=()=>{$('startCard').classList.add('hidden');$('session').classList.remove('hidden');render();};
})();