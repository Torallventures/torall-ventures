/* Online ordering — customizer, cart, checkout (demo: no real payments) */
(function(){
"use strict";
const D=window.LC_DATA; if(!D) return;
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const L=()=>{try{return localStorage.getItem("lc-lang")||"es"}catch(e){return "es"}};
const T=(es,en)=>L()==="en"?en:es;
const N=o=>o?(L()==="en"?o.en:o.es):"";
const money=n=>"$"+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const ITEM=id=>D.ITEMS.find(i=>i.id===id);
const art=k=>(window.LC_ART&&window.LC_ART[k])||"";
const media=(it,cls="")=>it.img?`<img class="${cls}" src="${it.img}" alt="${esc(N(it))}" loading="lazy">`:`<div class="${cls} art-bg">${art(it.art)}</div>`;

/* ---------------- Cart state ---------------- */
let cart=ls.get("lc-cart",[]);
const save=()=>{ls.set("lc-cart",cart);renderFab();renderDrawer()};
function linePrice(l){
  const it=ITEM(l.id); if(!it) return 0;
  let p=it.price;
  Object.entries(l.sel||{}).forEach(([g,ids])=>{const G=D.G[g];if(!G)return;ids.forEach(id=>{const ch=G.choices.find(c=>c.id===id);if(ch)p+=ch.p})});
  return p*l.qty;
}
function lineSummary(l){
  const it=ITEM(l.id),out=[];
  it.opts.forEach(g=>{
    const G=D.G[g],sel=(l.sel||{})[g]||[];
    if(G.hint){ const rm=G.def.filter(d=>!sel.includes(d)).map(d=>N(G.choices.find(c=>c.id===d))); if(rm.length) out.push(T("Sin ","No ")+rm.join(", ").toLowerCase()); return; }
    const names=sel.filter(id=>id!=="none"&&id!=="normal").map(id=>{const ch=G.choices.find(c=>c.id===id);return ch?N(ch):""}).filter(Boolean);
    if(names.length) out.push(names.join(", "));
  });
  return out.join(" · ");
}
const count=()=>cart.reduce((a,l)=>a+l.qty,0);
const subtotal=()=>cart.reduce((a,l)=>a+linePrice(l),0);

/* ---------------- Shell UI (fab, drawer, modals, toast) ---------------- */
const shell=document.createElement("div");
shell.innerHTML=`
<button class="cart-fab" aria-label="Ver pedido"><span class="bag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg><i class="cnt">0</i></span><span class="lbl"></span><b class="tot"></b></button>
<div class="drawer-wrap" aria-hidden="true"><div class="dz-back"></div><aside class="drawer" role="dialog" aria-label="Pedido"><header><h3></h3><button class="x" aria-label="Cerrar">✕</button></header><div class="pick"></div><div class="lines"></div><footer></footer></aside></div>
<div class="cz" aria-hidden="true"><div class="cz-back"></div><div class="cz-sheet" role="dialog" aria-modal="true"></div></div>
<div class="co" aria-hidden="true"><div class="cz-back"></div><div class="co-sheet" role="dialog" aria-modal="true"></div></div>
<div class="toast" role="status"></div>`;
document.body.appendChild(shell);
const fab=$(".cart-fab"),dw=$(".drawer-wrap"),cz=$(".cz"),czs=$(".cz-sheet"),co=$(".co"),cos=$(".co-sheet"),toast=$(".toast");
const lock=on=>document.documentElement.classList.toggle("lc-lock",on);
function openDrawer(){renderDrawer();dw.classList.add("open");dw.setAttribute("aria-hidden","false");lock(true)}
function closeDrawer(){dw.classList.remove("open");dw.setAttribute("aria-hidden","true");if(!cz.classList.contains("open")&&!co.classList.contains("open"))lock(false)}
fab.addEventListener("click",openDrawer);
$(".dz-back").addEventListener("click",closeDrawer);$(".drawer .x").addEventListener("click",closeDrawer);
function showToast(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),2200)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(co.classList.contains("open"))closeCheckout();else if(cz.classList.contains("open"))closeCz();else closeDrawer()}});

