(async()=>{
 const $=Decoder.$,h=DecoderReview.read(),esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 try{
  const lessons=await Promise.all([1,2,3,4].map(id=>Decoder.loadLesson(id))),refs=[];
  lessons.forEach((D,j)=>{const lesson=j+1;D.active.forEach(w=>['listen','meaning'].forEach(kind=>refs.push({id:`${kind}:${lesson}:${w[0]}`,text:w[0],lesson,label:kind==='listen'?'Écoute':'Sens'})));refs.push({id:`segment:${lesson}`,text:D.segment[0],lesson,label:'Ordre des groupes'});});
  DECODER_MIXING.pairs.forEach(p=>p.tasks.forEach((t,j)=>{if(t.kind==='speak')refs.push({id:p.lessons.join('-')+':'+j,text:t.q,lesson:p.lessons.join(' + '),label:'Autoévaluation orale'});}));
  const pending=refs.filter(r=>h[r.id]&&h[r.id].again===true).sort((a,b)=>(Number(h[b.id].last)||0)-(Number(h[a.id].last)||0));
  $('reviewStatus').textContent=!DecoderReview.available()?'L’historique est inaccessible ; tu peux continuer à pratiquer dans les leçons.':pending.length?`${pending.length} activités à reprendre ; un même mot peut apparaître dans plusieurs types d’exercice.`:'Aucun contenu en attente. Les activités à reprendre apparaîtront ici après tes essais.';
  if(pending.length)$('practiceReview').classList.remove('hidden');
  $('reviewList').innerHTML=pending.map(r=>{const x=h[r.id],reason=x.source==='self'?'Tu as choisi de retravailler':x.assisted&&!x.lastErrors?'Réponse avec aide':'À reprendre après une erreur';return `<article class="card stack"><div class="small">L${r.lesson} · ${r.label}</div><div class="bigcn" style="font-size:26px">${esc(r.text)}</div><div class="small">${reason}</div></article>`;}).join('');
 }catch(e){$('reviewStatus').textContent='Chargement impossible : actualise la page.';}
})();
