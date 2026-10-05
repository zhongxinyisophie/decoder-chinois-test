/* Practice metadata is local; audio remains temporary and is never persisted. */
window.DecoderFocus=(()=>{
 const key='decoder-focus-v1',esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=()=>{try{return JSON.parse(localStorage.getItem(key))||{};}catch(e){return {};}};
 function start(D,id){
  const $=Decoder.$,pool=[...D.active,...(D.sentenceDetails||D.sentences.map(s=>[s,'','']))].filter(x=>D.audio&&D.audio[x[0]]);
  const history=read(),saved=history.pending;
  const valid=saved&&saved.lesson===id&&Array.isArray(saved.texts)&&saved.texts.length===10&&saved.texts.every(t=>pool.some(x=>x[0]===t));
  for(let j=pool.length-1;j>0;j--){const k=Math.floor(Math.random()*(j+1));[pool[j],pool[k]]=[pool[k],pool[j]];}
  const rows=valid?saved.texts.map(t=>pool.find(x=>x[0]===t)):pool.slice(0,10);
  if(rows.length<8)return;
  let index=valid?Math.min(Math.max(Number(saved.index)||0,0),rows.length-1):0,busy=false;
  const recorded=new Set(),listened=new Set(),models=new Set();
  const previous=new Set(history.practiced&&history.practiced[id]||[]);
  const save=()=>{history.pending={lesson:id,index,texts:rows.map(x=>x[0])};try{localStorage.setItem(key,JSON.stringify(history));return true;}catch(e){return false;}};
  const stored=save();
  $('startCard').classList.add('hidden');$('library').classList.add('hidden');$('session').classList.remove('hidden');
  $('host').innerHTML=`<div class="card stack focus-card"><div class="between"><div><div class="task-kicker">Une chose à la fois</div><div class="small">Écoute le modèle → enregistre-toi → compare</div></div><button id="focusExit" class="btn link">Plus tard</button></div><div id="focusItems">${rows.map((w,j)=>`<div class="stack focus-item ${j===index?'':'hidden'}" data-student-recording="${esc(w[0])}"><div class="bigcn focus-text">${esc(w[0])}</div><details class="focus-hint"><summary>Pinyin et sens</summary><div class="pinyin-text">${esc(w[1])}</div><div>${esc(w[2])}</div></details><button class="btn soft p" data-s="${esc(w[0])}">▶ Écouter le modèle</button></div>`).join('')}</div><div class="row focus-navigation"><button id="focusBack" class="btn">Précédent</button><button id="focusNext" class="btn primary">Suivant</button></div><details class="small focus-privacy"><summary>À propos des enregistrements</summary><p>${stored?'Ta position reste dans ce navigateur. ':'Ta position ne peut pas être sauvegardée. '}Les audios sont effacés à la sortie. Aucune évaluation automatique.</p></details></div>`;
  const show=()=>{document.querySelectorAll('.focus-item').forEach((x,j)=>x.classList.toggle('hidden',j!==index));$('count').textContent=`${index+1} / ${rows.length} · Pratique orale`;$('bar').style.width=(index/rows.length*100)+'%';$('focusBack').disabled=busy||index===0;$('focusNext').disabled=busy;$('focusExit').disabled=busy;$('focusNext').textContent=index===rows.length-1?'Voir mon bilan':'Suivant';save();};
  DecoderWordRecorder.mount($('focusItems'),{help:false,onBusy:b=>{busy=b;show();},onRecorded:t=>{recorded.add(t);listened.delete(t);},onListened:t=>listened.add(t)});
  document.querySelectorAll('#focusItems .p').forEach(b=>b.onclick=()=>{models.add(b.dataset.s);Decoder.say(b.dataset.s);});
  $('focusBack').onclick=()=>{DecoderWordRecorder.stopPlayback();Decoder.stopAudio();index--;show();};
  $('focusExit').onclick=()=>{DecoderWordRecorder.cleanup();location.href='index.html';};
  $('focusNext').onclick=()=>{if(busy)return;DecoderWordRecorder.stopPlayback();Decoder.stopAudio();if(index<rows.length-1){index++;show();}else finish();};
  function finish(){
   const compared=[...recorded].filter(t=>listened.has(t)&&models.has(t));
   const fresh=compared.filter(t=>!previous.has(t));
   history.practiced=history.practiced||{};history.practiced[id]=[...new Set([...previous,...compared])];delete history.pending;
   history.last={lesson:id,date:Date.now(),recorded:recorded.size,compared:compared.length};let persisted=true;try{localStorage.setItem(key,JSON.stringify(history));}catch(e){persisted=false;}
   DecoderWordRecorder.cleanup();$('bar').style.width='100%';$('count').textContent='Séance terminée';
   $('host').innerHTML=`<div class="card stack"><div class="task-kicker">Ton bilan</div><div class="title">${compared.length?'Tu as pris le temps de t’écouter.':'Ta séance s’arrête ici.'}</div><div class="grid3"><div class="notice">Enregistrés<div class="kpi">${recorded.size}</div></div><div class="notice">Modèle lancé + enregistrement + écoute complète<div class="kpi">${compared.length}</div></div><div class="notice">Première fois dans ton historique<div class="kpi">${fresh.length}</div></div></div>${compared.length?`<div class="success"><b>Contenus pratiqués</b><p>${compared.map(esc).join(' · ')}</p></div>`:''}<div class="small">Ce bilan décrit tes actions, pas la justesse de ta prononciation ni une maîtrise acquise.${persisted?' Historique limité à ce navigateur.':' Ce bilan n’a pas pu être sauvegardé.'}</div><div class="grid2"><button id="focusAgain" class="btn primary">Nouvelle séance</button><a class="btn" href="index.html">Accueil</a><a class="btn" href="feedback.html?lesson=${id}">Donner mon avis</a></div></div>`;
   $('focusAgain').onclick=()=>start(D,id);
  }
  show();
 }
 return {start};
})();