function renderFab(){
  const n=count();
  fab.classList.toggle("show",n>0||document.body.dataset.page==="order");
  $(".cnt",fab).textContent=n;
  $(".lbl",fab).textContent=n?T("Tu pedido","Your order"):T("Pedido vacío","Empty order");
  $(".tot",fab).textContent=n?money(subtotal()):"";
  $$("[data-cart-count]").forEach(e=>{e.textContent=n;e.style.display=n?"":"none"});
}
function bump(){fab.classList.remove("bump");void fab.offsetWidth;fab.classList.add("bump")}
function flyFrom(el){
  if(!el) return; const r=el.getBoundingClientRect(),f=fab.getBoundingClientRect();
  const dot=document.createElement("div");dot.className="fly";dot.style.left=(r.left+r.width/2)+"px";dot.style.top=(r.top+r.height/2)+"px";document.body.appendChild(dot);
  requestAnimationFrame(()=>{dot.style.transform=`translate(${f.left+30-(r.left+r.width/2)}px,${f.top+20-(r.top+r.height/2)}px) scale(.4)`;dot.style.opacity=".2"});
  setTimeout(()=>{dot.remove();bump()},700);
}

/* ---------------- Drawer ---------------- */
function pickupText(){
  const p=ls.get("lc-pickup",null);
  if(p&&p.mode==="later") return T("Recoger: ","Pickup: ")+slotLabel(p.day,p.min);
  return T("Recoger lo antes posible · ~20–25 min","Pickup ASAP · ~20–25 min");
}
function renderDrawer(){
  $(".drawer h3").textContent=T("Tu pedido","Your order");
  $(".drawer .pick").innerHTML=`<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg><span>${T("Para recoger en","Pickup at")} <b>1366 E 4th Ave, Hialeah</b></span>`;
  const box=$(".drawer .lines"),ft=$(".drawer footer");
  if(!cart.length){
    box.innerHTML=`<div class="empty"><div class="eart">${art("cajita")}</div><h4>${T("Tu cajita está vacía","Your cajita is empty")}</h4><p>${T("Agrega tus favoritos del menú.","Add your favorites from the menu.")}</p><a class="btn solid" href="ordenar.html">${T("Ver el menú","Browse the menu")} <span class="arr">→</span></a></div>`;
    ft.innerHTML="";return;
  }
  box.innerHTML=cart.map((l,i)=>{const it=ITEM(l.id);return `<div class="line" data-i="${i}">
    <div class="lm">${media(it)}</div>
    <div class="li"><div class="lt"><b>${esc(N(it))}</b><span>${money(linePrice(l))}</span></div>
      ${lineSummary(l)?`<p>${esc(lineSummary(l))}</p>`:""}${l.note?`<p class="nt">“${esc(l.note)}”</p>`:""}
      <div class="la"><div class="qty sm"><button data-a="dec" aria-label="-">−</button><span>${l.qty}</span><button data-a="inc" aria-label="+">+</button></div>
      <button class="lk" data-a="edit">${T("Editar","Edit")}</button><button class="lk" data-a="rm">${T("Quitar","Remove")}</button></div></div></div>`}).join("");
  ft.innerHTML=`<div class="row"><span>Subtotal</span><b>${money(subtotal())}</b></div>
    <button class="btn solid wide go">${T("Continuar al pago","Continue to checkout")} <span class="arr">→</span></button>
    <a class="more" href="ordenar.html">+ ${T("Agregar más","Add more items")}</a>`;
  $(".go",ft).addEventListener("click",()=>{closeDrawer();openCheckout()});
}
$(".drawer .lines").addEventListener("click",e=>{
  const b=e.target.closest("button[data-a]");if(!b)return;const i=+b.closest(".line").dataset.i,l=cart[i];
  if(b.dataset.a==="inc")l.qty=Math.min(20,l.qty+1);
  if(b.dataset.a==="dec"){l.qty--; if(l.qty<1)cart.splice(i,1)}
  if(b.dataset.a==="rm")cart.splice(i,1);
  if(b.dataset.a==="edit"){openCz(l.id,null,i);return}
  save();
});

