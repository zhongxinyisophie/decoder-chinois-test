/* Shared local history; never stores student audio or sends data. */
window.DecoderReview=(()=>{
 const key='decoder-mixed-review-v1';
 function read(){try{const h=JSON.parse(localStorage.getItem(key)||'{}');return h&&typeof h==='object'&&!Array.isArray(h)?h:{};}catch(e){return {};}}
 function write(history){try{localStorage.setItem(key,JSON.stringify(history));return true;}catch(e){return false;}}
 function update(id,patch){const h=read(),old=h[id]&&typeof h[id]==='object'?h[id]:{};h[id]=patch(old);return write(h);}
 function mistake(id){return update(id,h=>({...h,last:Date.now(),again:true,streak:0,source:'objective',origin:'lesson',assisted:false,lastErrors:(Number(h.lastErrors)||0)+1,objectiveErrors:(Number(h.objectiveErrors)||0)+1}));}
 function finish(id,errors){return update(id,h=>({...h,last:Date.now(),again:errors>0,streak:errors?0:(Number(h.streak)||0)+1,source:'objective',origin:'lesson',lastErrors:errors,assisted:false}));}
 function available(){try{localStorage.getItem(key);return true;}catch(e){return false;}}
 return {read,write,mistake,finish,available};
})();
