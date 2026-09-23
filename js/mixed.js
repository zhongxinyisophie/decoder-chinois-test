(function(){
 const $=Decoder.$;let i=0;
 const tasks=[
  {kind:'card',eyebrow:'跨课复习',title:'看书 → 看电影',body:'Le caractère 看 revient dans plusieurs expressions. Essaie de lire les deux sans pinyin.'},
  {kind:'speak',q:'周末你一般几点起床？',hint:'我周末一般 ____ 点左右起床。'},
  {kind:'card',eyebrow:'组合旧知识',title:'周末我一般九点左右起床。',body:'周末 vient de la Leçon 2 ; 九点左右起床 réutilise la Leçon 1.'},
  {kind:'speak',q:'你周末一般做什么？',hint:'我周末一般 ______。'}
 ];
 function render(){
  $('count').textContent=(i+1)+' / '+tasks.length;$('bar').style.width=((i+1)/tasks.length*100)+'%';const t=tasks[i];
  if(t.kind==='card') $('host').innerHTML=`<div class="card stack"><div class="small">${t.eyebrow}</div><div class="bigcn" style="font-size:26px">${t.title}</div><div class="notice">${t.body}</div><button id="n" class="btn primary">Continuer</button></div>`;
  else $('host').innerHTML=`<div class="card stack"><div class="small">Réponse rapide</div><div class="bigcn">${t.q}</div><div class="small">Réponds à voix haute avant d’ouvrir l’indice.</div><button id="hintBtn" class="btn link">Je bloque → indice</button><div id="hint" class="hidden notice">${t.hint}</div><button id="n" class="btn primary">Continuer</button></div>`;
  if($('hintBtn'))$('hintBtn').onclick=()=>$('hint').classList.toggle('hidden');$('n').onclick=()=>{i++;if(i>=tasks.length)done();else render();};
 }
 function done(){$('bar').style.width='100%';$('count').textContent='Terminé';$('host').innerHTML='<div class="card stack"><div class="title">Révision mixte terminée ✓</div><div class="small">Tu as réutilisé des éléments de plusieurs leçons dans de nouvelles phrases.</div><div class="grid2"><a class="btn" href="index.html">Accueil</a><a class="btn primary" href="feedback.html">Donner mon avis</a></div></div>';}
 $('start').onclick=()=>{$('startCard').classList.add('hidden');$('session').classList.remove('hidden');render();};
})();
