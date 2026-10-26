/* A prepared report is kept in this tab only; no request sends it to a server. */
window.DecoderFeedbackDelivery=(()=>{
 const key='decoder-feedback-ready-v1';
 const $=id=>document.getElementById(id);
 function show(report){
  const email=String((window.DECODER_FEEDBACK_CONFIG||{}).email||'').trim();
  const recipient=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';
  $('delivery').classList.remove('hidden');$('report').value=report;
  $('recipientAddress').textContent=recipient||'Contacte Xinyi par ton canal habituel.';
  if(recipient){$('email').classList.remove('hidden');$('email').href='mailto:'+recipient+'?subject='+encodeURIComponent('Feedback — Décoder le chinois')+'&body='+encodeURIComponent(report);}
  $('email').onclick=()=>{$('sendStatus').textContent='Vérifie l’adresse et appuie sur Envoyer dans ta messagerie. Ce site ne peut pas confirmer la réception.';};
  $('copy').onclick=async()=>{
   try{await navigator.clipboard.writeText(report);$('sendStatus').textContent='Copié, mais pas encore envoyé. Colle le texte dans un e-mail à '+(recipient||'Xinyi')+', puis envoie-le.';}
   catch(e){$('reportDetails').open=true;$('report').focus();$('report').select();$('sendStatus').textContent='Copie automatique indisponible : sélectionne et copie le texte affiché, puis colle-le dans ton e-mail.';}
  };
  $('share').classList.toggle('hidden',!navigator.share);
  $('share').onclick=async()=>{const button=$('share');button.disabled=true;try{await navigator.share({title:'Feedback — Décoder le chinois',text:report});$('sendStatus').textContent='Menu de partage fermé. Vérifie l’envoi dans l’application choisie.';}catch(e){$('sendStatus').textContent=e.name==='AbortError'?'Partage annulé ; ton texte reste disponible.':'Partage indisponible : utilise la copie.';}finally{button.disabled=false;}};
 }
 if($('deliveryPage')){
  let report='';try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved&&typeof saved.report==='string'&&saved.report.length<=12000)report=saved.report;}catch(e){}
  if(report)show(report);else{$('emptyReport').classList.remove('hidden');}
 }
 return {key,show};
})();
