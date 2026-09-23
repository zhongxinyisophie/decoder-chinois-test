window.Decoder = window.Decoder || {};
Decoder.$ = id => document.getElementById(id);
Decoder.say = function(text, rate=.82){
  if(!('speechSynthesis' in window)) return;
  const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=rate;
  speechSynthesis.cancel();speechSynthesis.speak(u);
};
Decoder.getParam = function(name){ return new URLSearchParams(location.search).get(name); };
Decoder.loadScript = function(src){
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
};
Decoder.loadLesson = async function(id){
  const meta=window.DECODER_CATALOG && window.DECODER_CATALOG[id];
  if(!meta) throw new Error('Leçon inconnue');
  window.DECODER_LESSONS=window.DECODER_LESSONS||{};
  if(!window.DECODER_LESSONS[id]) await Decoder.loadScript(meta.file);
  return window.DECODER_LESSONS[id];
};
