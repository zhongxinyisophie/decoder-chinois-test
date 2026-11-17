/* Show the lesson library as a directory, then one section at a time. */
window.DecoderLibraryNavigation={
 mount({root,sections,onExit,onSection}){
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const entries=sections.filter(section=>section.html&&section.count>0);
  const cleanup=()=>{Decoder.stopAudio();if(window.DecoderWordRecorder)DecoderWordRecorder.cleanup();};
  const moveToTop=()=>root.scrollIntoView({block:'start',behavior:'auto'});
  function menu(previous){
   cleanup();
   root.innerHTML=`<div class="between"><button id="closeLib" class="btn">← Retour à la leçon</button><h2 id="libraryTitle" class="h2" tabindex="-1">Tout le contenu</h2></div><p class="small">Choisis une rubrique pour consulter son contenu.</p><nav class="grid2" aria-label="Rubriques de la leçon">${entries.map((section,index)=>`<button class="card stack library-entry" data-library-section="${index}" type="button"><span class="between"><span class="h2">${esc(section.title)}</span><span aria-hidden="true">→</span></span><span class="small">${esc(section.detail)}</span></button>`).join('')}</nav>`;
   root.querySelector('#closeLib').onclick=()=>{cleanup();onExit();};
   root.querySelectorAll('[data-library-section]').forEach(button=>button.onclick=()=>open(Number(button.dataset.librarySection)));
   moveToTop();
   const target=previous===undefined?root.querySelector('#libraryTitle'):root.querySelector(`[data-library-section="${previous}"]`);
   if(target)target.focus({preventScroll:true});
  }
  function open(index){
   const section=entries[index];if(!section)return;cleanup();
   root.innerHTML=`<div class="between"><button id="backToLibrary" class="btn">← Sommaire</button><span class="small">${index+1} / ${entries.length} rubriques</span></div><section id="librarySection" aria-label="${esc(section.title)}">${section.html}</section>`;
   root.querySelector('#backToLibrary').onclick=()=>menu(index);
   const panel=root.querySelector('#librarySection');
   if(onSection)onSection(panel);
   const heading=panel.querySelector('.h2');if(heading){heading.setAttribute('role','heading');heading.setAttribute('aria-level','2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
   moveToTop();
  }
  menu();
 }
};
