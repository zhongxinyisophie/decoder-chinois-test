(async function(){
 const $=Decoder.$;
 const id=Number(Decoder.getParam('id')||1);
 let D;
 try{D=await Decoder.loadLesson(id);}catch(e){$('title').textContent='Leçon introuvable';$('startCard').classList.add('hidden');return;}
 Decoder.currentLesson=D;
 document.title=D.title+' · Décoder le chinois';
 $('title').textContent=D.title;$('subtitle').textContent=D.fr;
 let i=0,py=0,spoken=0,hanzi=0;
 const shuffle=items=>{const out=[...items];for(let j=out.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[out[j],out[k]]=[out[k],out[j]];}return out;};
 const words=shuffle(D.active);
 const quickPool=shuffle(D.quick);
 const tasks=[
  {t:'listen',w:words[0]},
  ...words.slice(1,3).map(w=>({t:'meaning',w})),
  {t:'segment'},
  {t:'reflex',r:shuffle(D.reflex)[0]},
  ...quickPool.slice(0,2).map(q=>({t:'quick',q})),
  {t:'final'}
 ];
 if(D.listening) tasks.splice(5,0,{t:'fullListening'});
 function next(){i++;if(i>=tasks.length)done();else render()}
 function render(){
  $('count').textContent=(i+1)+' / '+tasks.length;$('bar').style.width=((i+1)/tasks.length*100)+'%';
  const t=tasks[i];
  if(t.t==='listen')listen(t.w);else if(t.t==='meaning')meaning(t.w);else if(t.t==='segment')segment();else if(t.t==='reflex')reflex(t.r);else if(t.t==='quick')quick(t.q);else if(t.t==='fullListening')fullListening();else if(t.t==='final')finalTask();
 }
 function listen(w){
  const opts=[w,...D.active.filter(x=>x[0]!==w[0]).slice(0,2)].sort(()=>Math.random()-.5);
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">Écoute</div><div class="task-title">Quel mot entends-tu ?</div><div class="task-help">N’affiche le pinyin que si tu en as besoin.</div></div><button id="play" class="btn soft">▶ Écouter</button><div class="grid3">${opts.map(x=>`<button class="choice choice-hanzi opt" data-x="${x[0]}">${x[0]}</button>`).join('')}</div><div id="fb"></div><div id="rev" class="hidden notice answer-reveal"><div class="answer-hanzi">${w[0]}</div><div class="answer-meaning">${w[2]}</div><div class="pinyin-wrap"><button id="pbtn" class="btn link">Afficher le pinyin</button><div id="pt" class="hidden pinyin-text">${w[1]}</div></div></div><button id="n" class="btn primary" disabled>Continuer</button></div>`;
  $('play').onclick=()=>Decoder.say(w[0],.9);
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.x===w[0];$('fb').textContent=ok?'Bien.':'Réécoute.';if(ok){$('rev').classList.remove('hidden');$('n').disabled=false;hanzi++;}});
  $('pbtn').onclick=()=>{$('pt').classList.toggle('hidden');py++;};$('n').onclick=next;
 }
 function meaning(w){
  const opts=[w[2],...D.active.filter(x=>x[0]!==w[0]).slice(0,2).map(x=>x[2])].sort(()=>Math.random()-.5);
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">Lis les caractères</div><div class="task-title">Que veut dire ce mot ?</div></div><div class="bigcn center">${w[0]}</div><div class="grid3">${opts.map(x=>`<button class="choice choice-meaning opt" data-x="${x}">${x}</button>`).join('')}</div><div id="fb"></div><div id="after" class="hidden notice answer-reveal"><div class="pronunciation-check"><div class="instruction">Prononce-le d’abord toi-même, puis écoute le modèle.</div><button id="check" class="btn verify-btn">▶ Écouter le modèle</button><div class="pinyin-section"><button id="pbtn" class="btn link pinyin-toggle">Afficher le pinyin</button><div id="pt" class="hidden pinyin-text">${w[1]}</div></div></div></div><button id="n" class="btn primary" disabled>Continuer</button></div>`;
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const ok=b.dataset.x===w[2];$('fb').textContent=ok?'Oui. Tu l’as reconnu sans pinyin.':'Réessaie.';if(ok){$('after').classList.remove('hidden');$('n').disabled=false;hanzi++;}});
  $('check').onclick=()=>Decoder.say(w[0]);$('pbtn').onclick=()=>{$('pt').classList.toggle('hidden');py++;};$('n').onclick=next;
 }
 function segment(){
  const [s,ch]=D.segment,sh=[...ch].sort(()=>Math.random()-.5);let chosen=[];
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">Écoute la phrase</div><div class="task-title">Remets les groupes dans l’ordre.</div></div><button id="play" class="btn soft">▶ Écouter</button><div class="row">${sh.map(x=>`<button class="chip c" data-x="${x}">${x}</button>`).join('')}</div><div class="notice"><div id="ans" class="row"></div></div><div id="fb"></div><div class="row"><button id="rst" class="btn">Recommencer</button><button id="n" class="btn primary" disabled>Continuer</button></div></div>`;
  $('play').onclick=()=>Decoder.say(s,.88);
  function dr(){$('ans').innerHTML=chosen.map(x=>`<span class="pill">${x}</span>`).join('');if(chosen.length===ch.length){const ok=chosen.every((x,j)=>x===ch[j]);$('fb').textContent=ok?'Très bien.':'L’ordre n’est pas correct.';$('n').disabled=!ok;}}
  document.querySelectorAll('.c').forEach(b=>b.onclick=()=>{if(!chosen.includes(b.dataset.x)){chosen.push(b.dataset.x);dr();}});
  $('rst').onclick=()=>{chosen=[];$('n').disabled=true;$('fb').textContent='';dr();};$('n').onclick=next;
 }
 function reflex(r){
  $('host').innerHTML=`<div class="card stack"><div><div class="small">🇫🇷 Réflexe francophone</div><div class="h2">${r[0]}</div></div><div class="grid2"><div class="notice">${r[1]}</div><div class="notice bigcn" style="font-size:22px">${r[2]}</div></div><div class="success">${r[3]}</div><button id="n" class="btn primary">Continuer</button></div>`;
  $('n').onclick=next;
 }
 function quick(q){
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">Réponse rapide</div><div class="task-title">Réponds sans écrire.</div><div class="task-help">3 secondes, puis parle.</div></div><div class="notice center"><div class="bigcn">${q[0]}</div><div id="c" class="h2">Prêt ?</div><button id="go" class="btn primary">Démarrer</button></div><div id="say" class="hidden success"><b>Parle maintenant.</b></div><button id="hintBtn" class="btn link">Je bloque → indice</button><div id="hint" class="hidden notice">${q[1]}</div><button id="n" class="btn primary">J’ai répondu · Continuer</button></div>`;
  $('go').onclick=()=>{$('go').disabled=true;let x=3;$('c').textContent=x;const t=setInterval(()=>{x--;if(x>0)$('c').textContent=x;else{clearInterval(t);$('c').textContent='Maintenant !';$('say').classList.remove('hidden');spoken++;}},1000);};
  $('hintBtn').onclick=()=>$('hint').classList.toggle('hidden');$('n').onclick=next;
 }
 function fullListening(){
  const L=D.listening;
  const qs=shuffle(L.questions||[]).slice(0,2);
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">Compréhension orale</div><div class="task-title">${qs.length?"Écoute une version, puis réponds à voix haute.":"听一遍录音 · Écoute une version."}</div><div class="task-help">${qs.length?"Commence par la version lente si nécessaire. Ne lis la transcription qu’après.":"需要时先听慢速版，再听常速版。Commence par la version lente si nécessaire, puis écoute la version naturelle."}</div></div><div class="grid2"><a class="btn soft" target="_blank" rel="noopener" href="${L.slowUrl}">▶ Version lente</a><a class="btn soft" target="_blank" rel="noopener" href="${L.naturalUrl}">▶ Version naturelle</a></div>${qs.map(q=>`<div class="notice"><div class="bigcn" style="font-size:22px">${q[0]}</div><div class="pinyin-text">${q[1]}</div><div class="small">${q[2]}</div></div>`).join('')}<button id="n" class="btn primary">${qs.length?'J’ai répondu · Continuer':'我听完了 · Continuer'}</button></div>`;
  $('n').onclick=next;
 }
 function finalTask(){
  $('host').innerHTML=`<div class="card stack"><div><div class="small">Mission finale</div><div class="h2">${D.final}</div><div class="small">${D.finalHelp||'3 à 5 phrases suffisent.'} Pas de modèle complet.</div></div><div id="rec"></div><button id="n" class="btn primary">Terminer</button></div>`;
  setupRec();$('n').onclick=done;
 }
 function setupRec(){
  const h=$('rec');
  if(!navigator.mediaDevices||!window.MediaRecorder){
   h.innerHTML='<div class="notice small">Micro indisponible ici. Tu peux quand même dire ta réponse à voix haute.</div>';
   return;
  }

  const chooseMime=()=>{
   const candidates=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];
   return candidates.find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
  };
  const fileInfo=(mime)=>{
   if((mime||'').includes('mp4'))return {ext:'m4a',type:'audio/mp4'};
   if((mime||'').includes('ogg'))return {ext:'ogg',type:mime||'audio/ogg'};
   return {ext:'webm',type:mime||'audio/webm'};
  };

  const idle=()=>{
   h.innerHTML='<button id="sr" class="btn recording-main">🎙 Enregistrer ma réponse</button><div class="small recording-help">Tu pourras l’écouter, la refaire puis la partager avec Xinyi.</div>';
   $('sr').onclick=start;
  };

  async function start(){
   try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks=[];
    const preferred=chooseMime();
    const mr=preferred?new MediaRecorder(stream,{mimeType:preferred}):new MediaRecorder(stream);
    let seconds=0;
    const actualMime=mr.mimeType||preferred||'audio/webm';

    mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    mr.onstop=()=>{
     const info=fileInfo(actualMime);
     const blob=new Blob(chunks,{type:actualMime});
     const url=URL.createObjectURL(blob);
     stream.getTracks().forEach(x=>x.stop());
     spoken++;
     showReview(blob,url,info);
    };

    mr.start();
    h.innerHTML=`<div class="recording-live"><div class="recording-dot"></div><div><b>Enregistrement en cours</b><div class="small" id="timer">0:00</div></div></div><button id="stop" class="btn soft recording-stop">■ Arrêter</button>`;
    const timer=setInterval(()=>{seconds++;const m=Math.floor(seconds/60),s=String(seconds%60).padStart(2,'0');if($('timer'))$('timer').textContent=m+':'+s;},1000);
    $('stop').onclick=()=>{clearInterval(timer);mr.stop();};
   }catch(e){
    h.innerHTML='<div class="notice small">Autorisation micro refusée ou indisponible. Vérifie l’autorisation du micro dans ton navigateur, puis réessaie.</div><button id="retryRec" class="btn">Réessayer</button>';
    $('retryRec').onclick=idle;
   }
  }

  function showReview(blob,url,info){
   const stamp=new Date().toISOString().slice(0,10);
   const safeLesson=String(D.id||id).padStart(2,'0');
   const filename=`decoder-chinois-L${safeLesson}-${stamp}.${info.ext}`;
   const file=new File([blob],filename,{type:info.type,lastModified:Date.now()});

   h.innerHTML=`<div class="recording-review stack"><div><div class="task-kicker">Avant d’envoyer</div><div class="task-title recording-title">Écoute ta réponse.</div><div class="task-help">Si tu veux la corriger, réenregistre-la. Sinon, partage-la avec Xinyi.</div></div><audio id="myAudio" controls src="${url}"></audio><div class="recording-actions"><button id="redoRec" class="btn">↻ Réenregistrer</button><button id="shareRec" class="btn primary">Partager le fichier audio</button></div><div id="shareNote" class="small recording-help">Choisis ton application puis Xinyi comme destinataire. Si le partage est indisponible, télécharge le fichier et joins-le à ton message.</div><a id="downloadRec" class="btn link recording-download" href="${url}" download="${filename}">Télécharger l’enregistrement</a></div>`;

   $('redoRec').onclick=()=>{URL.revokeObjectURL(url);idle();};
   const fallback=()=>{
    const note=$('shareNote');
    note.textContent='Pour envoyer ta réponse : 1. Télécharge le fichier audio ci-dessous. 2. Ouvre ta conversation avec Xinyi. 3. Ajoute ce fichier en pièce jointe. Ton enregistrement reste disponible ici.';
    $('downloadRec').className='btn primary recording-download';
    $('downloadRec').focus();
   };
   let canShareFile=false;
   try{canShareFile=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));}catch(e){}
   if(!canShareFile){
    $('shareRec').hidden=true;
    fallback();
   }
   $('shareRec').onclick=async()=>{
    const button=$('shareRec');
    if(button.disabled)return;
    button.disabled=true;
    try{
     await navigator.share({files:[file]});
     $('shareNote').textContent='Menu de partage fermé. Vérifie dans ton application que le fichier a bien été envoyé à Xinyi.';
    }catch(err){
     if(err&&err.name==='AbortError'){
      $('shareNote').textContent='Partage annulé. Tu peux réessayer ou télécharger ton enregistrement.';
     }else{
      button.hidden=true;
      fallback();
     }
    }finally{button.disabled=false;}
   };
  }

  idle();
 }
 function done(){
  $('bar').style.width='100%';$('count').textContent='Terminé';
  $('host').innerHTML=`<div class="card stack"><div class="title">C’est tout pour aujourd’hui ✓</div><div class="grid3"><div class="notice">Caractères<br><b>${hanzi}</b></div><div class="notice">Oral<br><b>${spoken}</b></div><div class="notice">Pinyin<br><b>${py}</b></div></div><div class="grid2"><a class="btn" href="index.html">Accueil</a><a class="btn primary" href="feedback.html">Donner mon avis</a></div></div>`;
 }
 function library(){
  $('library').classList.remove('hidden');$('session').classList.add('hidden');$('startCard').classList.add('hidden');
  const activeHtml=D.active.map(w=>`<div class="notice"><b class="bigcn" style="font-size:20px">${w[0]}</b><div class="pinyin-text">${w[1]}</div><div class="small">${w[2]}</div></div>`).join('');
  const recognitionHtml=D.recognition.map(w=>{const py=w.length>2?w[1]:'';const fr=w.length>2?w[2]:w[1];return `<div class="notice"><b class="bigcn" style="font-size:20px">${w[0]}</b>${py?`<div class="pinyin-text">${py}</div>`:''}<div class="small">${fr}</div></div>`;}).join('');
  const phraseData=D.sentenceDetails||D.sentences.map(s=>[s,'','']);
  const phrasesHtml=phraseData.map(s=>`<div class="notice"><div class="between"><div><div class="bigcn" style="font-size:21px">${s[0]}</div>${s[1]?`<div class="pinyin-text">${s[1]}</div>`:''}${s[2]?`<div class="small">${s[2]}</div>`:''}</div><button class="btn p" data-s="${s[0]}">▶</button></div></div>`).join('');
  const blocksHtml=D.blocks?`<div class="card stack"><div class="h2">句子积木 · Construis ta phrase</div>${D.blocks.map(b=>`<div class="notice"><div class="small"><b>${b[0]}</b></div><div>${b[1]}</div><div class="bigcn" style="font-size:21px">${b[2]}</div><div class="pinyin-text">${b[3]}</div><div class="small">${b[4]}</div></div>`).join('')}</div>`:'';
  const reflexHtml=D.reflex?`<div class="card stack"><div class="h2">🇫🇷 Réflexe francophone</div>${D.reflex.map(r=>`<div class="notice"><b>${r[0]}</b><div class="small">${r[1]}</div><div class="bigcn" style="font-size:20px;margin-top:6px">${r[2]}</div><div class="small" style="margin-top:6px">${r[3]}</div></div>`).join('')}</div>`:'';
  const listeningHtml=D.listening?`<div class="card stack"><div class="h2">听力 · Compréhension orale</div><div class="grid2"><a class="btn soft" target="_blank" rel="noopener" href="${D.listening.slowUrl}">▶ Version lente</a><a class="btn soft" target="_blank" rel="noopener" href="${D.listening.naturalUrl}">▶ Version naturelle</a></div>${(D.listening.questions||[]).length?'<div class="h2">Questions</div>':''}${(D.listening.questions||[]).map(q=>`<div class="notice"><div class="bigcn" style="font-size:20px">${q[0]}</div><div class="pinyin-text">${q[1]}</div><div class="small">${q[2]}</div></div>`).join('')}${(D.listening.script||[]).length?`<details class="notice"><summary><b>Voir la transcription après l’écoute</b></summary><div class="stack" style="margin-top:12px">${D.listening.script.map(x=>`<div><div class="bigcn" style="font-size:20px">${x[0]}</div><div class="pinyin-text">${x[1]}</div></div>`).join('')}</div><div class="small" style="margin-top:12px">${D.listening.translation||''}</div></details>`:''}</div>`:'';
  $('library').innerHTML=`<div class="between"><button id="closeLib" class="btn">← Retour</button><div class="h2">Tout le contenu</div></div><div class="card stack"><div class="h2">🟢 À utiliser</div><div class="grid2">${activeHtml}</div></div><div class="card stack"><div class="h2">🔵 À reconnaître</div><div class="grid2">${recognitionHtml}</div></div>${blocksHtml}<div class="card stack"><div class="h2">Phrases-clés</div>${phrasesHtml}</div><div class="card"><div class="h2">Réseaux</div><div class="grid3">${D.networks.map(n=>`<div class="notice"><b>${n[0]}</b><br><span class="small">${n[1]}</span></div>`).join('')}</div></div>${reflexHtml}${listeningHtml}`;
  $('closeLib').onclick=()=>location.reload();document.querySelectorAll('.p').forEach(b=>b.onclick=()=>Decoder.say(b.dataset.s));
 }
 $('start').onclick=()=>{$('session').classList.remove('hidden');$('startCard').classList.add('hidden');render();};
 $('libraryBtn').onclick=library;
})();

