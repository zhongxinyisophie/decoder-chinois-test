const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const script=name=>fs.readFileSync(path.join(__dirname,'../js',name),'utf8');
function setup({page=false,store=new Map(),blocked=false}={}){
 const ids=['tested','completed','useful','change','friction','device','browser','channelNotice','feedbackForm','report','delivery','email','share','copy','sendStatus','recipientAddress','prepareStatus','deliveryTitle','reportDetails','emptyReport'];
 const els=Object.fromEntries(ids.map(id=>[id,{value:id==='tested'?'5':'test',tagName:['tested','completed','useful','device','browser'].includes(id)?'SELECT':'TEXTAREA',selectedOptions:[{textContent:'Leçon 5'}],labels:[{textContent:id}],hiddenClasses:new Set(['hidden']),classList:{add(){},remove(){},toggle(){}},focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;},select(){this.selected=true;},setCustomValidity(){},reportValidity(){return this.valid!==false;},addEventListener(k,f){this[k]=f;}}]));
 for(const el of Object.values(els)){el.classList={add:c=>el.hiddenClasses.add(c),remove:c=>el.hiddenClasses.delete(c),toggle(c,force){if(force)el.hiddenClasses.add(c);else el.hiddenClasses.delete(c);}};}
 let copyFails=false,shareError=null,navigation=null;
 const c={document:{getElementById:id=>id==='deliveryPage'?(page?{}:null):els[id]},sessionStorage:{getItem:k=>{if(blocked)throw Error('denied');return store.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('quota');store.set(k,v);},removeItem:k=>store.delete(k)},location:{search:'',assign:url=>navigation=url},URLSearchParams,navigator:{clipboard:{writeText:async text=>{if(copyFails)throw Error();}},share:async()=>{if(shareError)throw shareError;}},DECODER_FEEDBACK_CONFIG:{email:'zhongxinyisophie@gmail.com'}};
 c.window=c;vm.createContext(c);vm.runInContext(script('feedback-delivery.js'),c);if(!page)vm.runInContext(script('feedback.js'),c);
 return {els,c,store,get navigation(){return navigation;},copyFail:()=>copyFails=true,shareFail:e=>shareError=e};
}
(async()=>{
 const form=setup();form.els.change.value='Suggestions & caractères 中文';form.els.feedbackForm.onsubmit({preventDefault(){}});assert.equal(form.navigation,'feedback-send.html');assert(!form.navigation.includes('Suggestions'));
 assert(JSON.parse(form.store.get('decoder-feedback-draft-v1')).change.includes('中文'));
 const ready=setup({page:true,store:form.store});assert(ready.els.email.href.startsWith('mailto:zhongxinyisophie@gmail.com?'));assert(decodeURIComponent(ready.els.email.href).includes('Suggestions & caractères 中文'));assert(ready.els.delivery.hiddenClasses.has('hidden')===false);assert(!ready.els.reportDetails.open);
 await ready.els.copy.onclick();assert(ready.els.sendStatus.textContent.includes('pas encore envoyé'));ready.copyFail();await ready.els.copy.onclick();assert(ready.els.reportDetails.open&&ready.els.report.selected);
 ready.shareFail({name:'AbortError'});await ready.els.share.onclick();assert(ready.els.sendStatus.textContent.includes('annulé'));assert(!ready.els.share.disabled);ready.shareFail(Error());await ready.els.share.onclick();assert(ready.els.sendStatus.textContent.includes('Partage indisponible'));
 const edit=setup({store:form.store});assert.equal(edit.els.change.value,'Suggestions & caractères 中文');edit.els.feedbackForm.input();assert(!edit.store.has('decoder-feedback-ready-v1'));
 const denied=setup({blocked:true});denied.els.feedbackForm.onsubmit({preventDefault(){}});assert.equal(denied.navigation,null);assert(denied.els.delivery.scrolled);assert(denied.els.report.value);assert(denied.els.prepareStatus.textContent.includes('sans le retaper'));
 const invalid=setup();invalid.els.feedbackForm.valid=false;invalid.els.feedbackForm.onsubmit({preventDefault(){}});assert.equal(invalid.navigation,null);assert(!invalid.store.has('decoder-feedback-ready-v1'));
 for(const value of [null,'oops',JSON.stringify({report:42}),JSON.stringify({report:'x'.repeat(12001)})]){const store=new Map();if(value!==null)store.set('decoder-feedback-ready-v1',value);const empty=setup({page:true,store});assert(!empty.els.emptyReport.hiddenClasses.has('hidden'));assert(empty.els.delivery.hiddenClasses.has('hidden'));}
 console.log('PASS: separate-page navigation, no report in URL, draft restoration, invalidation on edit, invalid form, blocked storage fallback, missing/corrupt payload, email encoding, copy fallback expands text, share cancel/failure.');
})().catch(e=>{console.error(e);process.exitCode=1;});
