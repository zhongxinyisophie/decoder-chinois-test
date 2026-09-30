window.Decoder = window.Decoder || {};
Decoder.$ = id => document.getElementById(id);
Decoder.currentLesson = null;
Decoder._mandarinVoice = null;
Decoder._activeAudio = null;

Decoder.refreshMandarinVoice = function(){
  if(!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices() || [];
  const cn = voices.filter(v => (v.lang || '').toLowerCase().replace('_','-').startsWith('zh-cn'));
  const preferred = [
    /xiaoxiao/i,/xiaoyi/i,/yunxi/i,/yunyang/i,/tingting/i,
    /putonghua/i,/mandarin/i,/普通话/i,/google.*中文/i,/microsoft.*chinese/i
  ];
  let voice = null;
  for(const re of preferred){
    voice = cn.find(v => re.test(v.name || ''));
    if(voice) break;
  }
  Decoder._mandarinVoice = voice || cn[0] || null;
  return Decoder._mandarinVoice;
};

if('speechSynthesis' in window){
  Decoder.refreshMandarinVoice();
  if(typeof speechSynthesis.addEventListener === 'function'){
    speechSynthesis.addEventListener('voiceschanged', Decoder.refreshMandarinVoice);
  }
}

Decoder.stopAudio = function(){
  if(Decoder._activeAudio){
    try{ Decoder._activeAudio.pause(); Decoder._activeAudio.currentTime = 0; }catch(e){}
    Decoder._activeAudio = null;
  }
  Decoder._utterance=null;
  if('speechSynthesis' in window) speechSynthesis.cancel();
};

Decoder.audioNotice = function(message){
 let el=document.getElementById('audioStatus');
 if(!el){el=document.createElement('div');el.id='audioStatus';el.className='notice small';el.setAttribute('role','status');const host=document.getElementById('host')||document.querySelector('.wrap')||document.body;host.prepend(el);}
 el.textContent=message;el.hidden=!message;
};
Decoder.sayTTS = function(text, rate=.9){
  if(!('speechSynthesis' in window)){Decoder.audioNotice('Lecture vocale indisponible. Ouvre cette page directement dans Safari ou Chrome.');return;}
  Decoder.stopAudio();
  Decoder.audioNotice('Préparation de la voix…');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = rate;
  u.pitch = 1;
  u.volume = 1;
  const voice = Decoder._mandarinVoice || Decoder.refreshMandarinVoice();
  if(voice) u.voice = voice;
  Decoder._utterance=u;
  const timer=setTimeout(()=>{if(Decoder._utterance===u)Decoder.audioNotice('La voix ne démarre pas. Réessaie ; si nécessaire, ouvre la page dans Safari ou Chrome et vérifie que la voix Mandarin est disponible sur ton téléphone.');},6000);
  u.onstart=()=>{clearTimeout(timer);Decoder.audioNotice('Lecture en cours… Si tu n’entends rien, vérifie le volume et la sortie audio (Bluetooth).');};
  u.onend=()=>{clearTimeout(timer);if(Decoder._utterance===u){Decoder._utterance=null;Decoder.audioNotice('');}};
  u.onerror=e=>{clearTimeout(timer);if(Decoder._utterance!==u)return;Decoder._utterance=null;if(e.error!=='canceled'&&e.error!=='interrupted')Decoder.audioNotice('Lecture vocale indisponible ('+(e.error||'erreur')+'). Ouvre la page dans Safari ou Chrome et vérifie que la voix Mandarin est disponible.');};
  try{speechSynthesis.resume();speechSynthesis.speak(u);}catch(e){clearTimeout(timer);Decoder.audioNotice('Impossible de lancer la voix. Ouvre la page directement dans Safari ou Chrome.');}
};

/*
  A lesson may optionally define:
  audio: {
    "起床": "audio/lesson-01/qichuang.m4a",
    "我七点左右起床。": "audio/lesson-01/wo-qi-dian-zuoyou-qichuang.m4a"
  }
  When present, the real recording is played first; TTS is only a fallback.
*/
Decoder.say = function(text, rate=.9){
  const map = Decoder.currentLesson && Decoder.currentLesson.audio;
  const src = map && map[text];
  if(src){
    Decoder.stopAudio();
    const a = new Audio(src);
    Decoder._activeAudio = a;
    a.onended = () => { Decoder._activeAudio = null; };
    a.onerror = () => Decoder.sayTTS(text, rate);
    const p = a.play();
    if(p && typeof p.catch === 'function') p.catch(() => Decoder.sayTTS(text, rate));
    return;
  }
  Decoder.sayTTS(text, rate);
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
