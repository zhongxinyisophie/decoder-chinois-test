/* Local, temporary student recordings. No upload or speech scoring. */
window.DecoderWordRecorder = (() => {
 let items=[],teachers=[],owner=null,stream=null,recorder=null,playback=null,generation=0;
 const stopPlayback=()=>{if(playback){playback.pause();playback=null;}};
 const release=()=>{if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;};
 function cleanup(){
  generation++;stopPlayback();Decoder.stopAudio();
  if(recorder&&recorder.state!=='inactive'){recorder.onstop=null;try{recorder.stop();}catch(e){}}
  recorder=null;release();owner=null;
  items.forEach(x=>{if(x.url)URL.revokeObjectURL(x.url);});items=[];teachers.forEach(b=>b.disabled=false);teachers=[];
 }
 function controls(){items.forEach(x=>{x.record.disabled=!!owner&&owner!==x;x.listen.disabled=!!owner||!x.url;});teachers.forEach(b=>b.disabled=!!owner);}
 function mount(root){
  cleanup();
  teachers=[...root.querySelectorAll('.p')];
  const supported=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  root.querySelectorAll('[data-student-recording]').forEach(card=>{
   const text=card.dataset.studentRecording;
   const box=document.createElement('div');box.className='stack';
   box.innerHTML='<div class="row"><button type="button" class="btn soft student-record">🎙 录自己 · M’enregistrer</button><button type="button" class="btn student-listen" disabled>▶ 听自己 · M’écouter</button></div><div class="small student-status" role="status" aria-live="polite"></div>';
   card.append(box);
   const x={record:box.querySelector('.student-record'),listen:box.querySelector('.student-listen'),status:box.querySelector('.student-status'),url:null};items.push(x);
   x.record.setAttribute('aria-label','录自己：'+text+' · M’enregistrer : '+text);
   x.listen.setAttribute('aria-label','听自己：'+text+' · M’écouter : '+text);
   if(!supported){x.record.disabled=true;x.status.textContent='录音不可用，请在 Safari 或 Chrome 中打开并允许麦克风。Enregistrement indisponible : ouvre la page dans Safari ou Chrome et autorise le micro.';return;}
   x.record.onclick=async()=>{
    if(owner===x){
     if(recorder&&recorder.state==='recording'){recorder.stop();release();x.record.disabled=true;x.status.textContent='正在准备回听 · Préparation de l’écoute…';}
     else{generation++;owner=null;x.record.textContent='🎙 录自己 · M’enregistrer';x.record.setAttribute('aria-label','录自己：'+text+' · M’enregistrer : '+text);x.status.textContent='已取消 · Annulé';controls();}
     return;
    }
    if(owner)return;
    owner=x;controls();x.record.textContent='取消 · Annuler';x.record.setAttribute('aria-label','取消麦克风请求 · Annuler');stopPlayback();Decoder.stopAudio();
    x.status.textContent='请允许麦克风 · Autorise le micro';const token=generation;
    try{
     const acquired=await navigator.mediaDevices.getUserMedia({audio:true});
     if(token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
     stream=acquired;
     const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
     recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
     const chunks=[],current=recorder;
     current.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
     const reset=()=>{release();recorder=null;owner=null;x.record.disabled=false;x.record.textContent='🎙 重录 · Réenregistrer';x.record.setAttribute('aria-label','重录：'+text+' · Réenregistrer : '+text);controls();};
     current.onerror=()=>{current.onstop=null;try{if(current.state!=='inactive')current.stop();}catch(e){}reset();x.status.textContent='录音失败，请重试。L’enregistrement a échoué. Réessaie.';};
     current.onstop=()=>{
      if(token!==generation)return;
      const blob=new Blob(chunks,{type:current.mimeType||'audio/webm'});reset();
      if(!blob.size){x.status.textContent='没有录到声音，请重试。Aucun son enregistré. Réessaie.';return;}
      if(x.url)URL.revokeObjectURL(x.url);x.url=URL.createObjectURL(blob);controls();
      x.status.textContent='可以听自己，再听老师作比较。Écoute-toi, puis réécoute le modèle pour comparer.';
     };
     current.start();x.record.disabled=false;x.record.textContent='■ 停止 · Arrêter';x.record.setAttribute('aria-label','停止录音：'+text+' · Arrêter : '+text);x.status.textContent='正在录音，说完后点击停止。Enregistrement en cours : appuie sur Arrêter quand tu as fini.';
    }catch(e){if(token!==generation)return;release();recorder=null;owner=null;x.record.disabled=false;x.record.textContent='🎙 录自己 · M’enregistrer';x.record.setAttribute('aria-label','录自己：'+text+' · M’enregistrer : '+text);controls();x.status.textContent=e.name==='NotAllowedError'?'麦克风未获允许，请在浏览器设置中开启。Micro non autorisé : active-le dans les réglages du navigateur.':'无法开始录音，请重试。Impossible de démarrer l’enregistrement. Réessaie.';}
   };
   x.listen.onclick=()=>{
    stopPlayback();Decoder.stopAudio();const a=new Audio(x.url);playback=a;
    a.onended=()=>{if(playback===a)playback=null;};
    a.onerror=()=>{x.status.textContent='回听失败，请重新录音。Lecture impossible : réenregistre-toi.';};
    a.play().catch(()=>{x.status.textContent='回听失败，请重试。Lecture impossible : réessaie.';});
   };
  });
  const note=document.createElement('details');note.className='notice small';const help='第一课录音对比试用：先听老师，再录自己并回听。录音仅在本页临时保留，不上传；重录替换上一条，刷新或离开后清除。Essai en leçon 1 : écoute le modèle, enregistre-toi puis compare. Tes enregistrements restent temporairement sur cette page, sans envoi ; ils sont remplacés si tu réenregistres et effacés quand tu quittes ou actualises la page.';
  note.innerHTML='<summary><b>录音对比：使用说明 · Mode d’emploi</b></summary>';const info=document.createElement('div');info.textContent=help;note.append(info);root.prepend(note);
 }
 document.addEventListener('click',e=>{if(e.target.closest('.p')){stopPlayback();if(owner)e.stopImmediatePropagation();}},true);
 window.addEventListener('pagehide',cleanup);
 return {mount,cleanup};
})();
