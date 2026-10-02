(function(){
 const host=Decoder.$('lessonCards');
 const entries=Object.entries(window.DECODER_CATALOG||{}).sort((a,b)=>Number(a[0])-Number(b[0]));
 host.innerHTML=entries.map(([id,d])=>`<div class="card stack"><div><div class="h2">${d.title}</div><div class="small">${d.fr}</div></div><a class="btn" href="lesson.html?id=${id}">Ouvrir</a></div>`).join('');
 try{
  const h=JSON.parse(localStorage.getItem('decoder-focus-v1')||'{}'),pending=h.pending,last=h.last,item=pending||last;
  if(item&&window.DECODER_CATALOG[item.lesson]){
   const box=Decoder.$('continuePractice'),d=window.DECODER_CATALOG[item.lesson];box.classList.remove('hidden');
   const title=document.createElement('div');title.className='h2';title.textContent=pending?'接着上次练 · Reprendre ma pratique':'下一次，从这里开始 · Revenir à ma pratique';box.append(title);
   const detail=document.createElement('div');detail.className='small';detail.textContent=d.title+(pending?' · 已保存位置 / position enregistrée':' · 上轮完成对比 / contenus comparés : '+(Number(last.compared)||0));box.append(detail);
   const link=document.createElement('a');link.className='btn primary';link.href='lesson.html?id='+item.lesson+'&mode=focus';link.textContent=pending?'继续跟读 · Continuer':'开始跟读 · Pratiquer';box.append(link);
   const note=document.createElement('div');note.className='small';note.textContent='仅当前浏览器保存进度；上一轮录音已清除。La position reste dans ce navigateur ; les anciens audios sont effacés.';box.append(note);
  }
 }catch(e){}
})();
