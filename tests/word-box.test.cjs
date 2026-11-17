const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'..'),c={};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'exercises/word-box-transport.js'),'utf8'),c);
const bank=c.DECODER_WORD_BOX,logic=c.DecoderWordBoxLogic;
assert.equal(bank.items.length,4);
const lessonContext={};lessonContext.window=lessonContext;vm.createContext(lessonContext);vm.runInContext(fs.readFileSync(path.join(root,'lessons/lesson-06.js'),'utf8'),lessonContext);
const source=lessonContext.DECODER_LESSONS[6];
for(const item of bank.listening.items){
 const row=[...source.active,...source.recognition].find(row=>row[0]===item.phrase);
 assert(row&&row[1]===item.phrasePinyin);assert.equal(source.audio[item.phrase],item.audio);assert(fs.existsSync(path.join(root,item.audio)));
}
const positions=new Set();for(let n=0;n<100;n++)for(const question of logic.listeningQuestions(bank)){
 assert.equal(question.options.length,2);assert(question.options.every(option=>option.audio&&option.unit===question.item.unit));
 assert.equal(new Set(question.options.map(option=>option.audio)).size,2);positions.add(question.options.findIndex(option=>option.id===question.item.id));
}
assert.deepEqual([...positions].sort(),[0,1]);
const missing=JSON.parse(JSON.stringify(bank));missing.listening.items[0].audio=null;assert(logic.listeningQuestions(missing).every(q=>q.item.audio&&q.options.every(x=>x.audio)));assert.throws(()=>logic.tasks(missing));

for(let id=1;id<=10;id++){const entry=c.DecoderWordBoxLibrarySection(id);if(id!==6)assert.equal(entry,null);else {assert.equal(entry.count,4);assert(entry.detail.includes('Facultatif'));assert(entry.html.includes('word-box.html'));for(const item of bank.items)assert(entry.html.includes(item.phrase));}}
for(let n=0;n<100;n++){
 const tasks=logic.tasks(bank);assert.equal(tasks.length,9);assert.equal(tasks[8].kind,'speak');
 for(const kind of ['match','listen'])assert.equal(new Set(tasks.filter(t=>t.kind===kind).map(t=>t.item.id)).size,4);
}
assert(logic.accepts(bank.items.find(x=>x.id==='train'),'坐'));
assert(logic.accepts(bank.items.find(x=>x.id==='car'),'坐'));
assert(!logic.accepts(bank.items.find(x=>x.id==='bike'),'坐'));
assert(logic.accepts(bank.items.find(x=>x.id==='bike'),'骑'));
for(const item of bank.items)if(item.audio)assert(fs.existsSync(path.join(root,item.audio)));
// Exercise the real UI handlers, including no selection, wrong attempts and duplicate clicks.
let verbs=[],audioButtons=[],audioInstances=[];const nodes={},played=[];
class AudioStub{
 constructor(src){this.src=src;this.paused=false;audioInstances.push(this);}
 play(){return Promise.resolve();}pause(){this.paused=true;}
 end(){if(this.onended)this.onended();}
}

