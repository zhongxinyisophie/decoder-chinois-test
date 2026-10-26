// Run with node tests/reliability.test.cjs. No microphone, email or network requests.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const read=name=>fs.readFileSync(path.join(__dirname,'../js',name),'utf8');
function harness(){
 const nodes={},docEvents={},winEvents={},intervals=new Map(),revoked=[];let seq=0,stops=0,request,mode='',active,busy=false;
 class El{
  constructor(){this.disabled=false;this.textContent='';this.classList={add(){},remove(){},toggle(){}};this.style={};}
  set innerHTML(s){this.html=s;for(const m of s.matchAll(/id="([^"]+)"/g))nodes[m[1]]=new El();}
  get innerHTML(){return this.html||'';}querySelector(s){return nodes[s.slice(1)]||null;}pause(){}
 }
 const host=new El(),document={hidden:false,querySelectorAll:()=>[],getElementById:id=>nodes[id]||(nodes[id]=new El()),addEventListener:(k,f)=>docEvents[k]=f,removeEventListener:k=>delete docEvents[k]};
 const stream=()=>({getTracks:()=>[track]});const track={stop(){stops++;},onended:null};
 class MR{
  static isTypeSupported(t){return t==='audio/mp4';}
  constructor(){if(mode==='constructor')throw Error('constructor');this.mimeType='audio/mp4';this.state='inactive';active=this;}
  start(){if(mode==='start')throw Error('start');this.state='recording';}
  stop(){this.state='inactive';queueMicrotask(()=>{if(this.ondataavailable&&mode!=='empty')this.ondataavailable({data:new Blob(['audio'])});if(this.onstop)this.onstop();});}
 }
 const window={MediaRecorder:MR,addEventListener:(k,f)=>winEvents[k]=f,removeEventListener:k=>delete winEvents[k]};
 const c={window,document,navigator:{mediaDevices:{getUserMedia:()=>request()}},MediaRecorder:MR,Blob,File:class{},URL:{createObjectURL:()=> 'blob:audio',revokeObjectURL:u=>revoked.push(u)},Decoder:{stopAudio(){}},setInterval:f=>{intervals.set(++seq,f);return seq;},clearInterval:n=>intervals.delete(n),Date};
 vm.runInNewContext(read('final-recorder.js'),c);window.DecoderFinalRecorder.mount(host,{lesson:5,busy:v=>busy=v});
 request=()=>Promise.resolve(stream());
 return{nodes,host,c,docEvents,winEvents,intervals,revoked,track,stream,api:window.DecoderFinalRecorder,setRequest:f=>request=f,setMode:v=>mode=v,get stops(){return stops;},get active(){return active;},get busy(){return busy;}};
}
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let h=harness();await h.nodes.sr.onclick();assert(h.busy);assert.equal(h.intervals.size,1);h.nodes.stop.onclick();await tick();assert(!h.busy);assert.equal(h.intervals.size,0);assert(h.stops);assert.equal(h.nodes.downloadRec.download.slice(-4),'.m4a');assert(h.nodes.shareRec.hidden);h.nodes.redoRec.onclick();assert(h.revoked.length);h.api.cleanup();assert.equal(Object.keys(h.docEvents).length,0);
 h=harness();h.setRequest(()=>Promise.reject(Object.assign(Error(),{name:'NotAllowedError'})));await h.nodes.sr.onclick();assert(h.nodes.recStatus.textContent.includes('non autorisé'));assert(!h.busy);
 for(const mode of ['constructor','start','empty']){h=harness();h.setMode(mode);await h.nodes.sr.onclick();if(mode==='empty'){h.nodes.stop.onclick();await tick();}assert(h.stops);assert(!h.busy);assert(h.nodes.recStatus.textContent);h.api.cleanup();}
 h=harness();let resolve;h.setRequest(()=>new Promise(r=>resolve=r));let pending=h.nodes.sr.onclick();await h.nodes.sr.onclick();resolve(h.stream());await pending;assert(h.stops);assert(!h.active);
 h=harness();h.setRequest(()=>new Promise(r=>resolve=r));pending=h.nodes.sr.onclick();h.api.cleanup();resolve(h.stream());await pending;assert(h.stops);assert(!h.active);
 h=harness();await h.nodes.sr.onclick();h.active.onerror();assert(h.stops);assert.equal(h.intervals.size,0);assert(!h.busy);
 h=harness();await h.nodes.sr.onclick();h.c.document.hidden=true;h.docEvents.visibilitychange();await tick();assert(h.stops);assert(h.nodes.downloadRec);h.api.cleanup();
 h=harness();await h.nodes.sr.onclick();h.track.onended();await tick();assert(!h.busy);assert(h.nodes.downloadRec);
 h=harness();await h.nodes.sr.onclick();h.winEvents.pagehide();await tick();assert(h.stops);assert.equal(h.intervals.size,0);
 h=harness();await h.nodes.sr.onclick();h.winEvents.pagehide({persisted:true});await tick();assert(!h.busy);await h.nodes.sr.onclick();assert(h.busy);h.api.cleanup();
 // Share cancellation/failure and an asynchronous share returning after teardown.
 for(const error of ['AbortError','Error']){h=harness();h.c.navigator.canShare=()=>true;h.c.navigator.share=async()=>{throw Object.assign(Error(),{name:error});};await h.nodes.sr.onclick();h.nodes.stop.onclick();await tick();await h.nodes.shareRec.onclick();assert(h.nodes.shareNote.textContent.includes(error==='AbortError'?'annulé':'Télécharge'));assert(!h.nodes.shareRec.disabled);h.api.cleanup();}
 h=harness();h.c.navigator.canShare=()=>true;h.c.navigator.share=()=>new Promise(r=>resolve=r);await h.nodes.sr.onclick();h.nodes.stop.onclick();await tick();pending=h.nodes.shareRec.onclick();h.api.cleanup();resolve();await pending;
 // Execute actual lesson initialization and countdown handlers with a minimal DOM.
 h=harness();const D={title:'test',fr:'test',active:[['一','','one'],['二','','two'],['三','','three']],quick:[['q','a'],['q2','a2']],reflex:[['r']],segment:['一二',['一','二']],practiceReady:true};
 h.c.Decoder={$:id=>h.c.document.getElementById(id),getParam:()=> '1',loadLesson:async()=>D,stopAudio(){}};h.c.DecoderFinalRecorder=h.api;h.c.window.DecoderFinalRecorder=h.api;h.c.DecoderReview={};
 await vm.runInNewContext(read('lesson-engine.js'),h.c);h.nodes.start.onclick();for(let n=0;n<5;n++)h.nodes.n.onclick();h.nodes.go.onclick();assert.equal(h.intervals.size,1);h.nodes.n.onclick();assert.equal(h.intervals.size,0);h.nodes.go.onclick();h.nodes.n.onclick();assert.equal(h.intervals.size,0);h.nodes.n.onclick();assert.equal(h.intervals.size,0);
 h=harness();h.c.Decoder={$:id=>h.c.document.getElementById(id),getParam:()=>5,loadLesson:async()=>{throw Error('offline');}};h.c.window.DECODER_CATALOG={5:{}};await vm.runInNewContext(read('lesson-engine.js'),h.c);assert(h.nodes.loadStatus.textContent.includes('connexion'));assert(!h.nodes.retryLesson.hidden);
 const html=fs.readFileSync(path.join(__dirname,'../lesson.html'),'utf8');for(const id of ['start','focusBtn','libraryBtn'])assert(new RegExp('id="'+id+'"[^>]*disabled').test(html));
 // Actual script loading: success, network error and bounded timeout all settle once.
 for(const outcome of ['load','error','timeout']){
  let script,deadline,cleared=false,removed=false;
  const loader={window:{},Decoder:{},document:{createElement:()=>({remove(){removed=true;}}),head:{appendChild:s=>script=s}},setTimeout:f=>{deadline=f;return 1;},clearTimeout:()=>cleared=true,URLSearchParams};
  vm.runInNewContext(read('common.js'),loader);const promise=loader.Decoder.loadScript('lesson.js');
  if(outcome==='load'){script.onload();await promise;assert(!removed);}else{const rejection=assert.rejects(promise);if(outcome==='error')script.onerror();else deadline();await rejection;assert(removed);}
  assert(cleared);assert.equal(script.onload,null);assert.equal(script.onerror,null);
 }
 console.log('PASS: countdown teardown; initial disabled controls; recoverable load failure; recorder start/stop, permission denial/cancel/late resolution, constructor/start/empty/error, hidden/track end/pagehide cleanup, URL revocation, share failure/cancel/late resolution.');
})().catch(e=>{console.error(e);process.exitCode=1});
