/* Proposed enrichment approved for a local pilot; separate from PDF lesson banks. */
window.DECODER_WORD_BOX={
 id:'transport',title:'Se déplacer',lesson:6,
 scope:'Passager en train, en voiture ou en métro ; cycliste à vélo. Pas de conduite automobile dans cette activité.',
 verbs:[{text:'坐',pinyin:'zuò',fr:'prendre un transport / voyager comme passager'},{text:'骑',pinyin:'qí',fr:'se déplacer à califourchon, par exemple à vélo'}],
 items:[
  {id:'train',noun:'火车',pinyin:'huǒchē',fr:'le train',verb:'坐',phrase:'坐火车',phrasePinyin:'zuò huǒchē',meaning:'prendre le train',audio:null},
  {id:'car',noun:'汽车',pinyin:'qìchē',fr:'la voiture',verb:'坐',phrase:'坐汽车',phrasePinyin:'zuò qìchē',meaning:'voyager en voiture comme passager',audio:null},
  {id:'metro',noun:'地铁',pinyin:'dìtiě',fr:'le métro',verb:'坐',phrase:'坐地铁',phrasePinyin:'zuò dìtiě',meaning:'prendre le métro',audio:'audio/lesson-06/r06-01.m4a'},
  {id:'bike',noun:'自行车',pinyin:'zìxíngchē',fr:'le vélo',verb:'骑',phrase:'骑自行车',phrasePinyin:'qí zìxíngchē',meaning:'faire du vélo',audio:null}
 ],
 listening:{
  source:'Leçon 6 — expressions déjà étudiées, enregistrements indépendants approuvés',
  items:[
   {id:'metro',phrase:'坐地铁',phrasePinyin:'zuò dìtiě',fr:'prendre le métro',unit:'expression',audio:'audio/lesson-06/r06-01.m4a',foil:'taxi'},
   {id:'taxi',phrase:'打车',phrasePinyin:'dǎchē',fr:'prendre un taxi / un VTC',unit:'expression',audio:'audio/lesson-06/r06-08.m4a',foil:'metro'},
   {id:'forward',phrase:'往前走',phrasePinyin:'wǎng qián zǒu',fr:'avancer / aller tout droit',unit:'expression',audio:'audio/lesson-06/r06-03.m4a',foil:'left'},
   {id:'left',phrase:'左转',phrasePinyin:'zuǒ zhuǎn',fr:'tourner à gauche',unit:'expression',audio:'audio/lesson-06/r06-04.m4a',foil:'forward'}
  ]
 }
};
window.DecoderWordBoxLogic={
 shuffle(items,random=Math.random){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;},
 listeningQuestions(bank,random=Math.random){
  const pool=(bank.listening&&bank.listening.items)||[];
  return this.shuffle(pool,random).flatMap(item=>{
   const foil=pool.find(other=>other.id===item.foil);
   if(!item.audio||!foil||!foil.audio||item.id===foil.id||item.audio===foil.audio||item.unit!==foil.unit)return [];
   return [{kind:'listen',item,options:this.shuffle([item,foil],random)}];
  });
 },
 tasks(bank,random=Math.random){const listening=this.listeningQuestions(bank,random);if(listening.length!==4)throw new Error('Four verified listening questions required');return [...this.shuffle(bank.items,random).map(item=>({kind:'match',item})),...listening,{kind:'speak'}];},
 accepts(item,verb){return item.verb===verb;}
};
window.DecoderWordBoxLibrarySection=function(lesson){
 const box=window.DECODER_WORD_BOX;if(Number(lesson)!==box.lesson)return null;
 return {
  title:'La boîte à mots',count:box.items.length,detail:'Facultatif · '+box.title+' · '+box.items.length+' expressions',
  html:`<div class="card stack"><div class="h2">La boîte à mots</div><div class="small">Facultatif · ${box.title}</div><p>Associe les mots, écoute des expressions déjà étudiées et parle à ton rythme.</p><div class="grid2">${box.items.map(item=>`<div class="notice"><div class="bigcn" style="font-size:24px">${item.phrase}</div><div class="pinyin-text">${item.phrasePinyin}</div><div class="small">${item.meaning}</div></div>`).join('')}</div><a class="btn primary" href="word-box.html">Jouer avec les mots</a><div class="small">9 petites activités, sans chronomètre. Les quatre écoutes réutilisent des enregistrements de la leçon 6. Les modèles de 坐火车, 坐汽车 et 骑自行车 restent à venir ; ces trois expressions ne sont pas proposées en écoute. Le bilan de ce jeu n’est pas sauvegardé.</div></div>`
 };
};

