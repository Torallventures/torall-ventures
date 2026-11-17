/* Fritanga La Chontaleña — site script (demo by Torall) */
(function(){
"use strict";
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const sess={get(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};

/* ---------------- Illustrations ---------------- */
const INK="#2A1A12";
const steam=`<g class="steam" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".5"><path d="M80 18 q-8 -10 0 -20 q8 -10 0 -20"/><path d="M100 14 q-8 -10 0 -20 q8 -10 0 -20"/><path d="M120 18 q-8 -10 0 -20 q8 -10 0 -20"/></g>`;
const ART={
plate:`<svg viewBox="-10 -40 220 250" aria-hidden="true">${steam}
<ellipse cx="100" cy="196" rx="80" ry="10" fill="${INK}" opacity=".12"/>
<circle cx="100" cy="100" r="92" fill="#FBF5EA" stroke="${INK}" stroke-width="3"/>
<circle cx="100" cy="100" r="78" fill="none" stroke="#2A63AE" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>
<circle cx="100" cy="100" r="70" fill="#F4E9D6"/>
<!-- gallo pinto -->
<path d="M40 82c-4-22 18-38 40-34 16 3 26 14 24 30-2 18-20 28-38 26-15-2-24-10-26-22z" fill="#7A4630" stroke="${INK}" stroke-width="2"/>
<g fill="#F7EEDC">${[[52,66],[60,74],[70,62],[80,70],[66,84],[54,86],[86,82],[76,90],[92,66],[62,58]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="3.2" ry="1.8" transform="rotate(30 ${p[0]} ${p[1]})"/>`).join("")}</g>
<g fill="#3A1C12">${[[58,70],[74,66],[68,78],[84,76],[60,80],[80,86],[88,72]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="3" ry="2.2"/>`).join("")}</g>
<!-- carne asada -->
<path d="M96 52c18-10 44-6 56 8 10 12 8 26-2 30-12 5-20-6-34-2-12 3-24 0-26-12-1-10 0-18 6-24z" fill="#8A3520" stroke="${INK}" stroke-width="2"/>
<g stroke="#4A160B" stroke-width="3" stroke-linecap="round"><path d="M106 62l30 18"/><path d="M104 72l30 18"/><path d="M116 56l26 16"/></g>
<!-- tajadas -->
<g stroke="${INK}" stroke-width="2"><path d="M50 112c10-4 34 2 46 14 4 4-2 8-8 6-14-4-30-8-40-12-4-2-4-6 2-8z" fill="#E8B04A"/>
<path d="M46 128c10-2 32 6 42 18 3 4-3 7-8 5-13-6-28-11-36-16-4-3-3-6 2-7z" fill="#E0A73F"/>
<path d="M56 146c9 0 26 8 32 18 2 4-4 6-8 4-10-6-20-10-26-16-3-3-2-6 2-6z" fill="#D49530"/></g>
<!-- queso frito -->
<g transform="rotate(-14 136 128)"><rect x="110" y="104" width="54" height="40" rx="8" fill="#F2D597" stroke="${INK}" stroke-width="2"/>
<g stroke="#B5803C" stroke-width="3" stroke-linecap="round"><path d="M118 112l12 24"/><path d="M132 112l12 24"/><path d="M146 112l12 24"/></g></g>
<!-- ensalada -->
<g stroke-linecap="round" stroke-width="3" fill="none"><path d="M104 160q10-8 22-4" stroke="#5E7F4A"/><path d="M110 168q12-6 24 0" stroke="#7FA05C"/><path d="M100 152q8-4 16 0" stroke="#C9577A"/><path d="M120 162q8-6 18-2" stroke="#C9577A"/><path d="M128 150q10-4 18 2" stroke="#5E7F4A"/></g>
</svg>`,
cajita:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="186" rx="70" ry="9" fill="${INK}" opacity=".15"/>
<path d="M36 70h128l-12 110H48z" fill="#D7A86B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M30 60c20-14 30 6 44-6s26 8 40-4 28 6 40-4 18 4 16 14l-4 14H34z" fill="#4E7A3A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M50 52l6 26M78 48l4 30M108 46l2 32M136 48l-2 30" stroke="#2E4A2C" stroke-width="2"/>
<rect x="62" y="108" width="76" height="40" rx="20" fill="#F5EBDA" stroke="${INK}" stroke-width="2.5"/>
<text x="100" y="125" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="12" fill="#B4472B">La</text>
<text x="100" y="140" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="13" font-weight="700" fill="${INK}">Chontaleña</text>
</svg>`,
drink:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="188" rx="46" ry="7" fill="${INK}" opacity=".15"/>
<path d="M124 20l-14 50" stroke="#B4472B" stroke-width="8" stroke-linecap="round"/>
<path d="M124 20l-14 50" stroke="#F5EBDA" stroke-width="8" stroke-dasharray="6 6" stroke-linecap="round"/>
<path d="M56 50h88l-10 134H66z" fill="#FBF5EA" fill-opacity=".6" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M62 78h76l-8 104H70z" fill="#8A5634"/>
<path d="M62 78h76l-1 10H63z" fill="#E7C9A0"/>
<rect x="72" y="96" width="22" height="20" rx="4" fill="#fff" fill-opacity=".55" transform="rotate(-12 83 106)"/>
<rect x="102" y="110" width="20" height="18" rx="4" fill="#fff" fill-opacity=".45" transform="rotate(10 112 119)"/>
</svg>`,
tortilla:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="176" rx="80" ry="12" fill="${INK}" opacity=".14"/>
${[150,136,122,108].map((y,i)=>`<ellipse cx="100" cy="${y}" rx="78" ry="22" fill="${["#E6C07E","#EBCB8B","#E3BB76","#EFD39A"][i]}" stroke="${INK}" stroke-width="2.5"/>`).join("")}
<ellipse cx="100" cy="100" rx="78" ry="22" fill="#F1D9A6" stroke="${INK}" stroke-width="2.5"/>
<g fill="#A0682E" opacity=".7"><circle cx="70" cy="96" r="3"/><circle cx="118" cy="102" r="4"/><circle cx="96" cy="92" r="2.5"/><circle cx="140" cy="96" r="2.5"/><circle cx="84" cy="106" r="2"/></g>
${steam.replace('class="steam"','class="steam" transform="translate(0,70)"')}
</svg>`,
bunuelo:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="176" rx="76" ry="12" fill="${INK}" opacity=".14"/>
<ellipse cx="100" cy="160" rx="86" ry="20" fill="#FBF5EA" stroke="${INK}" stroke-width="3"/>
<circle cx="70" cy="128" r="30" fill="#C97E2E" stroke="${INK}" stroke-width="2.5"/>
<circle cx="128" cy="130" r="28" fill="#BF7428" stroke="${INK}" stroke-width="2.5"/>
<circle cx="100" cy="96" r="30" fill="#D08A36" stroke="${INK}" stroke-width="2.5"/>
<path d="M76 84c10-10 34-12 46 0 6 6 2 14-4 20-2 4 2 14-2 16s-4-10-8-12c-8-2-22 0-30-6-6-6-6-12-2-18zM48 118c6-6 18-6 24 0-2 6-4 14-8 18-2-6-8-6-12-10-4-2-6-6-4-8z" fill="#8A3F12" opacity=".85"/>
</svg>`,
soup:`<svg viewBox="-10 -40 220 240" aria-hidden="true">${steam}
<ellipse cx="100" cy="182" rx="70" ry="9" fill="${INK}" opacity=".15"/>
<ellipse cx="100" cy="80" rx="88" ry="26" fill="#C9A061" stroke="${INK}" stroke-width="3"/>
<path d="M14 82c0 56 40 94 86 94s86-38 86-94" fill="#B4472B" stroke="${INK}" stroke-width="3"/>
<path d="M22 104c40 10 116 10 156 0" stroke="#F5EBDA" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" fill="none"/>
<rect x="44" y="66" width="34" height="18" rx="6" fill="#F3E7C9" stroke="${INK}" stroke-width="2"/>
<path d="M96 60h42a8 8 0 010 16H96a8 8 0 010-16z" fill="#8A3520" stroke="${INK}" stroke-width="2"/>
<circle cx="152" cy="80" r="8" fill="#E0A73F" stroke="${INK}" stroke-width="2"/>
<path d="M60 88q8-4 14 0M120 86q6-4 12 0" stroke="#5E7F4A" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`,
steak:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="182" rx="70" ry="9" fill="${INK}" opacity=".15"/>
<rect x="128" y="14" width="18" height="96" rx="9" fill="#F3E7C9" stroke="${INK}" stroke-width="3" transform="rotate(28 137 62)"/>
<path d="M50 92c10-30 60-40 92-20 28 18 30 60 4 84-26 22-76 20-96-6-12-16-6-40 0-58z" fill="#8A3520" stroke="${INK}" stroke-width="3"/>
<path d="M70 104c10-14 40-18 58-6 14 10 14 30 0 42-16 12-44 10-56-2-8-10-8-24-2-34z" fill="#A9452A"/>
<g stroke="#4A160B" stroke-width="4" stroke-linecap="round"><path d="M66 100l50 40"/><path d="M80 90l50 40"/><path d="M60 118l40 32"/></g>
<path d="M58 96c-4 10-4 22 0 30" stroke="#F3E7C9" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`,
nacatamal:`<svg viewBox="0 0 200 200" aria-hidden="true">
<ellipse cx="100" cy="182" rx="70" ry="9" fill="${INK}" opacity=".15"/>
<path d="M24 120L100 40l76 80-76 54z" fill="#4E7A3A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M46 116L100 62l54 54-54 38z" fill="#E7B65B" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M100 40v134M24 120h152" stroke="#C9A061" stroke-width="4"/>
<circle cx="100" cy="112" r="6" fill="#C9A061" stroke="${INK}" stroke-width="2"/>
<g stroke="#2E4A2C" stroke-width="1.5"><path d="M40 112l20-20M150 108l-18-18"/></g>
</svg>`,
hat:`<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="132" rx="90" ry="26" fill="#C9A061" stroke="${INK}" stroke-width="3"/><path d="M58 128c0-40 14-74 42-74s42 34 42 74c-20 8-64 8-84 0z" fill="#D9B377" stroke="${INK}" stroke-width="3"/><path d="M60 112c22 8 58 8 80 0" stroke="#B4472B" stroke-width="10"/></svg>`,
leaf:`<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M40 160C40 80 100 30 170 30c0 70-50 130-130 130z" fill="#5E7F4A" stroke="${INK}" stroke-width="3"/><path d="M40 160C80 120 120 80 160 40" stroke="${INK}" stroke-width="3" fill="none"/><path d="M70 130l-6-30M96 104l-4-32M122 80l-2-28M80 122l30 4M106 96l30 4" stroke="${INK}" stroke-width="2"/></svg>`,
heart:`<svg viewBox="0 0 200 200" aria-hidden="true"><path d="M100 170C40 128 20 98 24 68c4-26 28-40 50-34 12 3 20 12 26 22 6-10 14-19 26-22 22-6 46 8 50 34 4 30-16 60-76 102z" fill="#B4472B" stroke="${INK}" stroke-width="3"/><path d="M50 72c2-12 12-18 22-16" stroke="#F5EBDA" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
star:`<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z"/></svg>`
};
const logoSVG=`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#B4472B"/><circle cx="31" cy="17" r="6" fill="#E0A73F"/><path d="M1 30c8-6 14-8 22-4s14 2 24-4v4a23 23 0 01-46 4z" fill="#2E4A2C"/><path d="M4 36c10-4 18-4 26 0s12 2 16-2a23 23 0 01-42 2z" fill="#5E7F4A"/></svg>`;
const badgeSVG=(txt,fill="#2E4A2C",col="#F5EBDA")=>`<svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="bc${txt.length}" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs><circle cx="100" cy="100" r="98" fill="${fill}"/><text font-family="Work Sans,sans-serif" font-weight="700" font-size="${Math.min(16,560/txt.length).toFixed(1)}" fill="${col}"><textPath href="#bc${txt.length}" textLength="462" lengthAdjust="spacing">${txt}</textPath></text><g transform="translate(76 76) scale(1)">${logoSVG.replace('viewBox="0 0 48 48"','viewBox="0 0 48 48" width="48" height="48"')}</g></svg>`;

$$("[data-art]").forEach(el=>{el.innerHTML=ART[el.dataset.art]||""});
$$("[data-logo]").forEach(el=>{el.innerHTML=logoSVG});
$$("[data-badge]").forEach(el=>{el.innerHTML=badgeSVG(el.dataset.badge,el.dataset.fill,el.dataset.col)});
$$(".stars").forEach(el=>{el.innerHTML=ART.star.repeat(5)});

/* ---------------- Language toggle ---------------- */
let lang=store.get("lc-lang")||"es";
function applyLang(l){
  lang=l;document.documentElement.lang=l;
  $$("[data-en]").forEach(el=>{
    if(!el.dataset.es) el.dataset.es=el.innerHTML;
    el.innerHTML = l==="en"?el.dataset.en:el.dataset.es;
  });
  $$("[data-en-ph]").forEach(el=>{
    if(!el.dataset.esPh) el.dataset.esPh=el.getAttribute("aria-label")||"";
  });
  $$(".lang button").forEach(b=>b.classList.toggle("on",b.dataset.l===l));
  store.set("lc-lang",l);
  updateOpen(); markToday(); positionPill && positionPill();
  splitAll(true);
}
$$(".lang button").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.l)));