/* ---------------- Customizer ---------------- */
let cs=null; // {id, sel, qty, note, editIndex}
function openCz(id,srcEl,editIndex){
  const it=ITEM(id); if(!it) return;
  const base=editIndex!=null?cart[editIndex]:null;
  cs={id,qty:base?base.qty:1,note:base?base.note:"",edit:editIndex,src:srcEl,sel:{}};
  it.opts.forEach(g=>{cs.sel[g]=base&&base.sel[g]?[...base.sel[g]]:[...(D.G[g].def||[])]});
  renderCz(); cz.classList.add("open"); cz.setAttribute("aria-hidden","false"); lock(true);
  czs.scrollTop=0;
}
function closeCz(){cz.classList.remove("open");cz.setAttribute("aria-hidden","true");if(!dw.classList.contains("open"))lock(false)}
$(".cz .cz-back").addEventListener("click",closeCz);
function czTotal(){return linePrice({id:cs.id,qty:cs.qty,sel:cs.sel})}
function groupState(g){const G=D.G[g],n=(cs.sel[g]||[]).length;return {G,n,ok:n>=G.min}}
function renderCz(){
  const it=ITEM(cs.id);
  czs.innerHTML=`<button class="cz-x" aria-label="Cerrar">✕</button>
  <div class="cz-media">${media(it)}</div>
  <div class="cz-body">
    ${it.tag?`<span class="cz-tag">${esc(N(it.tag))}</span>`:""}
    <h3>${esc(N(it))}</h3><div class="cz-price">${money(it.price)}</div>
    <p class="cz-desc">${esc(L()==="en"?it.den:it.des)}</p>
    ${it.opts.map(g=>{const {G,n}=groupState(g);const req=G.min>0;
      return `<section class="grp" data-g="${g}"><div class="gh"><h4>${esc(N(G))}</h4><span class="badge ${req?"req":""}">${req?(G.min===G.max?T(`Requerido · elige ${G.min}`,`Required · pick ${G.min}`):T("Requerido","Required")):(G.hint?N(G.hint):T("Opcional","Optional"))}</span></div>
      ${G.max>1&&G.min===G.max?`<div class="gprog"><i style="width:${n/G.max*100}%"></i></div>`:""}
      <div class="chs ${G.max===1?"radio":""}">${G.choices.map(c=>{const on=cs.sel[g].includes(c.id);return `<button class="ch ${on?"on":""}" data-c="${c.id}" aria-pressed="${on}"><span class="ck"></span><span class="cn">${esc(N(c))}</span>${c.p?`<span class="cp">+${money(c.p)}</span>`:""}</button>`}).join("")}</div></section>`}).join("")}
    <section class="grp note"><div class="gh"><h4>${T("Instrucciones especiales","Special instructions")}</h4><span class="badge">${T("Opcional","Optional")}</span></div>
      <textarea maxlength="160" rows="3" placeholder="${T("Ej. menos arroz, sin cebolla, la carne bien cocida…","E.g. less rice, no onion, meat well done…")}">${esc(cs.note||"")}</textarea>
      <div class="cc"><span>${(cs.note||"").length}</span>/160</div></section>
  </div>
  <div class="cz-foot"><div class="qty"><button data-q="-1" aria-label="-">−</button><span>${cs.qty}</span><button data-q="1" aria-label="+">+</button></div>
    <button class="btn solid cz-add"><span>${cs.edit!=null?T("Guardar cambios","Save changes"):T("Agregar al pedido","Add to order")}</span><b>${money(czTotal())}</b></button></div>`;
  updateAddState();
}
function updateAddState(){
  const bad=ITEM(cs.id).opts.some(g=>!groupState(g).ok);
  $(".cz-add",czs).classList.toggle("dim",bad);
  $(".cz-add b",czs).textContent=money(czTotal());
}
czs.addEventListener("click",e=>{
  if(e.target.closest(".cz-x")){closeCz();return}
  const ch=e.target.closest(".ch");
  if(ch){
    const g=ch.closest(".grp").dataset.g,G=D.G[g],id=ch.dataset.c,arr=cs.sel[g];
    if(G.max===1){cs.sel[g]=[id]}
    else if(arr.includes(id)){arr.splice(arr.indexOf(id),1)}
    else if(arr.length<G.max){arr.push(id)}
    else { const b=$(".badge",ch.closest(".grp")); b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake"); return; }
    const sec=ch.closest(".grp");
    $$(".ch",sec).forEach(b=>{const on=cs.sel[g].includes(b.dataset.c);b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
    const pr=$(".gprog i",sec); if(pr) pr.style.width=(cs.sel[g].length/G.max*100)+"%";
    sec.classList.toggle("bad",false);
    updateAddState(); return;
  }
  const q=e.target.closest("[data-q]");
  if(q){cs.qty=Math.max(1,Math.min(20,cs.qty+ +q.dataset.q));$(".cz-foot .qty span",czs).textContent=cs.qty;updateAddState();return}
  if(e.target.closest(".cz-add")){
    const miss=ITEM(cs.id).opts.find(g=>!groupState(g).ok);
    if(miss){const sec=$(`.grp[data-g="${miss}"]`,czs);sec.classList.add("bad");sec.scrollIntoView({behavior:"smooth",block:"center"});return}
    const line={uid:Date.now().toString(36),id:cs.id,qty:cs.qty,sel:cs.sel,note:(cs.note||"").trim()};
    if(cs.edit!=null) cart[cs.edit]=line; else cart.push(line);
    const src=cs.src; save(); closeCz();
    showToast(cs.edit!=null?T("Pedido actualizado ✓","Order updated ✓"):T("¡Agregado a tu pedido! ✓","Added to your order! ✓"));
    if(cs.edit==null) flyFrom(src||fab); else renderDrawer();
  }
});
czs.addEventListener("input",e=>{if(e.target.matches("textarea")){cs.note=e.target.value;$(".cc span",czs).textContent=cs.note.length}});

/* ---------------- Hours / slots ---------------- */
const HOURS={0:[8,21],1:[8,21],2:[8,21],3:[8,21],4:[8,21],5:[8,22],6:[8,23]};
function miami(){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",weekday:"short",hour:"numeric",minute:"numeric",hour12:false}).formatToParts(new Date());
  const g=t=>f.find(p=>p.type===t).value;
  return {dow:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday")),min:(parseInt(g("hour"))%24)*60+parseInt(g("minute"))};
}
const DAYS_ES=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"],DAYS_EN=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const tfmt=m=>{const h=Math.floor(m/60),mm=m%60,ap=h>=12?"PM":"AM";return `${((h+11)%12)+1}:${String(mm).padStart(2,"0")} ${ap}`};
function dayName(off){const d=(miami().dow+off)%7;if(off===0)return T("Hoy","Today");if(off===1)return T("Mañana","Tomorrow");return L()==="en"?DAYS_EN[d]:DAYS_ES[d]}
function slotLabel(day,min){return `${dayName(day)}, ${tfmt(min)}`}
function slots(off){
  const now=miami(),d=(now.dow+off)%7,[o,c]=HOURS[d],out=[];
  for(let m=o*60+15;m<=c*60-15;m+=15){ if(off===0&&m<now.min+30) continue; out.push(m) }
  return out;
}
function asapOK(){const n=miami(),[o,c]=HOURS[n.dow];return n.min>=o*60&&n.min<c*60-20}

/* ---------------- Checkout ---------------- */
let ck=null;
function openCheckout(){
  if(!cart.length) return;
  const prev=ls.get("lc-pickup",null),info=ls.get("lc-info",{});
  ck={step:1,mode:asapOK()?(prev&&prev.mode)||"asap":"later",day:prev&&prev.day||0,min:prev&&prev.min||null,name:info.name||"",phone:info.phone||"",email:info.email||"",sms:true,pay:"store",tip:0.15};
  if(ck.mode==="later"&&!slots(ck.day).length) ck.day=1;
  renderCo(); co.classList.add("open"); co.setAttribute("aria-hidden","false"); lock(true);
}
function closeCheckout(){co.classList.remove("open");co.setAttribute("aria-hidden","true");lock(false)}
$(".co .cz-back").addEventListener("click",()=>{if(!ck||ck.step<4)closeCheckout()});
function totals(){const s=subtotal(),tax=s*D.TAX,tip=s*ck.tip;return {s,tax,tip,t:s+tax+tip}}
function stepHead(){
  const names=[T("Hora","Time"),T("Tus datos","Details"),T("Pago","Payment")];
  return `<div class="steps">${names.map((n,i)=>`<div class="st ${ck.step>i+1?"done":""} ${ck.step===i+1?"on":""}"><i>${ck.step>i+1?"✓":i+1}</i><span>${n}</span></div>`).join("")}</div>`;
}
function renderCo(){
  const s=ck.step; let body="";
  if(s===1){
    const ok=asapOK();
    body=`<h3>${T("¿Cuándo lo quieres?","When do you want it?")}</h3>
    <div class="modes">
      <button class="mode ${ck.mode==="asap"?"on":""} ${ok?"":"off"}" data-m="asap" ${ok?"":"disabled"}><b>${T("Lo antes posible","ASAP")}</b><span>${ok?T("Listo en ~20–25 min","Ready in ~20–25 min"):T("Cerrado ahora","Closed right now")}</span></button>
      <button class="mode ${ck.mode==="later"?"on":""}" data-m="later"><b>${T("Programar","Schedule")}</b><span>${T("Elige día y hora","Pick a day & time")}</span></button>
    </div>
    ${ck.mode==="later"?`<div class="days">${[0,1,2,3].map(o=>`<button class="day ${ck.day===o?"on":""}" data-d="${o}" ${slots(o).length?"":"disabled"}>${dayName(o)}</button>`).join("")}</div>
      <div class="slots">${slots(ck.day).map(m=>`<button class="slot ${ck.min===m?"on":""}" data-s="${m}">${tfmt(m)}</button>`).join("")||`<p class="muted">${T("No quedan horarios hoy.","No times left today.")}</p>`}</div>`:""}`;
  }
  if(s===2){
    body=`<h3>${T("¿A nombre de quién?","Who's picking up?")}</h3>
    <div class="fields">
      <label class="fl"><span>${T("Nombre","Name")} *</span><input name="name" autocomplete="name" value="${esc(ck.name)}"></label>
      <label class="fl"><span>${T("Teléfono","Phone")} *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(305) 555-0123" value="${esc(ck.phone)}"></label>
      <label class="fl full"><span>Email (${T("opcional","optional")})</span><input name="email" type="email" autocomplete="email" value="${esc(ck.email)}"></label>
      <label class="cbx full"><input type="checkbox" name="sms" ${ck.sms?"checked":""}><span>${T("Avísame por texto cuando mi pedido esté listo","Text me when my order is ready")}</span></label>
    </div><p class="err" hidden></p>`;
  }
  if(s===3){
    const t=totals();
    body=`<h3>${T("Pago","Payment")}</h3>
    <div class="pays">
      <button class="pay ${ck.pay==="store"?"on":""}" data-p="store"><b>${T("Pagar al recoger","Pay at pickup")}</b><span>${T("Efectivo o tarjeta en el restaurante","Cash or card at the restaurant")}</span></button>
      <button class="pay ${ck.pay==="online"?"on":""}" data-p="online"><b>${T("Pagar en línea","Pay online")}</b><span>${T("Tarjeta, Apple Pay, Google Pay","Card, Apple Pay, Google Pay")}</span></button>
    </div>
    ${ck.pay==="online"?`<div class="demo-note">${T("En el sitio real, aquí se abre el pago seguro (Square, Stripe o Toast). En este demo no se cobra nada.","On the live site this opens secure checkout (Square, Stripe or Toast). Nothing is charged in this demo.")}</div>`:""}
    <h4 class="sub">${T("¿Propina para el equipo?","Tip the team?")}</h4>
    <div class="tips">${[0,0.10,0.15,0.20].map(p=>`<button class="tip ${ck.tip===p?"on":""}" data-t="${p}">${p?Math.round(p*100)+"%":T("Ahora no","Not now")}<small>${p?money(subtotal()*p):""}</small></button>`).join("")}</div>
    <div class="sum">
      <div class="row"><span>Subtotal</span><span>${money(t.s)}</span></div>
      <div class="row"><span>${T("Impuesto (7%)","Tax (7%)")}</span><span>${money(t.tax)}</span></div>
      <div class="row"><span>${T("Propina","Tip")}</span><span>${money(t.tip)}</span></div>
      <div class="row big"><span>Total</span><b>${money(t.t)}</b></div>
    </div>
    <div class="recap"><b>${T("Recoger","Pickup")}:</b> ${ck.mode==="asap"?T("Lo antes posible (~20–25 min)","ASAP (~20–25 min)"):slotLabel(ck.day,ck.min)} · <b>${esc(ck.name)}</b></div>`;
  }
  if(s===4){
    const o=ck.order;
    cos.innerHTML=`<div class="done">
      <svg class="chk" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36"/><path d="M24 41l11 11 22-24"/></svg>
      <h3>${T("¡Pedido confirmado!","Order confirmed!")}</h3>
      <p class="ono">${T("Pedido","Order")} <b>#${o.no}</b></p>
      <div class="when"><small>${T("Listo para recoger","Ready for pickup")}</small><b>${o.when}</b></div>
      <ul class="olist">${o.lines.map(l=>`<li><span>${l.qty}× ${esc(l.name)}</span><span>${money(l.price)}</span></li>`).join("")}<li class="tt"><span>Total</span><b>${money(o.total)}</b></li></ul>
      <p class="muted">${o.sms?T("Te mandamos un texto cuando esté listo.","We'll text you when it's ready."):""} ${T("Recoge en","Pick up at")} 1366 E 4th Ave, Hialeah.</p>
      <div class="dbtns"><a class="btn solid" href="https://www.google.com/maps/dir/?api=1&destination=Fritanga+La+Chontale%C3%B1a+1366+E+4th+Ave+Hialeah+FL" target="_blank" rel="noopener">${T("Cómo llegar","Directions")} <span class="arr">↗</span></a><button class="btn close-done">${T("Listo","Done")}</button></div>
      <p class="sig">👑 ${T("Gracias por tu pedido — El Rey Fritanguero","Thanks for your order — El Rey Fritanguero")} 🇳🇮</p>
      <p class="demo-note">${T("Demo: este pedido no se envió al restaurante.","Demo: this order was not sent to the restaurant.")}</p>
    </div>`;
    $(".close-done",cos).addEventListener("click",closeCheckout);
    return;
  }
  const nextLbl=s===3?`${T("Hacer pedido","Place order")} · ${money(totals().t)}`:T("Continuar","Continue");
  cos.innerHTML=`<button class="cz-x" aria-label="Cerrar">✕</button>${stepHead()}<div class="co-body">${body}</div>
    <div class="co-foot">${s>1?`<button class="btn back">← ${T("Atrás","Back")}</button>`:"<span></span>"}<button class="btn solid next">${nextLbl}</button></div>`;
}
cos.addEventListener("click",e=>{
  if(!ck) return;
  if(e.target.closest(".cz-x")){closeCheckout();return}
  const m=e.target.closest("[data-m]");if(m&&!m.disabled){ck.mode=m.dataset.m;if(ck.mode==="later"&&!slots(ck.day).length)ck.day=1;renderCo();return}
  const d=e.target.closest("[data-d]");if(d){ck.day=+d.dataset.d;ck.min=null;renderCo();return}
  const sl=e.target.closest("[data-s]");if(sl){ck.min=+sl.dataset.s;$$(".slot",cos).forEach(b=>b.classList.toggle("on",b===sl));return}
  const p=e.target.closest("[data-p]");if(p){ck.pay=p.dataset.p;renderCo();return}
  const t=e.target.closest("[data-t]");if(t){ck.tip=+t.dataset.t;renderCo();return}
  if(e.target.closest(".back")){ck.step--;renderCo();return}
  if(e.target.closest(".next")){
    if(ck.step===1){ if(ck.mode==="later"&&ck.min==null){const s=$(".slots",cos);s&&s.classList.remove("shake");void (s&&s.offsetWidth);s&&s.classList.add("shake");return} ls.set("lc-pickup",{mode:ck.mode,day:ck.day,min:ck.min}); }
    if(ck.step===2){
      const f=n=>$(`[name=${n}]`,cos);ck.name=f("name").value.trim();ck.phone=f("phone").value.trim();ck.email=f("email").value.trim();ck.sms=f("sms").checked;
      const err=$(".err",cos);
      if(!ck.name){err.hidden=false;err.textContent=T("Escribe tu nombre.","Please enter your name.");f("name").focus();return}
      if(ck.phone.replace(/\D/g,"").length<10){err.hidden=false;err.textContent=T("Escribe un teléfono válido de 10 dígitos.","Please enter a valid 10-digit phone.");f("phone").focus();return}
      ls.set("lc-info",{name:ck.name,phone:ck.phone,email:ck.email});
    }
    if(ck.step===3){
      const t=totals();
      ck.order={no:"LC-"+Math.floor(1000+Math.random()*9000),when:ck.mode==="asap"?T("En ~20–25 minutos","In ~20–25 minutes"):slotLabel(ck.day,ck.min),
        lines:cart.map(l=>({qty:l.qty,name:N(ITEM(l.id)),price:linePrice(l)})),total:t.t,sms:ck.sms};
      ls.set("lc-last-order",ck.order); cart=[]; save();
    }
    ck.step++; renderCo(); cos.scrollTop=0;
  }
});
cos.addEventListener("input",e=>{ if(e.target.name==="phone"){ let v=e.target.value.replace(/\D/g,"").slice(0,10); if(v.length>6)v=`(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;else if(v.length>3)v=`(${v.slice(0,3)}) ${v.slice(3)}`; e.target.value=v; }});

/* ---------------- Page renderers ---------------- */
function cardHTML(it){
  return `<article class="ocard reveal" data-id="${it.id}" tabindex="0">
    <div class="om">${media(it)}${it.tag?`<span class="otag">${esc(N(it.tag))}</span>`:""}</div>
    <div class="ob"><h3>${esc(N(it))}</h3><p>${esc(L()==="en"?it.den:it.des)}</p>
    <div class="of"><b>${money(it.price)}</b><button class="add" data-add="${it.id}" aria-label="${T("Agregar","Add")} ${esc(N(it))}">+</button></div></div></article>`;
}
function renderOrderPage(){
  const root=$("#orderRoot"); if(!root) return;
  root.innerHTML=D.CATS.map(c=>`<div class="cat" id="o-${c.id}"><div class="cat-head reveal"><div class="ico">${art(c.art)}</div><h2>${esc(N(c))}</h2><span class="note">${esc(N(c.note))}</span></div>
    <div class="ogrid">${D.ITEMS.filter(i=>i.cat===c.id).map(cardHTML).join("")}</div></div>`).join("");
}
function renderMenuPage(){
  const root=$("#menuRoot"); if(!root) return;
  root.innerHTML=D.CATS.map(c=>{
    const items=D.ITEMS.filter(i=>i.cat===c.id);
    const feat=items.filter(i=>i.img), rest=items.filter(i=>!i.img);
    return `<div class="cat" id="${c.id}"><div class="cat-head reveal"><div class="ico">${art(c.art)}</div><h2>${esc(N(c))}</h2><span class="note">${esc(N(c.note))}</span></div>
    ${feat.length?`<div class="specials" style="margin-bottom:1.5rem">${feat.map((it,k)=>`<div class="special photo reveal ${k?"d1":""}" data-id="${it.id}"><img src="${it.img}" alt="${esc(N(it))}" loading="lazy"><div class="sp-in">${it.tag?`<span class="otag">${esc(N(it.tag))}</span>`:""}<h3>${esc(N(it))}</h3><p>${esc(L()==="en"?it.den:it.des)}</p><div class="sp-f"><span class="p">${money(it.price)}</span><button class="btn light sm" data-add="${it.id}">${T("Ordenar","Order")} <span class="arr">→</span></button></div></div></div>`).join("")}</div>`:""}
    <div class="items">${rest.map((it,k)=>`<div class="item reveal ${k%2?"d1":""}" data-id="${it.id}"><h3>${esc(N(it))}${it.tag?` <span class="tag">${esc(N(it.tag))}</span>`:""}</h3><span class="p">${money(it.price)}</span><p>${esc(L()==="en"?it.den:it.des)}</p><button class="add-mini" data-add="${it.id}">+ ${T("Agregar","Add")}</button></div>`).join("")}</div></div>`}).join("");
}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-add]"); if(a){e.preventDefault();openCz(a.dataset.add,a);return}
  const card=e.target.closest(".ocard"); if(card){openCz(card.dataset.id,$(".add",card));return}
  const o=e.target.closest("[data-open-cart]"); if(o){e.preventDefault();openDrawer()}
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("ocard"))openCz(e.target.dataset.id,$(".add",e.target))});

function renderAll(){renderOrderPage();renderMenuPage();renderFab();renderDrawer();
  if(window.LC_observe) window.LC_observe(); if(window.LC_refreshTabs) window.LC_refreshTabs();}
renderAll();
document.addEventListener("lc:lang",()=>{renderAll(); if(cz.classList.contains("open"))renderCz(); if(co.classList.contains("open")&&ck&&ck.step<4)renderCo();});
window.LC_openCart=openDrawer;
})();
