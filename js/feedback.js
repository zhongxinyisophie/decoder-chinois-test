(()=>{
 const $=id=>document.getElementById(id),fields=['tested','completed','useful','change','friction','device','browser'],key='decoder-feedback-draft-v1';
 const config=window.DECODER_FEEDBACK_CONFIG||{},email=String(config.email||'').trim();
 const recipient=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';
 const address=$('recipientAddress');
 if(address){address.textContent=recipient||'Adresse indisponible : contacte Xinyi par ton canal habituel.';}
 $('channelNotice').textContent=recipient?'Tu pourras ouvrir un e-mail ou copier ton retour dans un message.':'Pour le moment, prépare le texte puis copie-le dans ta conversation avec Xinyi.';
 try{const draft=JSON.parse(sessionStorage.getItem(key)||'{}');fields.forEach(id=>{if(typeof draft[id]==='string'){$(id).value=draft[id];if($(id).tagName==='SELECT'&&!$(id).value&&draft[id])$(id).value=draft[id].split(' · ').pop();}});}catch(e){}
 const params=new URLSearchParams(location.search),lesson=params.get('lesson');if(['1','2','3','4','5','6','7','8','9','10','mixed'].includes(lesson))$('tested').value=lesson;
 $('feedbackForm').addEventListener('input',()=>{$('delivery').classList.add('hidden');$('prepareStatus').textContent='';$('change').setCustomValidity('');try{sessionStorage.removeItem(DecoderFeedbackDelivery.key);sessionStorage.setItem(key,JSON.stringify(Object.fromEntries(fields.map(id=>[id,$(id).value]))));}catch(e){}});
 $('feedbackForm').onsubmit=e=>{
  e.preventDefault();$('change').setCustomValidity($('change').value.trim()?'':'Écris une suggestion ou « rien ».');if(!$('feedbackForm').reportValidity())return;
  const report=['Feedback — Décoder le chinois',...fields.map(id=>$(id).labels[0].textContent+' : '+($(id).tagName==='SELECT'?($(id).value?$(id).selectedOptions[0].textContent:'—'):($(id).value.trim()||'—')))].join('\n');
  const draft=Object.fromEntries(fields.map(id=>[id,$(id).value]));
  try{
   sessionStorage.setItem(key,JSON.stringify(draft));
   const payload=JSON.stringify({report});sessionStorage.setItem(DecoderFeedbackDelivery.key,payload);
   if(sessionStorage.getItem(DecoderFeedbackDelivery.key)!==payload)throw new Error('Storage unavailable');
  }catch(error){
   $('prepareStatus').textContent='Le passage à la page suivante est indisponible. Ton texte est prêt ci-dessous ; tu peux l’envoyer sans le retaper.';
   DecoderFeedbackDelivery.show(report);$('delivery').scrollIntoView({block:'start',behavior:'auto'});return;
  }
  location.assign('feedback-send.html');
 };
})();