/* ---------------- Split headings into words ---------------- */
function splitAll(force){
  $$(".split").forEach(el=>{
    if(el.dataset.done && !force) return;
    const wasIn=el.classList.contains("in");
    const walk=(node)=>{
      [...node.childNodes].forEach(n=>{
        if(n.nodeType===3){
          const frag=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t=>{
            if(!t) return;
            if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(" "));return}
            const w=document.createElement("span");w.className="w";
            const s=document.createElement("span");s.textContent=t;w.appendChild(s);frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if(n.nodeType===1 && !n.classList.contains("w")) walk(n);
      });
    };
    walk(el);
    $$(".w>span",el).forEach((s,i)=>s.style.transitionDelay=(i*0.06)+"s");
    el.dataset.done=1;
    if(wasIn) requestAnimationFrame(()=>el.classList.add("in"));
  });
}

/* ---------------- Page load / transitions ---------------- */
const first=!sess.get("lc-seen"); sess.set("lc-seen","1");
function ready(){document.body.classList.remove("is-loading");document.body.classList.add("is-ready")}
setTimeout(ready, first?1300:420);
window.addEventListener("pageshow",e=>{if(e.persisted){document.body.classList.remove("is-leaving","menu-open");ready()}});
document.addEventListener("click",e=>{
  const a=e.target.closest("a[href]"); if(!a) return;
  const href=a.getAttribute("href");
  if(!/\.html(#.*)?$/.test(href) || a.target==="_blank" || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  document.body.classList.remove("menu-open");
  document.body.classList.add("is-leaving");
  setTimeout(()=>{location.href=href},720);
});

/* ---------------- Nav ---------------- */
const nav=$(".nav");
const onScroll=()=>{nav&&nav.classList.toggle("scrolled",scrollY>40)};
addEventListener("scroll",onScroll,{passive:true});onScroll();
const burger=$(".burger"); burger&&burger.addEventListener("click",()=>document.body.classList.toggle("menu-open"));
const page=document.body.dataset.page;
$$(".nav ul a").forEach(a=>{if(a.dataset.page===page)a.classList.add("active")});

/* ---------------- Reveal on scroll ---------------- */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}}),{threshold:.15,rootMargin:"0px 0px -6% 0px"});
function observe(){ $$(".reveal,.split,.mask-img,.reviews,[data-count]").forEach(el=>io.observe(el)) }

