/* Final oral task: temporary audio, explicit cancellation and resource ownership. */
window.DecoderFinalRecorder=(()=>{
 let dispose=()=>{};
 function mount(host,{lesson,onRecorded=()=>{},busy=()=>{}}){
  dispose();
  let generation=0,stream=null,mr=null,timer=null,url=null,requesting=false,closed=false;
  const $=id=>host.querySelector('#'+id);
  const release=()=>{if(timer!==null)clearInterval(timer);timer=null;if(stream)stream.getTracks().forEach(t=>{t.onended=null;t.stop();});stream=null;};
  const revoke=()=>{const audio=$('myAudio');if(audio)audio.pause();if(url)URL.revokeObjectURL(url);url=null;};
  const cancel=()=>{generation++;requesting=false;if(mr){mr.onstop=null;mr.onerror=null;mr.ondataavailable=null;try{if(mr.state!=='inactive')mr.stop();}catch(e){}mr=null;}release();busy(false);};
  const fail=message=>{cancel();idle(message);};
  const stop=()=>{if(!mr||mr.state!=='recording')return;const button=$('stop');if(button)button.disabled=true;try{mr.stop();release();}catch(e){fail('L’enregistrement a échoué. Réessaie.');}};
  function idle(message=''){
   if(closed)return;
   host.innerHTML='<div id="recStatus" class="small" role="status"></div><button id="sr" class="btn recording-main">🎙 Enregistrer ma réponse</button><div class="small recording-help">Tu pourras l’écouter, la refaire puis la partager avec Xinyi. L’audio reste temporairement sur cette page.</div>';
   $('recStatus').textContent=message;$('sr').onclick=start;
  }
  async function start(){
   if(requesting){cancel();idle('Demande annulée.');return;}
   if(mr||closed)return;
   revoke();requesting=true;const token=++generation;
   $('sr').textContent='Annuler';$('recStatus').textContent='Autorise le micro, ou annule pour continuer sans enregistrer.';
   Decoder.stopAudio();
   try{
    const acquired=await navigator.mediaDevices.getUserMedia({audio:true});
    if(closed||token!==generation){acquired.getTracks().forEach(t=>t.stop());return;}
    stream=acquired;requesting=false;
    const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
    const current=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);mr=current;
    const chunks=[];let seconds=0;
    current.ondataavailable=e=>{if(token===generation&&e.data&&e.data.size)chunks.push(e.data);};
    current.onerror=()=>{if(token===generation&&!closed)fail('L’enregistrement a été interrompu. Réessaie.');};
    current.onstop=()=>{
     if(token!==generation||closed)return;
     release();mr=null;busy(false);
     const type=current.mimeType||mime||'audio/webm',blob=new Blob(chunks,{type});
     if(!blob.size){idle('Aucun son enregistré. Réessaie.');return;}
     url=URL.createObjectURL(blob);onRecorded();review(blob,type,token);
    };
    stream.getTracks().forEach(t=>t.onended=stop);
    current.start();busy(true);
    host.innerHTML='<div class="recording-live"><div class="recording-dot"></div><div><b>Enregistrement en cours</b><div class="small" id="timer" role="status">0:00</div></div></div><button id="stop" class="btn soft recording-stop">■ Arrêter</button>';
    $('stop').onclick=stop;
    timer=setInterval(()=>{seconds++;const el=$('timer');if(el)el.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');},1000);
   }catch(e){if(token!==generation||closed)return;fail(e.name==='NotAllowedError'?'Micro non autorisé. Vérifie les réglages du navigateur, puis réessaie.':'Micro indisponible ou enregistrement impossible. Réessaie, ou réponds à voix haute.');}
  }
  function review(blob,type,token){
   const ext=type.includes('mp4')?'m4a':type.includes('ogg')?'ogg':'webm';
   const filename=`decoder-chinois-L${String(lesson).padStart(2,'0')}-${new Date().toISOString().slice(0,10)}.${ext}`;
   host.innerHTML=`<div class="recording-review stack"><div><div class="task-kicker">Avant d’envoyer</div><div class="task-title recording-title">Écoute ta réponse.</div><div class="task-help">Tu peux la refaire, la partager ou la télécharger avant de quitter.</div></div><audio id="myAudio" controls></audio><div id="recStatus" class="small" role="status"></div><div class="recording-actions"><button id="redoRec" class="btn">↻ Réenregistrer</button><button id="shareRec" class="btn primary">Partager le fichier audio</button></div><div id="shareNote" class="small recording-help" role="status"></div><a id="downloadRec" class="btn link recording-download">Télécharger l’enregistrement</a></div>`;
   $('myAudio').src=url;$('downloadRec').href=url;$('downloadRec').download=filename;
   $('myAudio').onerror=()=>{$('recStatus').textContent='Lecture impossible. Télécharge le fichier ou réenregistre-toi.';};
   $('redoRec').onclick=()=>{revoke();idle();};
   const fallback=()=>{$('shareNote').textContent='Télécharge le fichier, puis joins-le à ton message pour Xinyi. Le téléchargement n’envoie pas le fichier.';$('downloadRec').className='btn primary recording-download';};
   let file,canShare=false;
   try{file=new File([blob],filename,{type});canShare=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]}));}catch(e){}
   if(!canShare){$('shareRec').hidden=true;$('shareRec').classList.add('hidden');fallback();return;}
   $('shareNote').textContent='Choisis ton application puis Xinyi comme destinataire. L’ouverture du partage ne confirme pas l’envoi.';
   $('shareRec').onclick=async()=>{
    const button=$('shareRec');if(button.disabled)return;button.disabled=true;
    try{await navigator.share({files:[file]});if(!closed&&token===generation&&$('shareNote'))$('shareNote').textContent='Menu de partage fermé. Vérifie dans ton application que le fichier a bien été envoyé à Xinyi.';}
    catch(e){if(!closed&&token===generation&&$('shareNote')){if(e.name==='AbortError')$('shareNote').textContent='Partage annulé. Tu peux réessayer ou télécharger le fichier.';else fallback();}}
    finally{if(!closed&&token===generation&&$('shareRec')===button)button.disabled=false;}
   };
  }
  const onHide=()=>{if(!document.hidden)return;if(requesting){cancel();idle('Demande annulée ; tu peux réessayer.');}else stop();};
  const onPageHide=event=>{if(event&&event.persisted){cancel();revoke();idle('L’enregistrement précédent a été effacé. Tu peux réessayer.');}else dispose();};
  dispose=()=>{if(closed)return;closed=true;cancel();revoke();document.removeEventListener('visibilitychange',onHide);window.removeEventListener('pagehide',onPageHide);};
  document.addEventListener('visibilitychange',onHide);window.addEventListener('pagehide',onPageHide);
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){host.innerHTML='<div class="notice small">Micro indisponible ici. Tu peux répondre à voix haute ; pour t’enregistrer, ouvre cette page dans Safari ou Chrome.</div>';return;}
  idle();
 }
 return {mount,cleanup:()=>dispose()};
})();
