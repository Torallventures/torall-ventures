/* Personalized preview: ?name=Your+Business swaps the demo brand for the visitor's own name */
(()=>{
const q=new URLSearchParams(location.search),raw=(q.get('name')||'').replace(/\s+/g,' ').trim().slice(0,40);
if(!raw)return;
const me=document.currentScript,k=me&&me.dataset.k;
const RX={brasa:[/Brasa\s*(&amp;|&)\s*Lime/g,/\bBrasa\b/g],ardent:[/The Ardent Residences/g,/The Ardent/g,/\bArdent\b/g],sundaybean:[/Sunday Bean Coffee Roasters/g,/Sunday Bean/g]}[k]||[];
const fix=s=>{for(const r of RX)s=s.replace(r,raw);return s};
const tn=root=>{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const v=n.nodeValue;if(v&&v.trim()){const f=fix(v);if(f!==v)n.nodeValue=f}}};
const logo=root=>{
if(!root.querySelectorAll)return;
root.querySelectorAll('a.lg').forEach(a=>{if(a.dataset.nm)return;a.dataset.nm=1;const i=a.querySelector('i');a.textContent='';if(i)a.append(i);a.append(raw)});
root.querySelectorAll('.logo').forEach(l=>{if(l.dataset.nm)return;l.dataset.nm=1;const b=l.querySelector('b');if(b)b.textContent=raw;const p=l.querySelector('svg path');if(p){const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x','20');t.setAttribute('y','27');t.setAttribute('text-anchor','middle');t.setAttribute('fill','#fff');t.setAttribute('font-size','19');t.setAttribute('font-weight','800');t.setAttribute('font-family','system-ui,sans-serif');t.textContent=raw.replace(/^the\s+/i,'').charAt(0).toUpperCase();p.replaceWith(t)}})};
const run=root=>{logo(root);tn(root)};
document.title=fix(document.title);
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1)run(n);else if(n.nodeType===3&&n.nodeValue){const f=fix(n.nodeValue);if(f!==n.nodeValue)n.nodeValue=f}}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>run(document.body));
})();