/* ---------------- Counters ---------------- */
const cio=new IntersectionObserver(es=>es.forEach(en=>{
  if(!en.isIntersecting) return; cio.unobserve(en.target);
  const el=en.target,end=parseFloat(el.dataset.count),dec=(el.dataset.count.split(".")[1]||"").length,suf=el.dataset.suffix||"";
  const t0=performance.now(),dur=1800;
  const tick=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=(end*e).toFixed(dec)+suf;if(p<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}),{threshold:.6});
$$("[data-count]").forEach(el=>cio.observe(el));

/* ---------------- Parallax ---------------- */
const px=$$("[data-speed]");
let ticking=false;
function parallax(){
  const y=scrollY;
  px.forEach(el=>{el.style.transform=`translate3d(0,${y*parseFloat(el.dataset.speed)}px,0)`});
  ticking=false;
}
addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true}},{passive:true});

/* ---------------- Marquee duplication ---------------- */
$$(".marquee .track").forEach(t=>{t.innerHTML+=t.innerHTML});

/* ---------------- Tilt cards ---------------- */
if(matchMedia("(hover:hover)").matches){
  $$("[data-tilt]").forEach(c=>{
    c.addEventListener("mousemove",e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`});
    c.addEventListener("mouseleave",()=>{c.style.transform=""});
  });
  /* custom cursor */
  const cur=document.createElement("div");cur.className="cursor";document.body.appendChild(cur);
  let cx=0,cy=0,tx=0,ty=0;
  addEventListener("mousemove",e=>{tx=e.clientX;ty=e.clientY});
  (function loop(){cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.left=cx+"px";cur.style.top=cy+"px";requestAnimationFrame(loop)})();
  document.addEventListener("mouseover",e=>{cur.classList.toggle("big",!!e.target.closest("a,button,[data-tilt],.chip"))});
  /* hero plate follows mouse a little */
  const hp=$(".hero-plate .plate-art");
  if(hp) addEventListener("mousemove",e=>{const x=(e.clientX/innerWidth-.5)*18,y=(e.clientY/innerHeight-.5)*18;hp.parentElement.style.transform=`translate(${x}px,${y}px)`});
}

/* ---------------- Hours / open now ---------------- */
// 0=Sun..6=Sat  [open, close] in hours (24h), America/New_York
const HOURS={0:[8,21],1:[8,21],2:[8,21],3:[8,21],4:[8,21],5:[8,22],6:[8,23]};
function nowMiami(){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",weekday:"short",hour:"numeric",minute:"numeric",hour12:false}).formatToParts(new Date());
  const g=t=>f.find(p=>p.type===t).value;
  const d=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"));
  return {d,h:(parseInt(g("hour"))%24)+parseInt(g("minute"))/60};
}
const fmt=h=>{const ap=h>=12?"PM":"AM";const hh=((h+11)%12)+1;return hh+" "+ap};
function updateOpen(){
  const {d,h}=nowMiami(),[o,c]=HOURS[d],open=h>=o&&h<c;
  $$(".open-pill").forEach(p=>{
    p.classList.toggle("closed",!open);
    const s=$("span",p);
    s.textContent = open
      ? (lang==="en"?`Open now · until ${fmt(c)}`:`Abierto ahora · hasta las ${fmt(c)}`)
      : (lang==="en"?`Closed · opens ${fmt(HOURS[(h>=c?(d+1)%7:d)][0])}`:`Cerrado · abre a las ${fmt(HOURS[(h>=c?(d+1)%7:d)][0])}`);
  });
}
function markToday(){const {d}=nowMiami();$$(".hours li").forEach(li=>li.classList.toggle("today",+li.dataset.d===d))}
updateOpen();markToday();setInterval(updateOpen,60000);

/* ---------------- Menu tabs ---------------- */
const tabs=$(".tabs");let positionPill=null;
if(tabs){
  const pill=document.createElement("span");pill.className="pill";tabs.prepend(pill);
  const btns=$$("button",tabs);
  positionPill=()=>{const on=$("button.on",tabs)||btns[0];pill.style.left=on.offsetLeft+"px";pill.style.width=on.offsetWidth+"px"};
  btns.forEach(b=>b.addEventListener("click",()=>{
    const t=document.getElementById(b.dataset.target);
    if(t) scrollTo({top:t.getBoundingClientRect().top+scrollY-150,behavior:"smooth"});
  }));
  const cats=$$(".cat");
  const spy=()=>{
    let cur=cats[0];cats.forEach(c=>{if(c.getBoundingClientRect().top<220)cur=c});
    btns.forEach(b=>b.classList.toggle("on",b.dataset.target===cur.id));
    const on=$("button.on",tabs); if(on){positionPill(); const l=on.offsetLeft-tabs.clientWidth/2+on.offsetWidth/2; tabs.scrollTo({left:l,behavior:"smooth"})}
  };
  addEventListener("scroll",()=>requestAnimationFrame(spy),{passive:true});
  addEventListener("resize",positionPill);
  setTimeout(()=>{spy();positionPill()},50);
}

/* ---------------- Timeline progress ---------------- */
const tl=$(".tl");
if(tl){const bar=$(".progress",tl);
  addEventListener("scroll",()=>{const r=tl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));bar.style.height=(p*100)+"%"},{passive:true});
}

/* ---------------- Form ---------------- */
$$("form").forEach(f=>f.addEventListener("submit",e=>{
  e.preventDefault();
  const done=$(".form-done",f);done&&done.classList.add("show");
  f.querySelectorAll("input,textarea").forEach(i=>i.value="");
}));


/* ---------------- Hero video + floating ingredients ---------------- */
const hv=$(".hero-video");
if(hv){
  const on=()=>{document.body.classList.add("has-video")};
  if(hv.readyState>=2) on(); else hv.addEventListener("loadeddata",on,{once:true});
  const src=$("source",hv); src&&src.addEventListener("error",()=>hv.remove());
}
const fl=$(".floaters");
if(fl){
  const P={
    bean:'<svg viewBox="0 0 20 14"><ellipse cx="10" cy="7" rx="9" ry="6" fill="#3A1C12"/><path d="M5 6q5-3 10 0" stroke="#6B3B2A" stroke-width="1.4" fill="none"/></svg>',
    rice:'<svg viewBox="0 0 20 8"><ellipse cx="10" cy="4" rx="9" ry="3.2" fill="#FBF5EA" stroke="#2A1A12" stroke-width="1"/></svg>',
    plantain:'<svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="#E0A73F" stroke="#2A1A12" stroke-width="1.6"/><circle cx="15" cy="15" r="7" fill="#EFC56A"/><g fill="#B5803C"><circle cx="15" cy="12" r="1"/><circle cx="12.5" cy="16.5" r="1"/><circle cx="17.5" cy="16.5" r="1"/></g></svg>',
    leaf:'<svg viewBox="0 0 30 30"><path d="M4 26C4 12 14 4 27 4c0 13-9 22-23 22z" fill="#5E7F4A" stroke="#2A1A12" stroke-width="1.4"/><path d="M4 26L24 7" stroke="#2A1A12" stroke-width="1.2"/></svg>',
    chili:'<svg viewBox="0 0 30 30"><path d="M8 6c-2 10 4 18 18 20-8-6-10-12-10-20z" fill="#B4472B" stroke="#2A1A12" stroke-width="1.4"/><path d="M8 6c0-2 2-4 4-3" stroke="#2E4A2C" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
    cheese:'<svg viewBox="0 0 30 24"><rect x="2" y="3" width="26" height="18" rx="4" fill="#F2D597" stroke="#2A1A12" stroke-width="1.4"/><path d="M8 7l5 10M15 7l5 10" stroke="#B5803C" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  const kinds=["bean","rice","plantain","leaf","bean","rice","chili","cheese","plantain","leaf","bean","rice","plantain","rice"];
  const mobile=innerWidth<700;
  const pieces=kinds.slice(0,mobile?8:14).map((k,i)=>{
    const d=document.createElement("div");d.className="f";
    const size=({bean:18,rice:16,plantain:34,leaf:34,chili:30,cheese:32})[k]*(mobile?.8:1)*(0.8+Math.random()*.6);
    d.style.width=size+"px";
    d.style.left=(4+Math.random()*92)+"%";d.style.top=(8+Math.random()*70)+"%";
    d.style.setProperty("--dur",(7+Math.random()*7)+"s");d.style.setProperty("--del",(-Math.random()*8)+"s");d.style.setProperty("--rot",(Math.random()*120-60)+"deg");
    d.innerHTML=P[k];d.dataset.depth=(0.3+Math.random()*1.2).toFixed(2);
    d.style.opacity=0;d.style.transition="opacity 1.2s ease "+(1.2+i*.08)+"s";
    fl.appendChild(d);requestAnimationFrame(()=>requestAnimationFrame(()=>d.style.opacity=1));
    return d;
  });
  let mx=0,my=0;
  addEventListener("mousemove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
  (function loop(){const sy=scrollY;pieces.forEach(p=>{const z=+p.dataset.depth;p.style.transform=`translate3d(${mx*-40*z}px,${my*-40*z - sy*0.25*z}px,0)`});requestAnimationFrame(loop)})();
}

/* ---------------- Year ---------------- */
$$("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());

/* ---------------- Init ---------------- */
if(lang!=="es") applyLang(lang); else splitAll();
observe();
})();
