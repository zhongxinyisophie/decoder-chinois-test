(function(){
 const host=Decoder.$('lessonCards');
 const entries=Object.entries(window.DECODER_CATALOG||{}).sort((a,b)=>Number(a[0])-Number(b[0]));
 host.innerHTML=entries.map(([id,d])=>`<div class="card stack"><div><div class="h2">${d.title}</div><div class="small">${d.fr}</div></div><a class="btn" href="lesson.html?id=${id}">Ouvrir</a></div>`).join('');
})();
