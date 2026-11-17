const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
let buttons=[],nodes={},cleanups=0,stops=0,exits=0,entered=[];
const element=()=>({focus(){this.focused=true;},setAttribute(){},scrollIntoView(){}});
const root={
 set innerHTML(html){this.html=html;buttons=[];nodes={};for(const m of html.matchAll(/id="([^"]+)"/g))nodes[m[1]]=element();for(const m of html.matchAll(/data-library-section="(\d+)"/g)){const b=element();b.dataset={librarySection:m[1]};buttons.push(b);}if(nodes.librarySection){const heading=element();nodes.librarySection.querySelector=()=>heading;}},
 querySelector(s){if(s.startsWith('#'))return nodes[s.slice(1)];const m=s.match(/data-library-section="(\d+)"/);return m?buttons.find(b=>b.dataset.librarySection===m[1]):null;},
 querySelectorAll(){return buttons;},scrollIntoView(){this.scrolled=true;}
};
const c={Decoder:{stopAudio:()=>stops++},DecoderWordRecorder:{cleanup:()=>cleanups++}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/library-navigation.js'),'utf8'),c);
c.DecoderLibraryNavigation.mount({root,sections:[{title:'À utiliser',count:2,detail:'2 mots',html:'<div class="h2">UNIQUE_A</div>'},{title:'Empty',count:0,html:'<div>EMPTY</div>'},{title:'Phrases-clés',count:1,detail:'1 phrase',html:'<div class="h2">UNIQUE_B</div>'}],onExit:()=>exits++,onSection:panel=>entered.push(panel)});
assert.equal(buttons.length,2);assert(!root.html.includes('UNIQUE_A'));assert(!root.html.includes('EMPTY'));
buttons[0].onclick();assert(root.html.includes('UNIQUE_A'));assert(!root.html.includes('UNIQUE_B'));assert.equal(entered.length,1);assert(root.scrolled);
nodes.backToLibrary.onclick();assert.equal(buttons.length,2);assert(buttons[0].focused);assert(!root.html.includes('UNIQUE_A'));
buttons[1].onclick();assert(root.html.includes('UNIQUE_B'));assert(!root.html.includes('UNIQUE_A'));assert.equal(entered.length,2);
nodes.backToLibrary.onclick();nodes.closeLib.onclick();assert.equal(exits,1);assert.equal(cleanups,6);assert.equal(stops,6);
console.log('PASS: directory excludes empty sections and body content; one section at a time; section setup; back restores focus; close callback; playback/recorder cleanup on every transition.');
