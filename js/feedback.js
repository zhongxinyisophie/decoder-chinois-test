(()=>{
 const $=id=>document.getElementById(id),fields=['tested','completed','useful','change','friction','device','browser'],key='decoder-feedback-draft-v1';
 const config=window.DECODER_FEEDBACK_CONFIG||{},email=String(config.email||'').trim();
 const recipient=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?email:'';
 $('channelNotice').textContent=recipient?'准备好后可打开邮件，或复制到聊天中发送。Tu pourras ouvrir un e-mail ou copier ton retour dans un message.':'当前使用聊天发送：准备文本后，复制并发给邀请你试用的 Xinyi。Pour le moment, prépare le texte puis copie-le dans ta conversation avec Xinyi.';
 try{const draft=JSON.parse(sessionStorage.getItem(key)||'{}');fields.forEach(id=>{if(typeof draft[id]==='string')$(id).value=draft[id];});}catch(e){}
 const params=new URLSearchParams(location.search),lesson=params.get('lesson');if(['1','2','3','4','mixed'].includes(lesson))$('tested').value=lesson;
 $('feedbackForm').addEventListener('input',()=>{$('delivery').classList.add('hidden');$('change').setCustomValidity('');try{sessionStorage.setItem(key,JSON.stringify(Object.fromEntries(fields.map(id=>[id,$(id).value]))));}catch(e){}});
 $('feedbackForm').onsubmit=e=>{
  e.preventDefault();$('change').setCustomValidity($('change').value.trim()?'':'请填写一句建议，或填写“没有”。Écris une suggestion ou « rien ».');if(!$('feedbackForm').reportValidity())return;
  const report=['Feedback — Décoder le chinois',...fields.map(id=>$(id).labels[0].textContent+' : '+($(id).tagName==='SELECT'?($(id).value?$(id).selectedOptions[0].textContent:'—'):($(id).value.trim()||'—')))].join('\n');
  $('report').value=report;$('sendStatus').textContent='';$('delivery').classList.remove('hidden');
  $('share').hidden=!navigator.share;
  if(recipient){$('email').classList.remove('hidden');$('email').href='mailto:'+recipient+'?subject='+encodeURIComponent('Feedback — Décoder le chinois')+'&body='+encodeURIComponent(report);}
  $('report').focus();
 };
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText($('report').value);$('sendStatus').textContent='已复制，尚未发送。请粘贴到与 Xinyi 的聊天并发送。Copié, mais pas encore envoyé. Colle le texte dans ta conversation avec Xinyi, puis envoie-le.';}catch(e){$('report').focus();$('report').select();$('sendStatus').textContent='自动复制不可用。请长按文本全选并复制，再粘贴发送。La copie automatique est indisponible. Sélectionne et copie le texte, puis colle-le dans ton message.';}};
 $('share').onclick=async()=>{const b=$('share');b.disabled=true;try{await navigator.share({title:'Feedback — Décoder le chinois',text:$('report').value});$('sendStatus').textContent='分享菜单已关闭。请在所选应用确认收件人和发送结果。Le menu de partage est fermé. Vérifie le destinataire et l’envoi dans l’application choisie.';}catch(e){$('sendStatus').textContent=e.name==='AbortError'?'已取消，回答仍在本页。Envoi annulé ; ton texte reste disponible ici.':'无法分享，请用复制方式。Partage indisponible : utilise la copie.';}finally{b.disabled=false;}};
 $('email').onclick=()=>{$('sendStatus').textContent='请在邮件应用中确认收件地址并点击发送。打开邮件不代表已送达。Vérifie l’adresse et appuie sur Envoyer dans ton application de messagerie. L’ouverture de l’e-mail ne confirme pas sa réception.';};
})();
