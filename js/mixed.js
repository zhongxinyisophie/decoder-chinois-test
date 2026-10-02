(async function(){
 const $=Decoder.$,cfg=window.DECODER_MIXING;
 const storageKey='decoder-mixed-review-v1';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=items=>{const a=[...items];for(let n=a.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[a[n],a[j]]=[a[j],a[n]];}return a;};
 let history={},lessons={},tasks=[],i=0,state={},timer=null,advancing=false;
 let stats={first:0,objective:0,oral:0,oralSuccess:0,review:0,reviewItems:[],run:0,best:0};
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))history=saved;}catch(e){}
 const previous=t=>{const h=history[t.id];return h&&typeof h==='object'?h:{};};
 const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(history));}catch(e){$('storageNotice').hidden=false;$('storageNotice').textContent='本次仍可练习，但复习记录无法保存。La séance reste disponible, mais son historique ne peut pas être enregistré.';}};
 function stop(){if(timer!==null){clearInterval(timer);timer=null;}Decoder.stopAudio();}
 window.addEventListener('pagehide',stop);
 function pairWeight(pair){return (cfg.pairs.find(p=>p.lessons.join('-')===pair.join('-'))||{}).weight||1;}
 function makePool(){
  if(!Array.isArray(cfg.sequence)||cfg.sequence.length!==cfg.count||cfg.count<8||cfg.count>12)throw new Error('Invalid session size');
  const pool=[];
  for(const group of cfg.wordGroups){
   const D=lessons[group.lesson];
   for(const text of group.words){
    const word=D.active.find(w=>w[0]===text);
    if(!word||!D.audio||!D.audio[text])throw new Error('Missing word recording: '+text);
    for(const kind of ['listen','meaning'])pool.push({kind,lesson:group.lesson,pair:group.pair,w:word,id:`${kind}:${group.lesson}:${text}`,key:`word:${group.lesson}:${text}`,baseWeight:pairWeight(group.pair)});
   }
  }
  for(const ref of cfg.segments)pool.push({...ref,kind:'segment',id:`segment:${ref.lesson}`,key:`segment:${ref.lesson}`,baseWeight:pairWeight(ref.pair)});
  for(const p of cfg.pairs)p.tasks.forEach((t,j)=>{if(t.kind==='speak')pool.push({...t,pair:p.lessons,id:p.lessons.join('-')+':'+j,key:'speak:'+p.lessons.join('-')+':'+j,baseWeight:p.weight||1});});
  return pool;
 }
 function buildTasks(){
  const pool=makePool(),selected=[],used=new Set(),pairCounts={},lessonCounts={};
  for(const kind of cfg.sequence){
   let candidates=pool.filter(t=>t.kind===kind&&!used.has(t.key));
   // Spread the first four objective activities over all four lessons.
   if(kind!=='speak'&&Object.keys(lessonCounts).length<4){const unseen=candidates.filter(t=>!lessonCounts[t.lesson]);if(unseen.length)candidates=unseen;}
   if(!candidates.length)throw new Error('Insufficient tasks for '+kind);
   const weights=candidates.map(t=>{
    const h=previous(t),last=Number(h.last)||0;
    const days=last?Math.max(0,(Date.now()-last)/86400000):7;
    const streak=Math.max(0,Math.min(Number(h.streak)||0,5));
    const interval=Math.min(30,2**streak);
    const due=1+Math.min(8,days/interval);
    const need=h.again?3*Math.max(8,due):due;
    return t.baseWeight*need/(1+(pairCounts[t.pair.join('-')]||0)*2)/(1+(lessonCounts[t.lesson]||0));
   });
   let draw=Math.random()*weights.reduce((a,b)=>a+b,0),index=weights.length-1;
   for(let n=0;n<weights.length;n++){draw-=weights[n];if(draw<=0){index=n;break;}}
   const task=candidates[index];selected.push(task);used.add(task.key);
   const key=task.pair.join('-');pairCounts[key]=(pairCounts[key]||0)+1;
   if(task.lesson)lessonCounts[task.lesson]=(lessonCounts[task.lesson]||0)+1;
  }
  return selected;
 }
 function mistake(t){
  state.errors++;stats.run=0;
  const old=previous(t);
  // Persist a real error immediately, including when the learner leaves mid-question.
  history[t.id]={...old,last:Date.now(),again:true,streak:0,source:'objective',objectiveErrors:(Number(old.objectiveErrors)||0)+1};save();
 }
 function finishTask(t,again){
  const old=previous(t),objective=t.kind!=='speak';
  history[t.id]={...old,last:Date.now(),again,streak:again?0:(Number(old.streak)||0)+1,source:objective?'objective':'self',lastErrors:objective?state.errors:0,assisted:!!state.assisted};save();
  if(objective)stats.objective++;else{stats.oral++;if(!again)stats.oralSuccess++;}
  if(again){stats.review++;stats.reviewItems.push(t.kind==='speak'?t.q:t.w?t.w[0]:lessons[t.lesson].segment[0]);}
 }
 function advance(again){
  if(advancing)return;advancing=true;
  const t=tasks[i];finishTask(t,again);stop();i++;
  if(i>=tasks.length)done();else render();
 }
 function shell(t,kicker,title,help,body){
  $('host').innerHTML=`<div class="card stack"><div><div class="task-kicker">${escape(kicker)} · L${t.lesson||t.pair.join(' + L')}</div><div class="task-title">${title}</div><div class="task-help">${help}</div></div>${body}<div id="feedback" class="feedback" role="status" aria-live="polite"></div><button id="n" class="btn primary" disabled>下一题 · Continuer</button></div>`;
 }
 function solved(t,answer){
  if(state.solved)return;state.solved=true;
  if(!state.errors&&!state.assisted){stats.first++;stats.run++;stats.best=Math.max(stats.best,stats.run);}
  else stats.run=0;
  $('feedback').className='success';
  $('feedback').innerHTML=`<b>${state.errors||state.assisted?'完成了！Bien joué !':'一次认出来了！Bien trouvé !'}</b><div>${answer}</div>${stats.run>=2?`<div class="small">连续独立答对 ${stats.run} 题 · ${stats.run} bonnes réponses d’affilée</div>`:''}`;
  $('n').disabled=false;
  $('n').onclick=()=>advance(state.errors>0||state.assisted);
 }
 function wordTask(t){
  const D=lessons[t.lesson],listen=t.kind==='listen';Decoder.currentLesson=D;
  const options=shuffle([t.w,...shuffle(D.active.filter(w=>w[0]!==t.w[0])).slice(0,2)]);
  shell(t,listen?'听辨 · Écoute':'认义 · Reconnais',listen?'你听到了哪个词？<br>Quel mot entends-tu ?':'这个词是什么意思？<br>Que veut dire ce mot ?',listen?'先听你的老师，再选汉字。Écoute ton enseignante, puis choisis les caractères.':'先认汉字，答对后再听老师。Lis les caractères ; écoute le modèle après ta réponse.',`${listen?'<button id="play" class="btn soft">▶ 听录音 · Écouter</button>':`<div class="bigcn center">${escape(t.w[0])}</div>`}<div class="${listen?'grid3':'stack'}">${options.map((w,n)=>`<button class="choice ${listen?'choice-hanzi':'choice-meaning'} opt" data-index="${n}">${escape(listen?w[0]:w[2])}</button>`).join('')}</div><button id="hintBtn" class="btn link" aria-controls="hint" aria-expanded="false">需要拼音？· Besoin du pinyin ?</button><div id="hint" class="hidden notice pinyin-text">${escape(t.w[1])}</div>${listen?'':'<button id="model" class="hidden btn soft">▶ 听老师的读法 · Écouter le modèle</button>'}`);
  if(listen){document.querySelectorAll('.opt').forEach(b=>b.disabled=true);$('play').onclick=()=>{Decoder.say(t.w[0]);if(!state.heard){state.heard=true;document.querySelectorAll('.opt').forEach(b=>b.disabled=false);}};}
  else $('model').onclick=()=>Decoder.say(t.w[0]);
  $('hintBtn').onclick=()=>{if($('hint').classList.contains('hidden')&&!state.solved)state.assisted=true;$('hint').classList.toggle('hidden');$('hintBtn').setAttribute('aria-expanded',String(!$('hint').classList.contains('hidden')));};
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
   if(state.solved)return;
   const selected=options[Number(b.dataset.index)];
   if(selected[0]!==t.w[0]){mistake(t);b.disabled=true;$('feedback').textContent=listen?'再听一次，换一个试试。Réécoute, puis essaie un autre mot.':'再看一眼，换一个试试。Regarde encore, puis essaie une autre réponse.';return;}
   document.querySelectorAll('.opt').forEach(x=>x.disabled=true);
   if(!listen)$('model').classList.remove('hidden');
   solved(t,`<span class="bigcn" style="font-size:25px">${escape(t.w[0])}</span> · ${escape(t.w[2])}`);
  });
 }
 function segmentTask(t){
  const D=lessons[t.lesson],[sentence,parts]=D.segment;Decoder.currentLesson=D;
  let chosen=[];const tokens=shuffle(parts.map((text,index)=>({text,index})));
  shell(t,'语块拼图 · Puzzle de phrase','把语块排成句子。<br>Construis la phrase.','先听录音，再点击语块。Écoute, puis touche les groupes dans le bon ordre.',`<button id="play" class="btn soft">▶ 听句子 · Écouter</button><div class="row">${tokens.map(token=>`<button class="chip token" data-index="${token.index}">${escape(token.text)}</button>`).join('')}</div><div class="notice"><div id="answer" class="row" aria-live="polite"></div></div><div class="row"><button id="undo" class="btn" disabled>撤回 · Annuler</button><button id="reset" class="btn">清空 · Effacer</button></div><button id="check" class="btn soft" disabled>检查顺序 · Vérifier</button>`);
  $('play').onclick=()=>Decoder.say(sentence);
  function draw(){
   $('answer').innerHTML=chosen.length?chosen.map(index=>`<span class="pill">${escape(parts[index])}</span>`).join(''):'<span class="small">点击上面的语块 · Touche les groupes ci-dessus</span>';
   document.querySelectorAll('.token').forEach(b=>b.disabled=state.solved||chosen.includes(Number(b.dataset.index)));
   $('undo').disabled=state.solved||!chosen.length;$('reset').disabled=state.solved;
   $('check').disabled=state.solved||chosen.length!==parts.length;
   if(!state.solved){$('feedback').textContent='';$('n').disabled=true;}
  }
  document.querySelectorAll('.token').forEach(b=>b.onclick=()=>{if(!state.solved){chosen.push(Number(b.dataset.index));draw();}});
  $('undo').onclick=()=>{if(!state.solved){chosen.pop();draw();}};
  $('reset').onclick=()=>{if(!state.solved){chosen=[];draw();}};
  $('check').onclick=()=>{
   if(state.solved)return;
   if(chosen.every((index,n)=>index===n)){solved(t,escape(sentence));draw();}
   else{mistake(t);$('check').disabled=true;$('feedback').textContent='再听一次，撤回或重来。Réécoute ; annule un groupe ou recommence.';}
  };draw();
 }
 function speakTask(t){
  shell(t,'跨课开口 · À toi de parler',escape(t.q),'准备好后，开口说一句。Quand tu es prêt(e), réponds à voix haute.',`<button id="go" class="btn soft">准备开口 · Je me lance</button><div id="countdown" class="notice center" role="status">准备好了吗？· Prêt(e) ?</div><button id="hintBtn" class="btn link" aria-controls="hint" aria-expanded="false">卡住了？看提示 · Besoin d’un indice ?</button><div id="hint" class="hidden notice">${escape(t.hint)}</div><div class="small">口语由你自评，不计入客观正确率。Évalue toi-même ta réponse orale ; elle ne compte pas dans le score des questions corrigées.</div><button id="again" class="btn" disabled>还要练 · À retravailler</button>`);
  $('n').textContent='我说出来了 · J’ai répondu';
  $('hintBtn').onclick=()=>{$('hint').classList.toggle('hidden');$('hintBtn').setAttribute('aria-expanded',String(!$('hint').classList.contains('hidden')));};
  $('go').onclick=()=>{
   $('go').disabled=true;let seconds=3;$('countdown').textContent=seconds;
   timer=setInterval(()=>{seconds--;if(seconds>0){$('countdown').textContent=seconds;return;}clearInterval(timer);timer=null;$('countdown').textContent='现在说吧！· À toi !';$('again').disabled=false;$('n').disabled=false;},1000);
  };
  $('again').onclick=()=>advance(true);$('n').onclick=()=>advance(false);
 }
 function render(){
  advancing=false;state={errors:0,assisted:false,solved:false};
  $('count').textContent=`挑战 ${i+1} / ${tasks.length} · Défi ${i+1} / ${tasks.length}`;
  $('bar').style.width=(i/tasks.length*100)+'%';
  const t=tasks[i];if(t.kind==='segment')segmentTask(t);else if(t.kind==='speak')speakTask(t);else wordTask(t);
 }
 function start(){
  stop();stats={first:0,objective:0,oral:0,oralSuccess:0,review:0,reviewItems:[],run:0,best:0};i=0;
  tasks=buildTasks();$('startCard').classList.add('hidden');$('session').classList.remove('hidden');render();
 }
 function done(){
  stop();$('bar').style.width='100%';$('count').textContent='完成 10 / 10 · Terminé';
  $('host').innerHTML=`<div class="card stack"><div class="title">10 个挑战完成了！<br>Défis terminés ✓</div><div class="grid3"><div class="notice">首次独立答对<br>Du premier coup<br><b class="kpi">${stats.first} / ${stats.objective}</b></div><div class="notice">口语自评：说出来了<br>Oral : « J’ai répondu »<br><b class="kpi">${stats.oralSuccess} / ${stats.oral}</b></div><div class="notice">需要巩固<br>À retravailler<br><b class="kpi">${stats.review}</b></div></div><div class="small">${stats.review?'需再练的题会更容易出现在下次复习。Les défis à retravailler auront davantage de chances de revenir.':'继续在新一轮里巩固。Consolide tes acquis dans une nouvelle séance.'}</div>${stats.reviewItems.length?`<div class="notice stack"><b>本轮需要巩固 · À revoir</b>${stats.reviewItems.map(text=>`<div>${escape(text)}</div>`).join('')}</div>`:''}<button id="restart" class="btn primary">再来 10 题 · Une nouvelle série</button><a class="btn" href="index.html">返回首页 · Accueil</a></div>`;
  $('restart').onclick=start;
 }
 try{
  const loaded=await Promise.all([1,2,3,4].map(id=>Decoder.loadLesson(id)));
  loaded.forEach((D,n)=>lessons[n+1]=D);makePool();
  $('mixedStatus').textContent='3 听辨 · 3 认义 · 2 排序 · 2 口语 / Écoute, lecture, puzzles et oral';
  $('start').disabled=false;$('start').onclick=start;
 }catch(e){
  $('mixedStatus').textContent='题目加载失败，请重试。Impossible de charger les défis. Réessaie.';
  $('start').textContent='重新加载 · Réessayer';$('start').disabled=false;$('start').onclick=()=>location.reload();
 }
})();
