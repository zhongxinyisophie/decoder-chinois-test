(async function(){
 const $=Decoder.$;
 const id=Number(Decoder.getParam('id')||1);
 let D;
 try{D=await Decoder.loadLesson(id);}catch(e){$('title').textContent='Leçon introuvable';$('startCard').classList.add('hidden');return;}
 Decoder.currentLesson=D;
 document.title=D.title+' · Décoder le chinois';
 $('title').textContent=D.title;$('subtitle').textContent=D.fr;
 let i=0,py=0,spoken=0,hanzi=0;
 const tasks=[
  {t:'listen',w:D.active[0]},
  {t:'meaning',w:D.active[2]||D.active[1]},
  {t:'meaning',w:D.active[3]||D.active[1]},
  {t:'segment'},
  {t:'reflex'},
  {t:'quick',q:D.quick[0]},
  {t:'quick',q:D.quick[3]||D.quick[D.quick.length-1]},
  {t:'final'}
 ];
 function next(){i++;if(i>=tasks.length)done();else render()}
 function render(){
  $('count').textContent=(i+1)+' / '+tasks.length;$('bar').style.width=((i+1)/tasks.length*100)+'%';
  const t=tasks[i];
  if(t.t==='listen')listen(t.w);else if(t.t==='meaning')meaning(t.w);else if(t.t==='segment')segment();else if(t.t==='reflex')reflex();else if(t.t==='quick')quick(t.q);else if(t.t==='final')finalTask();
 }
 function listen(w){
  const opts=[w,...D.active.filter(x=>x[0]!==w[0]).slice(0,2)].sort(()=>Math.random()-.5);
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Écoute</div><div class="h2">Quel mot entends-tu ?</div><div class="small">N’affiche le pinyin que si tu en as besoin.</div></div><button id="play" class="btn soft">▶ Écouter</button><div class="grid3">${opts.map(x=>`<button class="choice choice-hanzi opt" data-x="${x[0]}">${x[0]}</button>`).join('')}</div><div id="fb"></div><div id="rev" class="hidden notice answer-reveal"><div class="answer-hanzi">${w[0]}</div><div class="answer-meaning">${w[2]}</div><div class="pinyin-wrap"><button id="pbtn" class="btn link">Afficher le pinyin</button><div id="pt" class="hidden pinyin-text">${w[1]}</div></div></div><button id="n" class="btn primary" disabled>Continuer</button></div>`;
  $('play').onclick=()=>Decoder.say(w[0],.9);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.x===w[0];$('fb').textContent=ok?'Bien.':'Réécoute.';if(ok){$('rev').classList.remove('hidden');$('n').disabled=false;hanzi++;}});
  $('pbtn').onclick=()=>{$('pt').classList.toggle('hidden');py++;};$('n').onclick=next;
 }
 function meaning(w){
  const opts=[w[2],...D.active.filter(x=>x[0]!==w[0]).slice(0,2).map(x=>x[2])].sort(()=>Math.random()-.5);
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Lis les caractères</div><div class="h2">Que veut dire ce mot ?</div></div><div class="bigcn center">${w[0]}</div><div class="grid3">${opts.map(x=>`<button class="choice choice-meaning opt" data-x="${x}">${x}</button>`).join('')}</div><div id="fb"></div><div id="after" class="hidden notice answer-reveal"><div class="small">Prononce-le dans ta tête, puis vérifie.</div><div class="row"><button id="check" class="btn">▶ Vérifier</button><button id="pbtn" class="btn link">Afficher le pinyin</button></div><div id="pt" class="hidden pinyin-text">${w[1]}</div></div><button id="n" class="btn primary" disabled>Continuer</button></div>`;
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.x===w[2];$('fb').textContent=ok?'Oui. Tu l’as reconnu sans pinyin.':'Réessaie.';if(ok){$('after').classList.remove('hidden');$('n').disabled=false;hanzi++;}});
  $('check').onclick=()=>Decoder.say(w[0]);$('pbtn').onclick=()=>{$('pt').classList.toggle('hidden');py++;};$('n').onclick=next;
 }
 function segment(){
  const [s,ch]=D.segment,sh=[...ch].sort(()=>Math.random()-.5);let chosen=[];
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Écoute la phrase</div><div class="h2">Remets les groupes dans l’ordre.</div></div><button id="play" class="btn soft">▶ Écouter</button><div class="row">${sh.map(x=>`<button class="chip c" data-x="${x}">${x}</button>`).join('')}</div><div class="notice"><div id="ans" class="row"></div></div><div id="fb"></div><div class="row"><button id="rst" class="btn">Recommencer</button><button id="n" class="btn primary" disabled>Continuer</button></div></div>`;
  $('play').onclick=()=>Decoder.say(s,.88);
  function dr(){$('ans').innerHTML=chosen.map(x=>`<span class="pill">${x}</span>`).join('');if(chosen.length===ch.length){const ok=chosen.every((x,j)=>x===ch[j]);$('fb').textContent=ok?'Très bien.':'L’ordre n’est pas correct.';$('n').disabled=!ok;}}
  document.querySelectorAll('.c').forEach(b=>b.onclick=()=>{if(!chosen.includes(b.dataset.x)){chosen.push(b.dataset.x);dr();}});
  $('rst').onclick=()=>{chosen=[];$('n').disabled=true;$('fb').textContent='';dr();};$('n').onclick=next;
 }
 function reflex(){
  const r=D.reflex[0];
  $('host').innerHTML=`<div class="card stack"><div><div class="small">🇫🇷 Réflexe francophone</div><div class="h2">${r[0]}</div></div><div class="grid2"><div class="notice">${r[1]}</div><div class="notice bigcn" style="font-size:22px">${r[2]}</div></div><div class="success">${r[3]}</div><button id="n" class="btn primary">Continuer</button></div>`;
  $('n').onclick=next;
 }
 function quick(q){
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Réponse rapide</div><div class="h2">Réponds sans écrire.</div><div class="small">3 secondes, puis parle.</div></div><div class="notice center"><div class="bigcn">${q[0]}</div><div id="c" class="h2">Prêt ?</div><button id="go" class="btn primary">Démarrer</button></div><div id="say" class="hidden success"><b>Parle maintenant.</b></div><button id="hintBtn" class="btn link">Je bloque → indice</button><div id="hint" class="hidden notice">${q[1]}</div><button id="n" class="btn primary">J’ai répondu · Continuer</button></div>`;
  $('go').onclick=()=>{let x=3;$('c').textContent=x;const t=setInterval(()=>{x--;if(x>0)$('c').textContent=x;else{clearInterval(t);$('c').textContent='Maintenant !';$('say').classList.remove('hidden');spoken++;}},700);};
  $('hintBtn').onclick=()=>$('hint').classList.toggle('hidden');$('n').onclick=next;
 }
 function finalTask(){
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Mission finale</div><div class="h2">${D.final}</div><div class="small">3 à 5 phrases suffisent. Pas de modèle complet.</div></div><div id="rec"></div><button id="n" class="btn primary">Terminer</button></div>`;
  setupRec();$('n').onclick=done;
 }
 function setupRec(){
  const h=$('rec');if(!navigator.mediaDevices||!window.MediaRecorder){h.innerHTML='<div class="notice small">Micro indisponible ici. Dis ta réponse à voix haute.</div>';return;}
  h.innerHTML='<button id="sr" class="btn">🎙 Enregistrer ma réponse</button>';
  $('sr').onclick=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({audio:true}),chunks=[],mr=new MediaRecorder(st);mr.ondataavailable=e=>chunks.push(e.data);mr.onstop=()=>{const url=URL.createObjectURL(new Blob(chunks,{type:'audio/webm'}));st.getTracks().forEach(x=>x.stop());h.innerHTML=`<audio controls src="${url}"></audio><div class="small">L’audio reste dans ce navigateur dans cette version test.</div>`;spoken++;};mr.start();h.innerHTML='<button id="stop" class="btn soft">■ Arrêter</button>';$('stop').onclick=()=>mr.stop();}catch(e){h.innerHTML='<div class="notice small">Autorisation micro refusée. Dis simplement ta réponse à voix haute.</div>';}};
 }
 function done(){
  $('bar').style.width='100%';$('count').textContent='Terminé';
  $('host').innerHTML=`<div class="card stack"><div class="title">C’est tout pour aujourd’hui ✓</div><div class="grid3"><div class="notice">Caractères<br><b>${hanzi}</b></div><div class="notice">Oral<br><b>${spoken}</b></div><div class="notice">Pinyin<br><b>${py}</b></div></div><div class="grid2"><a class="btn" href="index.html">Accueil</a><a class="btn primary" href="feedback.html">Donner mon avis</a></div></div>`;
 }
 function library(){
  $('library').classList.remove('hidden');$('session').classList.add('hidden');$('startCard').classList.add('hidden');
  $('library').innerHTML=`<div class="between"><button id="closeLib" class="btn">← Retour</button><div class="h2">Tout le contenu</div></div><div class="card stack"><div class="h2">🟢 À utiliser</div><div class="row">${D.active.map(w=>`<span class="chip"><b>${w[0]}</b> <span class="small">${w[2]}</span></span>`).join('')}</div></div><div class="card stack"><div class="h2">🔵 À reconnaître</div><div class="row">${D.recognition.map(w=>`<span class="chip"><b>${w[0]}</b> <span class="small">${w[1]}</span></span>`).join('')}</div></div><div class="card stack"><div class="h2">Phrases-clés</div>${D.sentences.map(s=>`<div class="notice between"><span>${s}</span><button class="btn p" data-s="${s}">▶</button></div>`).join('')}</div><div class="card"><div class="h2">Réseaux</div><div class="grid3">${D.networks.map(n=>`<div class="notice"><b>${n[0]}</b><br><span class="small">${n[1]}</span></div>`).join('')}</div></div>`;
  $('closeLib').onclick=()=>location.reload();document.querySelectorAll('.p').forEach(b=>b.onclick=()=>Decoder.say(b.dataset.s));
 }
 $('start').onclick=()=>{$('session').classList.remove('hidden');$('startCard').classList.add('hidden');render();};
 $('libraryBtn').onclick=library;
})();
