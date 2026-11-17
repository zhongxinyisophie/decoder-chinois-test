(()=>{
 const bank=DECODER_WORD_BOX,logic=DecoderWordBoxLogic,$=id=>document.getElementById(id);
 let tasks=[],index=0,selected=null,errors=0,solved=false,attempts=[],listeningResults=[];
 let listeningAudio=null,audioEpoch=0;
 function stopListening(){audioEpoch++;if(listeningAudio){listeningAudio.onended=listeningAudio.onerror=null;listeningAudio.pause();listeningAudio=null;}}
 const shapes={train:'<rect x="48" y="16" width="104" height="86" rx="18"/><path d="M68 22h64M60 49h80M88 22v27M110 22v27M64 108l-12 16m84-16 12 16M53 117h94"/><circle cx="72" cy="83" r="6"/><circle cx="128" cy="83" r="6"/>',metro:'<path d="M41 125V58a59 59 0 0 1 118 0v67"/><rect x="66" y="39" width="68" height="65" rx="15"/><path d="M78 45v24h44V45M78 108l-8 15m52-15 8 15"/><circle cx="83" cy="87" r="3"/><circle cx="117" cy="87" r="3"/><path d="M82 20v-8l18 12 18-12v8"/>',car:'<path d="M31 93V69l18-9 15-28h70l20 28 17 9v24H31Zm18-33h105M70 34l-9 26m61-26 15 26M95 34v26"/><circle cx="61" cy="94" r="15"/><circle cx="141" cy="94" r="15"/><path d="M38 77h15m95 0h14"/>',bike:'<circle cx="49" cy="94" r="29"/><circle cx="151" cy="94" r="29"/><path d="m49 94 35-51 28 51H49l37-32h48m-22 32 25-65h19M75 42h26m34-12 16 64"/>'};
 shapes.taxi='<rect x="93" y="17" width="35" height="13" rx="3"/><text x="110" y="27" font-size="9" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial, sans-serif">TAXI</text><path d="M52 91V64l13-9 14-25h65l14 25 13 9v27H52Zm13-36h93M95 31v24m34-24 13 24"/><circle cx="77" cy="92" r="12"/><circle cx="147" cy="92" r="12"/><path d="M87 68h10m10 0h10m10 0h10M25 112V71l12-29M25 73 12 84"/><circle cx="25" cy="57" r="8"/>';
 shapes.forward='<path d="M100 118V22m-35 35 35-35 35 35" stroke-width="10"/><path d="M65 125V78m70 47V78" stroke-dasharray="6 10"/>';
 shapes.left='<path d="M137 119V68a25 25 0 0 0-25-25H46m27-26L46 43l27 26" stroke-width="10"/>';
 const pic=item=>`<svg class="wb-pic" viewBox="0 0 200 140" role="img" aria-label="${item.fr}"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${shapes[item.id]}</g></svg>`;
 const audio=item=>item.audio?`<button class="btn soft wb-audio" data-item="${item.id}">▶ Écouter le modèle</button>`:'<span class="small">Modèle audio à venir</span>';
 function bindAudio(){document.querySelectorAll('.wb-audio').forEach(b=>b.onclick=()=>{const item=bank.items.find(x=>x.id===b.dataset.item);Decoder.currentLesson={audio:{[item.phrase]:item.audio}};Decoder.say(item.phrase);});}
 function intro(){
  stopListening();Decoder.stopAudio();$('progress').classList.add('hidden');
  $('wbHost').innerHTML=`<section class="card stack"><h2 class="h2">Quatre expressions à découvrir</h2><p class="small wb-note">4 associations, 4 écoutes et 1 réponse orale. Sans chronomètre.</p><div class="notice small wb-note">Dans ce jeu, tu voyages comme passager en train, en voiture ou en métro, ou tu fais du vélo. Les verbes restent disponibles pour plusieurs associations.</div><div class="wb-words">${bank.items.map(item=>`<article class="notice stack wb-word">${pic(item)}<div><div class="bigcn">${item.phrase}</div><div class="pinyin-text">${item.phrasePinyin}</div><div class="small">${item.meaning}</div></div>${audio(item)}</article>`).join('')}</div><div class="small wb-note">En voiture, on utilise ici 坐 pour le passager. 开汽车 signifie conduire : c’est une autre situation.</div><button id="wbStart" class="btn primary">Essayer · 9 petites activités</button><p class="small">Les quatre écoutes réutilisent des expressions déjà enregistrées en leçon 6. Les trois nouveaux modèles signalés ci-dessus restent à venir.</p></section>`;
  bindAudio();$('wbStart').onclick=()=>{try{tasks=logic.tasks(bank);}catch(e){$('wbStart').disabled=true;$('wbStart').textContent='Les quatre écoutes ne sont pas encore disponibles.';return;}index=0;attempts=[];listeningResults=[];$('progress').classList.remove('hidden');render();};
 }
 function next(){stopListening();Decoder.stopAudio();index++;if(index===tasks.length)finish();else render();}
 function render(){
  selected=null;errors=0;solved=false;$('wbCount').textContent=`${index+1} / ${tasks.length}`;$('wbBar').style.width=`${index/tasks.length*100}%`;
  const task=tasks[index];if(task.kind==='match')match(task.item);else if(task.kind==='listen')listen(task);else speak();
  $('progress').scrollIntoView({block:'start',behavior:'auto'});
 }
 function match(item){
  $('wbHost').innerHTML=`<section class="card stack"><div><div class="task-kicker">Associer les mots</div><h2 class="task-title">Quel verbe va avec ce transport ?</h2><p class="task-help">Choisis un verbe, puis clique sur le nom du transport.</p></div><div class="wb-picture">${pic(item)}</div><div class="wb-verbs">${logic.shuffle(bank.verbs).map(v=>`<button class="btn wb-verb" data-verb="${v.text}" aria-pressed="false"><b>${v.text}</b><span class="small">${v.pinyin}</span></button>`).join('')}</div><button id="wbNoun" class="chip wb-noun">${item.noun}</button><details class="wb-hint"><summary>Pinyin et sens du nom</summary><div class="pinyin-text">${item.pinyin}</div><div class="small">${item.fr}</div></details><div id="wbFeedback" class="wb-feedback" role="status" aria-live="polite"></div><div id="wbAnswer"></div><button id="wbNext" class="btn primary" disabled>Continuer</button></section>`;
  document.querySelectorAll('.wb-verb').forEach(b=>b.onclick=()=>{if(solved)return;selected=b.dataset.verb;document.querySelectorAll('.wb-verb').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  $('wbNoun').onclick=()=>{
   if(solved)return;if(!selected){$('wbFeedback').textContent='Choisis d’abord un verbe.';return;}
   if(!logic.accepts(item,selected)){errors++;$('wbFeedback').textContent=item.id==='bike'?'À vélo, le groupe à retenir est 骑自行车. Choisis 骑, puis clique de nouveau sur 自行车.':`Dans cette situation, retiens ${item.phrase}. Choisis 坐, puis clique de nouveau sur ${item.noun}.`;return;}
   solved=true;attempts.push({item,errors});$('wbFeedback').textContent=errors?'Oui, tu as corrigé cette association.':'Bien associé.';
   $('wbAnswer').innerHTML=`<div class="success stack wb-answer"><div class="wb-combine">${item.phrase}</div><div class="center pinyin-text">${item.phrasePinyin}</div><div class="center small">${item.meaning}</div>${audio(item)}</div>`;
   $('wbNoun').disabled=true;document.querySelectorAll('.wb-verb').forEach(b=>b.disabled=true);$('wbNext').disabled=false;bindAudio();
  };$('wbNext').onclick=next;
 }
 function listen(task){
  const {item,options}=task,heard=new Set();let answered=false;
  $('wbHost').innerHTML=`<section class="card stack"><div><div class="task-kicker">Écoute et choisis</div><h2 class="task-title">Quel enregistrement correspond à l’image ?</h2><p class="task-help">Écoute A et B jusqu’au bout, puis choisis.</p></div><div class="wb-picture">${pic(item)}</div><div class="wb-listen-options">${options.map((_,j)=>`<div class="notice stack"><button id="wbPlay${j}" class="btn soft">▶ Écouter ${j?'B':'A'}</button><button id="wbChoose${j}" class="btn" disabled>Choisir ${j?'B':'A'}</button></div>`).join('')}</div><div id="wbAudioStatus" class="small" role="status" aria-live="polite">Écoute les deux versions pour choisir.</div><div id="wbListenAnswer"></div><button id="wbNext" class="btn primary" disabled>Continuer</button></section>`;
  const updateChoices=()=>options.forEach((_,j)=>$('wbChoose'+j).disabled=answered||heard.size!==2);
  function play(j){
   stopListening();Decoder.stopAudio();const token=audioEpoch,step=index;
   const player=new Audio(options[j].audio);listeningAudio=player;
   const live=()=>audioEpoch===token&&index===step&&listeningAudio===player;
   $('wbAudioStatus').textContent=`Lecture ${j?'B':'A'}…`;
   const fail=()=>{if(!live())return;heard.delete(j);stopListening();updateChoices();$('wbAudioStatus').textContent=`Impossible de lire ${j?'B':'A'}. Clique sur Écouter pour réessayer.`;};
   player.onerror=fail;
   player.onended=()=>{if(!live())return;listeningAudio=null;heard.add(j);updateChoices();$('wbAudioStatus').textContent=answered?'Tu peux réécouter les deux versions.':heard.size===2?'Les deux versions ont été écoutées. Choisis A ou B.':`${j?'B':'A'} écouté. Écoute maintenant ${j?'A':'B'}.`;};
   try{const promise=player.play();if(promise&&promise.catch)promise.catch(fail);}catch(e){fail();}
  }
  options.forEach((option,j)=>{
   $('wbPlay'+j).onclick=()=>play(j);
   $('wbChoose'+j).onclick=()=>{
    if(answered||heard.size!==2)return;answered=true;stopListening();const ok=option.id===item.id;
    listeningResults.push({item,correct:ok});updateChoices();
    const right=options.findIndex(candidate=>candidate.id===item.id);
    $('wbAudioStatus').textContent=ok?'Bien trouvé.':`L’image correspond à ${right?'B':'A'}. Réécoute le bon modèle.`;
    $('wbListenAnswer').innerHTML=`<div class="${ok?'success':'notice'} stack wb-answer"><div class="bigcn center">${item.phrase}</div><div class="pinyin-text center">${item.phrasePinyin}</div><div class="small center">${item.fr}</div><button id="wbReplayRight" class="btn soft">▶ Réécouter le bon modèle</button><details class="wb-hint"><summary>Comparer les deux réponses</summary>${options.map((candidate,k)=>`<div class="small">${k?'B':'A'} : ${candidate.phrase} · ${candidate.phrasePinyin} · ${candidate.fr}</div>`).join('')}</details></div>`;
    $('wbReplayRight').onclick=()=>play(right);$('wbNext').disabled=false;
   };
  });$('wbNext').onclick=()=>{if(answered)next();};
 }
 function speak(){
  $('wbHost').innerHTML='<section class="card stack"><div class="task-kicker">À toi de parler</div><h2 class="task-title">Comment y aller ?</h2><p>Choisis l’un de ces transports et réponds à voix haute avec l’expression entière.</p><div class="notice bigcn center">怎么去？</div><details class="wb-hint"><summary>Un appui si nécessaire</summary><div class="bigcn">坐地铁。</div><div class="pinyin-text">Zuò dìtiě.</div><div class="small">En métro.</div></details><p class="small">Cette activité orale n’est pas notée.</p><button id="wbFinish" class="btn primary">Voir mon bilan</button></section>';$('wbFinish').onclick=finish;
 }
 function finish(){
  stopListening();Decoder.stopAudio();$('wbBar').style.width='100%';$('wbCount').textContent='Séance terminée';
  const first=attempts.filter(x=>!x.errors).length,right=listeningResults.filter(x=>x.correct).length,needs=[...new Map([...attempts.filter(x=>x.errors).map(x=>x.item),...listeningResults.filter(x=>!x.correct).map(x=>x.item)].map(item=>[item.phrase,item])).values()];
  $('wbHost').innerHTML=`<section class="card stack"><div class="task-kicker">Ton bilan</div><h2 class="task-title">Des mots qui vont ensemble.</h2><div class="wb-end"><div class="notice">Associations réussies au premier essai<div class="kpi">${first} / 4</div></div><div class="notice">Bonnes réponses en écoute<div class="kpi">${right} / 4</div></div></div>${needs.length?`<div class="notice stack"><b>À revoir une prochaine fois</b><ul class="wb-review">${needs.map(item=>`<li>${item.phrase} · ${item.phrasePinyin}</li>`).join('')}</ul></div>`:'<div class="success">Réessaie un autre jour pour voir ce qui reste en mémoire.</div>'}<p class="small wb-note">Les associations et les choix d’écoute sont corrigés automatiquement. L’activité orale n’est pas notée. Ce bilan n’est pas une mesure de maîtrise et n’est pas sauvegardé dans cette version de test.</p><button id="wbRestart" class="btn primary">Revoir les expressions</button><a class="btn" href="lesson.html?id=6&amp;view=library">Retour à la leçon 6</a></section>`;$('wbRestart').onclick=intro;
 }
 window.addEventListener('pagehide',()=>{stopListening();Decoder.stopAudio();});intro();
})();