class El{
 constructor(id){this.id=id;this.disabled=false;this.dataset={};this.style={};this.classList={add(){},remove(){}};}
 setAttribute(k,v){this[k]=v;}
 scrollIntoView(){}
 set innerHTML(html){this.html=html;if(this.id==='wbHost'){verbs=[];audioButtons=[];}
  for(const match of html.matchAll(/id="([^"]+)"/g))nodes[match[1]]=new El(match[1]);
  for(const match of html.matchAll(/<button[^>]*id="([^"]+)"[^>]*disabled[^>]*>/g))nodes[match[1]].disabled=true;
  for(const match of html.matchAll(/<button class="[^"]*wb-verb" data-verb="([^"]+)"/g)){const el=new El();el.dataset.verb=match[1];verbs.push(el);}
  for(const match of html.matchAll(/class="[^"]*wb-audio" data-item="([^"]+)"/g)){const el=new El();el.dataset.item=match[1];audioButtons.push(el);}
 }
 get innerHTML(){return this.html||'';}
}
for(const id of ['wbHost','progress','wbCount','wbBar'])nodes[id]=new El(id);
c.document={getElementById:id=>nodes[id],querySelectorAll:s=>s==='.wb-verb'?verbs:s==='.wb-audio'?audioButtons:[]};c.addEventListener=()=>{};c.Audio=AudioStub;c.Decoder={stopAudio(){},say:t=>played.push(t)};
vm.runInContext(fs.readFileSync(path.join(root,'js/word-box.js'),'utf8'),c);
assert.equal(audioButtons.length,1);audioButtons[0].onclick();assert.equal(played[0],'坐地铁');nodes.wbStart.onclick();
for(let i=0;i<4;i++){
 const noun=nodes.wbNoun.html||nodes.wbHost.html.match(/id="wbNoun"[^>]*>([^<]+)/)[1];
 const item=bank.items.find(x=>x.noun===noun);assert(item);
 nodes.wbNoun.onclick();assert(nodes.wbFeedback.textContent.includes('d’abord'));assert(nodes.wbNext.disabled);
 const wrong=verbs.find(v=>v.dataset.verb!==item.verb);wrong.onclick();nodes.wbNoun.onclick();assert(nodes.wbNext.disabled);
 verbs.find(v=>v.dataset.verb===item.verb).onclick();nodes.wbNoun.onclick();assert(!nodes.wbNext.disabled);nodes.wbNoun.onclick();nodes.wbNext.onclick();
}
for(let i=0;i<4;i++){
 const html=nodes.wbHost.html;assert(html.includes('Écoute et choisis'));
 const target=bank.listening.items.find(x=>html.includes('aria-label="'+x.fr+'"'));assert(target);assert(!html.includes(target.phrase));assert(!html.includes(target.phrasePinyin));
 assert(nodes.wbChoose0.disabled&&nodes.wbChoose1.disabled&&nodes.wbNext.disabled);
 nodes.wbChoose0.onclick();assert(nodes.wbNext.disabled);
 nodes.wbPlay0.onclick();const interrupted=audioInstances.at(-1),lateEnd=interrupted.onended;
 nodes.wbPlay1.onclick();const bPlayer=audioInstances.at(-1);assert(interrupted.paused);lateEnd();bPlayer.end();assert(nodes.wbChoose0.disabled);
 nodes.wbPlay0.onclick();let aPlayer=audioInstances.at(-1);aPlayer.end();assert(!nodes.wbChoose0.disabled);
 if(i===0){nodes.wbPlay0.onclick();audioInstances.at(-1).onerror();assert(nodes.wbChoose0.disabled);assert(nodes.wbAudioStatus.textContent.includes('Impossible'));nodes.wbPlay0.onclick();aPlayer=audioInstances.at(-1);aPlayer.end();}
 const correct=aPlayer.src===target.audio?0:1;nodes['wbChoose'+(i===0?1-correct:correct)].onclick();assert(!nodes.wbNext.disabled);assert(nodes.wbChoose0.disabled&&nodes.wbChoose1.disabled);assert(nodes.wbListenAnswer.html.includes(target.phrase));
 nodes['wbChoose'+correct].onclick();nodes.wbReplayRight.onclick();const replay=audioInstances.at(-1);assert.equal(replay.src,target.audio);const stale=replay.onended;nodes.wbNext.onclick();assert(replay.paused);stale();
}
assert(nodes.wbHost.html.includes('怎么去？'));nodes.wbFinish.onclick();assert(nodes.wbHost.html.includes('0 / 4'));assert(nodes.wbHost.html.includes('3 / 4'));assert(nodes.wbHost.html.includes('pas une mesure de maîtrise'));nodes.wbRestart.onclick();assert(nodes.wbStart);
console.log('PASS: 100 nine-activity sessions; exact lesson-6 audio mappings; randomized A/B; missing audio excluded; matching flow; full-play gating; interruption/error/retry; stale events; correct/wrong/duplicate answers; correct replay and accurate separate scores.');

