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
const DOW_ES=["dom","lun","mar","mié","jue","vie","sáb"],DOW_EN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function todayDow(){return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",weekday:"short"}).format(new Date()))}
function avail(it){
  if(it.soldOut) return {ok:false,label:T("Agotado hoy","Sold out today")};
  if(it.days){const lbl=T("Solo ","Only ")+it.days.map(d=>L()==="en"?DOW_EN[d]:DOW_ES[d]).join(T(" y "," & "));return {ok:true,limited:true,today:it.days.includes(todayDow()),label:lbl}}
  return {ok:true};
}
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
  const n=count(); if(typeof renderMbar==="function"&&mbar) renderMbar();
  fab.classList.toggle("show",n>0);
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
    const lastO=orders()[0];
    box.innerHTML=`<div class="empty"><div class="eart">${art("cajita")}</div><h4>${T("Tu cajita está vacía","Your cajita is empty")}</h4><p>${T("Agrega tus favoritos del menú.","Add your favorites from the menu.")}</p><a class="btn solid" href="ordenar/">${T("Ver el menú","Browse the menu")} <span class="arr">→</span></a></div>${lastO?`<div class="dz-re"><small>${T("Pide de nuevo","Order again")}</small>${orderCard(lastO)}</div>`:""}`;
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
    <a class="more" href="ordenar/">+ ${T("Agregar más","Add more items")}</a>`;
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
  if(!avail(it).ok){showToast(T("Ese plato está agotado hoy 😔","That dish is sold out today 😔"));return}
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
    ${(()=>{const a=avail(it);return a.limited?`<div class="cz-limit">🗓 ${esc(a.label)}${a.today?"":T(" — prográmalo para recoger el fin de semana al pagar."," — schedule a weekend pickup at checkout.")}</div>`:""})()}
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
function cartDays(){let d=[0,1,2,3,4,5,6];cart.forEach(l=>{const it=ITEM(l.id);if(it&&it.days)d=d.filter(x=>it.days.includes(x))});return d}
function dayAllowed(off){return cartDays().includes((miami().dow+off)%7)&&slots(off).length>0}
function asapOK(){const n=miami(),[o,c]=HOURS[n.dow];return n.min>=o*60&&n.min<c*60-20&&cartDays().includes(n.dow)}
function firstDay(){for(let o=0;o<7;o++)if(dayAllowed(o))return o;return 0}

/* ---------------- Checkout ---------------- */
let ck=null;
function openCheckout(){
  if(!cart.length) return;
  const prev=ls.get("lc-pickup",null),u=user(),info=u?{name:u.name,phone:u.phone}:ls.get("lc-info",{});
  ck={redeem:true,join:true,tipCustom:"",step:1,mode:asapOK()?(prev&&prev.mode)||"asap":"later",day:prev&&prev.day||0,min:prev&&prev.min||null,name:info.name||"",phone:info.phone||"",email:info.email||"",sms:true,pay:"card",tip:0.15};
  if(ck.mode==="later"&&!dayAllowed(ck.day)) ck.day=firstDay();
  renderCo(); co.classList.add("open"); co.setAttribute("aria-hidden","false"); lock(true);
}
function closeCheckout(){co.classList.remove("open");co.setAttribute("aria-hidden","true");lock(false)}
$(".co .cz-back").addEventListener("click",()=>{if(!ck||ck.step<4)closeCheckout()});
function club(){return ls.get("lc-club",null)}
function canRedeem(){const c=club();return c&&c.stamps>=D.CLUB.goal}
function tipAmt(s){if(ck.tip==="custom"){const v=parseFloat(String(ck.tipCustom).replace(/[^0-9.]/g,""));return isFinite(v)?Math.min(v,999):0}return s*ck.tip}
function totals(){const s=subtotal(),disc=(ck.redeem&&canRedeem())?Math.min(D.CLUB.reward,s):0,base=s-disc,tax=base*D.TAX,tip=tipAmt(s);return {s,disc,tax,tip,t:base+tax+tip}}
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
      <button class="mode ${ck.mode==="asap"?"on":""} ${ok?"":"off"}" data-m="asap" ${ok?"":"disabled"}><b>${T("Lo antes posible","ASAP")}</b><span>${ok?T("Listo en ~20–25 min","Ready in ~20–25 min"):(cartDays().length<7?T("Tu pedido tiene platos de fin de semana","Your order has weekend-only dishes"):T("Cerrado ahora","Closed right now"))}</span></button>
      <button class="mode ${ck.mode==="later"?"on":""}" data-m="later"><b>${T("Programar","Schedule")}</b><span>${T("Elige día y hora","Pick a day & time")}</span></button>
    </div>
    ${ck.mode==="later"?`<div class="days">${[0,1,2,3,4,5,6].map(o=>`<button class="day ${ck.day===o?"on":""}" data-d="${o}" ${dayAllowed(o)?"":"disabled"}>${dayName(o)}</button>`).join("")}</div>
      <div class="slots">${slots(ck.day).map(m=>`<button class="slot ${ck.min===m?"on":""}" data-s="${m}">${tfmt(m)}</button>`).join("")||`<p class="muted">${T("No quedan horarios hoy.","No times left today.")}</p>`}</div>`:""}`;
  }
  if(s===2){
    body=`<h3>${T("¿A nombre de quién?","Who's picking up?")}</h3>
    <div class="fields">
      <label class="fl"><span>${T("Nombre","Name")} *</span><input name="name" autocomplete="name" value="${esc(ck.name)}"></label>
      <label class="fl"><span>${T("Teléfono","Phone")} *</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(305) 555-0123" value="${esc(ck.phone)}"></label>
      <label class="fl full"><span>Email (${T("opcional","optional")})</span><input name="email" type="email" autocomplete="email" value="${esc(ck.email)}"></label>
      <label class="cbx full"><input type="checkbox" name="sms" ${ck.sms?"checked":""}><span>${T("Avísame por texto cuando mi pedido esté listo","Text me when my order is ready")}</span></label>
      ${club()?`<div class="club-mini full">👑 ${T("Club del Rey","Club del Rey")}: <b>${club().stamps}/${D.CLUB.goal}</b> ${T("coronas — este pedido suma 1","crowns — this order adds 1")}</div>`:`<label class="cbx full club-join"><input type="checkbox" name="join" ${ck.join?"checked":""}><span>👑 <b>${T("Únete al Club del Rey","Join Club del Rey")}</b> — ${T(`gana una corona por pedido; a las ${D.CLUB.goal}, $${D.CLUB.reward} de descuento.`,`earn a crown per order; at ${D.CLUB.goal}, get $${D.CLUB.reward} off.`)}</span></label>`}
    </div><p class="err" hidden></p>`;
  }
  if(s===3){
    const t=totals();
    body=`<h3>${T("Pago","Payment")}</h3>
    <p class="secure">🔒 ${T("Pago seguro en línea — tu pedido entra a la cocina ya pagado.","Secure online payment — your order goes to the kitchen already paid.")}</p>
    <div class="pays three">
      <button class="pay ${ck.pay==="card"?"on":""}" data-p="card"><b>💳 ${T("Tarjeta","Card")}</b><span>Visa · Mastercard · Amex</span></button>
      <button class="pay ${ck.pay==="apple"?"on":""}" data-p="apple"><b> Apple Pay</b><span>${T("En iPhone","On iPhone")}</span></button>
      <button class="pay ${ck.pay==="google"?"on":""}" data-p="google"><b>G Pay</b><span>${T("En Android","On Android")}</span></button>
    </div>
    <div class="demo-note">${T("En el sitio real, aquí se abre el pago seguro (Square, Stripe o Toast). En este demo no se cobra nada.","On the live site this opens secure checkout (Square, Stripe or Toast). Nothing is charged in this demo.")}</div>
    ${canRedeem()?`<label class="cbx redeem"><input type="checkbox" data-redeem ${ck.redeem?"checked":""}><span>👑 ${T(`¡Tienes ${D.CLUB.goal} coronas! Usa tus $${D.CLUB.reward} de descuento`,`You have ${D.CLUB.goal} crowns! Use your $${D.CLUB.reward} off`)}</span></label>`:""}
    <h4 class="sub">${T("¿Propina para el equipo?","Tip the team?")}</h4>
    <div class="tips">${[0,0.10,0.15,0.20].map(p=>`<button class="tip ${ck.tip===p?"on":""}" data-t="${p}">${p?Math.round(p*100)+"%":T("Ahora no","Not now")}<small>${p?money(subtotal()*p):""}</small></button>`).join("")}<button class="tip ${ck.tip==="custom"?"on":""}" data-t="custom">${T("Otro","Custom")}<small>$</small></button></div>
    ${ck.tip==="custom"?`<label class="tip-custom"><span>$</span><input type="text" inputmode="decimal" data-tipc placeholder="0.00" value="${esc(ck.tipCustom)}" aria-label="${T("Propina personalizada","Custom tip")}"></label>`:""}
    <div class="sum">
      <div class="row"><span>Subtotal</span><span>${money(t.s)}</span></div>
      ${t.disc?`<div class="row club-row"><span>👑 ${T("Recompensa del Club","Club reward")}</span><span>−${money(t.disc)}</span></div>`:""}
      <div class="row"><span>${T("Impuesto (7%)","Tax (7%)")}</span><span>${money(t.tax)}</span></div>
      <div class="row" data-k="tip"><span>${T("Propina","Tip")}</span><span>${money(t.tip)}</span></div>
      <div class="row big"><span>Total</span><b>${money(t.t)}</b></div>
    </div>
    <p class="legal-line">${T("Al hacer tu pedido aceptas los","By placing your order you agree to the")} <a href="terminos/" target="_blank">${T("Términos","Terms")}</a> ${T("y la","and")} <a href="privacidad/" target="_blank">${T("Política de privacidad","Privacy Policy")}</a>.</p>
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
      ${o.club!=null?`<div class="club-done"><span>👑 +1 ${T("corona","crown")}</span><div class="crowns sm">${crownsHTML(o.club)}</div><small>${o.club>=D.CLUB.goal?T("¡Tu próximo pedido tiene descuento!","Your next order has a discount!"):T(`Llevas ${o.club} de ${D.CLUB.goal}`,`${o.club} of ${D.CLUB.goal}`)}</small></div>`:""}
      <p class="muted">${o.sms?T("Te mandamos un texto cuando esté listo.","We'll text you when it's ready."):""} ${T("Recoge en","Pick up at")} 1366 E 4th Ave, Hialeah.</p>
      <div class="dbtns"><a class="btn solid" href="https://www.google.com/maps/dir/?api=1&destination=Fritanga+La+Chontale%C3%B1a+1366+E+4th+Ave+Hialeah+FL" target="_blank" rel="noopener">${T("Cómo llegar","Directions")} <span class="arr">↗</span></a><button class="btn close-done">${T("Listo","Done")}</button></div>
      ${o.guest?`<div class="save-acct"><b>${T("¿La próxima vez en un toque?","Next time in one tap?")}</b><span>${T("Crea tu cuenta con tu teléfono y guarda este pedido.","Create an account with your phone and save this order.")}</span><button class="btn sm" data-acct>${T("Crear cuenta","Create account")}</button></div>`:""}
      <p class="sig">👑 ${T("Gracias por tu pedido — El Rey Fritanguero","Thanks for your order — El Rey Fritanguero")} 🇳🇮</p>
      <p class="demo-note">${T("Demo: este pedido no se envió al restaurante.","Demo: this order was not sent to the restaurant.")}</p>
    </div>`;
    $(".close-done",cos).addEventListener("click",closeCheckout);
    return;
  }
  const nextLbl=s===3?`${T("Hacer pedido","Place order")} · ${money(totals().t)}`:T("Continuar","Continue");
  cos.innerHTML=`<button class="cz-x" aria-label="Cerrar">✕</button>${stepHead()}<div class="co-body">${body}</div>
    <div class="co-foot">${s>1?`<button class="btn back">← ${T("Atrás","Back")}</button>`:"<span></span>"}<button class="btn solid next">${nextLbl}</button></div>`;
  const dOn=$(".day.on",cos); if(dOn){const r=dOn.parentElement; r.scrollLeft=dOn.offsetLeft-r.clientWidth/2+dOn.offsetWidth/2;}
}
cos.addEventListener("click",e=>{
  if(!ck) return;
  if(e.target.closest(".cz-x")){closeCheckout();return}
  const m=e.target.closest("[data-m]");if(m&&!m.disabled){ck.mode=m.dataset.m;if(ck.mode==="later"&&!dayAllowed(ck.day))ck.day=firstDay();renderCo();return}
  const d=e.target.closest("[data-d]");if(d){ck.day=+d.dataset.d;ck.min=null;renderCo();return}
  const sl=e.target.closest("[data-s]");if(sl){ck.min=+sl.dataset.s;$$(".slot",cos).forEach(b=>b.classList.toggle("on",b===sl));return}
  const p=e.target.closest("[data-p]");if(p){ck.pay=p.dataset.p;renderCo();return}
  const t=e.target.closest("[data-t]");if(t){ck.tip=t.dataset.t==="custom"?"custom":+t.dataset.t;renderCo();if(ck.tip==="custom"){const i=$("[data-tipc]",cos);i&&i.focus()}return}
  const rd=e.target.closest("[data-redeem]");if(rd){ck.redeem=rd.checked;renderCo();return}
  if(e.target.closest(".back")){ck.step--;renderCo();return}
  if(e.target.closest(".next")){
    if(ck.step===1){ if(ck.mode==="later"&&ck.min==null){const s=$(".slots",cos);s&&s.classList.remove("shake");void (s&&s.offsetWidth);s&&s.classList.add("shake");return} ls.set("lc-pickup",{mode:ck.mode,day:ck.day,min:ck.min}); }
    if(ck.step===2){
      const f=n=>$(`[name=${n}]`,cos);ck.name=f("name").value.trim();ck.phone=f("phone").value.trim();ck.email=f("email").value.trim();ck.sms=f("sms").checked;ck.join=f("join")?f("join").checked:false;
      const err=$(".err",cos);
      if(!ck.name){err.hidden=false;err.textContent=T("Escribe tu nombre.","Please enter your name.");f("name").focus();return}
      if(ck.phone.replace(/\D/g,"").length<10){err.hidden=false;err.textContent=T("Escribe un teléfono válido de 10 dígitos.","Please enter a valid 10-digit phone.");f("phone").focus();return}
      ls.set("lc-info",{name:ck.name,phone:ck.phone,email:ck.email});
    }
    if(ck.step===3){
      const t=totals();
      ck.order={no:"LC-"+Math.floor(1000+Math.random()*9000),when:ck.mode==="asap"?T("En ~20–25 minutos","In ~20–25 minutes"):slotLabel(ck.day,ck.min),
        lines:cart.map(l=>({qty:l.qty,name:N(ITEM(l.id)),price:linePrice(l)})),total:t.t,sms:ck.sms};
      let c=club();
      if(c||ck.join){ c=c||{name:ck.name,phone:ck.phone,stamps:0,sms:false}; if(t.disc) c.stamps-=D.CLUB.goal; c.stamps+=1; ls.set("lc-club",c); ck.order.club=c.stamps; }
      const hist=orders(); hist.unshift({no:ck.order.no,date:Date.now(),total:t.t,lines:cart.map(l=>({id:l.id,qty:l.qty,sel:l.sel,note:l.note}))}); ls.set("lc-orders",hist.slice(0,10));
      const u0=user(); if(u0) ls.set("lc-known-"+u0.phone.replace(/\D/g,""),u0);
      ck.order.guest=!u0;
      ls.set("lc-last-order",ck.order); cart=[]; save(); renderClub(); renderReorder();
    }
    ck.step++; renderCo(); cos.scrollTop=0;
  }
});
cos.addEventListener("input",e=>{ if(e.target.matches("[data-tipc]")){ let v=e.target.value.replace(/[^0-9.]/g,"").replace(/(\..*)\./g,"$1"); const pt=v.split("."); if(pt[1]&&pt[1].length>2)v=pt[0]+"."+pt[1].slice(0,2); e.target.value=v; ck.tipCustom=v; const t=totals(); const rows=$$(".sum .row span:last-child, .sum .row b",cos); const tipRow=[...$$(".sum .row",cos)].find(r=>r.dataset.k==="tip"); if(tipRow) tipRow.lastElementChild.textContent=money(t.tip); const tot=$(".sum .row.big b",cos); if(tot) tot.textContent=money(t.t); const nx=$(".co .next",cos); if(nx) nx.textContent=`${T("Hacer pedido","Place order")} · ${money(t.t)}`; return; } if(e.target.name==="phone"){ let v=e.target.value.replace(/\D/g,"").slice(0,10); if(v.length>6)v=`(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;else if(v.length>3)v=`(${v.slice(0,3)}) ${v.slice(3)}`; e.target.value=v; }});

/* ---------------- Club del Rey ---------------- */
const CROWN='<svg viewBox="0 0 24 24"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>';
function crownsHTML(n){let h="";for(let i=0;i<D.CLUB.goal;i++)h+=`<i class="${i<Math.min(n,D.CLUB.goal)?"on":""}" style="--i:${i}">${i===D.CLUB.goal-1?"🎁":CROWN}</i>`;return h}
function renderClub(){
  const root=$("#clubRoot"); if(!root) return;
  const c=club();
  root.innerHTML=`<div class="club-card reveal in">
    <div class="cc-top"><span>👑 Club del Rey</span><small>${c?esc(c.name):T("Tarjeta de lealtad","Loyalty card")}</small></div>
    <div class="crowns">${crownsHTML(c?c.stamps:3)}</div>
    <div class="cc-bot">${c?`<b>${c.stamps}/${D.CLUB.goal}</b> ${T("coronas","crowns")}${c.stamps>=D.CLUB.goal?" · "+T("¡recompensa lista!","reward ready!"):""}`:T(`Cada pedido = 1 corona · ${D.CLUB.goal} = $${D.CLUB.reward} de descuento`,`Every order = 1 crown · ${D.CLUB.goal} = $${D.CLUB.reward} off`)}</div>
  </div>
  ${c?`<div class="club-member"><h3>${T("¡Ya eres del Club, ","You're in the Club, ")}${esc(c.name.split(" ")[0])}! 👑</h3><p>${T("Cada pedido en línea suma una corona automáticamente con tu teléfono.","Every online order adds a crown automatically with your phone number.")}</p><a class="btn solid" href="ordenar/">${T("Ordenar y ganar","Order & earn")} <span class="arr">→</span></a></div>`:
  `<form class="club-form" novalidate>
    <label class="fl"><span>${T("Nombre","Name")}</span><input name="cname" autocomplete="name"></label>
    <label class="fl"><span>${T("Teléfono","Phone")}</span><input name="cphone" type="tel" inputmode="tel" placeholder="(305) 555-0123"></label>
    <label class="cbx consent"><input type="checkbox" name="csms"><span>${T("Sí, quiero recibir textos con especiales y recompensas de Fritanga La Chontaleña (hasta 4 al mes). Pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar o HELP para ayuda. No es requisito para unirte.","Yes, text me specials and rewards from Fritanga La Chontaleña (up to 4/month). Msg & data rates may apply. Reply STOP to cancel, HELP for help. Not required to join.")} <a href="terminos/#sms">${T("Términos","Terms")}</a> · <a href="privacidad/">${T("Privacidad","Privacy")}</a></span></label>
    <button class="btn solid" type="submit">${T("Unirme gratis","Join free")} <span class="arr">→</span></button>
    <p class="err" hidden></p>
  </form>`}`;
  const f=$(".club-form",root);
  if(f){
    f.addEventListener("input",e=>{if(e.target.name==="cphone"){let v=e.target.value.replace(/\D/g,"").slice(0,10);if(v.length>6)v=`(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;else if(v.length>3)v=`(${v.slice(0,3)}) ${v.slice(3)}`;e.target.value=v}});
    f.addEventListener("submit",e=>{e.preventDefault();const n=f.cname.value.trim(),ph=f.cphone.value,err=$(".err",f);
      if(!n){err.hidden=false;err.textContent=T("Escribe tu nombre.","Enter your name.");return}
      if(ph.replace(/\D/g,"").length<10){err.hidden=false;err.textContent=T("Escribe un teléfono de 10 dígitos.","Enter a 10-digit phone.");return}
      ls.set("lc-club",{name:n,phone:ph,stamps:1,sms:f.csms.checked});renderClub();
      showToast(T("¡Bienvenido al Club del Rey! Te regalamos tu primera corona 👑","Welcome to Club del Rey! Your first crown is on us 👑"));});
  }
}

/* ---------------- Mobile order bar ---------------- */
const mbar=document.createElement("div");mbar.className="mbar";document.body.appendChild(mbar);
function renderMbar(){
  const n=count();
  const onOrder=document.body.dataset.page==="order";
  mbar.classList.toggle("empty-hide",!n&&onOrder);
  if(!n&&onOrder){mbar.innerHTML="";return}
  mbar.innerHTML=n?`<button class="mb-main" data-open-cart><span class="mb-c">${n}</span><span>${T("Ver pedido","View order")}</span><b>${money(subtotal())}</b></button><a class="mb-call" href="tel:+13056039352" aria-label="${T("Llamar","Call")}">📞</a>`
    :`<a class="mb-main" href="ordenar/"><span>${T("Ordenar en línea","Order online")}</span><span class="arr">→</span></a><a class="mb-call" href="tel:+13056039352" aria-label="${T("Llamar","Call")}">📞</a>`;
}


/* ---------------- Account: sign in + order history ---------------- */
const user=()=>ls.get("lc-user",null);
const orders=()=>ls.get("lc-orders",[]);
const acc=document.createElement("div");acc.className="co acct";acc.setAttribute("aria-hidden","true");
acc.innerHTML='<div class="cz-back"></div><div class="co-sheet acct-sheet" role="dialog" aria-modal="true"></div>';
document.body.appendChild(acc);
const as=$(".acct-sheet",acc);
let av={view:"start"};
function openAcct(view){av={view:view||(user()?"home":"start")};renderAcct();acc.classList.add("open");acc.setAttribute("aria-hidden","false");lock(true)}
function closeAcct(){acc.classList.remove("open");acc.setAttribute("aria-hidden","true");lock(false)}
$(".cz-back",acc).addEventListener("click",closeAcct);
const fmtPhone=v=>{v=v.replace(/\D/g,"").slice(0,10);if(v.length>6)return `(${v.slice(0,3)}) ${v.slice(3,6)}-${v.slice(6)}`;if(v.length>3)return `(${v.slice(0,3)}) ${v.slice(3)}`;return v};
const dateFmt=t=>new Intl.DateTimeFormat(L()==="en"?"en-US":"es-US",{month:"short",day:"numeric"}).format(new Date(t));
function orderCard(o){
  const names=o.lines.map(l=>{const it=ITEM(l.id);return it?`${l.qty}× ${N(it)}`:""}).filter(Boolean);
  const pics=o.lines.slice(0,3).map(l=>{const it=ITEM(l.id);return it?`<span class="op">${media(it)}</span>`:""}).join("");
  return `<div class="ocard-mini"><div class="opics">${pics}</div><div class="oinfo"><b>${esc(names.join(", "))}</b><small>${dateFmt(o.date)} · ${money(o.total)}</small></div><button class="btn solid sm" data-reorder="${o.no}">${T("Pedir de nuevo","Order again")}</button></div>`;
}
function renderAcct(){
  const u=user(); let h="";
  if(av.view==="start") h=`<h3>${T("Entra o crea tu cuenta","Sign in or create an account")}</h3>
    <p class="muted" style="margin:-.6rem 0 1.2rem">${T("Guarda tus pedidos, pide de nuevo en un toque y junta coronas del Club del Rey.","Save your orders, reorder in one tap and collect Club del Rey crowns.")}</p>
    <label class="fl"><span>${T("Tu teléfono","Your phone")}</span><input name="aphone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(305) 555-0123" value="${esc(av.phone||"")}"></label>
    <button class="btn solid wide" data-a="send" style="margin-top:1rem">${T("Enviarme un código por texto","Text me a code")} <span class="arr">→</span></button>
    <div class="or"><span>${T("o","or")}</span></div>
    <button class="sso apple" data-a="sso" data-p="apple"><svg viewBox="0 0 24 24" width="18"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.8-1-2.8-4.2zM14 5.3c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>${T("Continuar con Apple","Continue with Apple")}</button>
    <button class="sso google" data-a="sso" data-p="google"><svg viewBox="0 0 24 24" width="18"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 01-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0012 22z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 010-3.8V7.1H2.7a10 10 0 000 9.2z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0012 2 10 10 0 002.7 7.1l3.5 2.7C7 7.6 9.3 5.9 12 5.9z"/></svg>${T("Continuar con Google","Continue with Google")}</button>
    <p class="err" hidden></p>`;
  if(av.view==="code") h=`<button class="lk back-lk" data-a="back">← ${T("Cambiar número","Change number")}</button>
    <h3>${T("Escribe el código","Enter the code")}</h3>
    <p class="muted" style="margin:-.6rem 0 1.2rem">${T("Te lo mandamos por texto al","We texted it to")} <b>${esc(av.phone)}</b></p>
    <div class="otp">${[0,1,2,3,4,5].map(i=>`<input inputmode="numeric" maxlength="1" data-otp="${i}" aria-label="${i+1}">`).join("")}</div>
    <p class="demo-note">${T("Demo: escribe cualquier código de 6 dígitos.","Demo: type any 6-digit code.")}</p><p class="err" hidden></p>`;
  if(av.view==="name") h=`<h3>${av.sso?T("¡Conectado! ✓","Connected! ✓"):T("¡Bienvenido! 👑","Welcome! 👑")}</h3>
    <p class="muted" style="margin:-.6rem 0 1.2rem">${T("Solo falta tu nombre"+(av.sso?" y teléfono para avisarte cuando esté listo tu pedido.":"."),"Just your name"+(av.sso?" and phone so we can text you when your order is ready.":"."))}</p>
    <div class="fields"><label class="fl full"><span>${T("Nombre","Name")}</span><input name="aname" autocomplete="name"></label>
    ${av.sso?`<label class="fl full"><span>${T("Teléfono","Phone")}</span><input name="aphone2" type="tel" inputmode="tel" placeholder="(305) 555-0123"></label>`:""}</div>
    <button class="btn solid wide" data-a="finish" style="margin-top:1.2rem">${T("Crear mi cuenta","Create my account")} <span class="arr">→</span></button><p class="err" hidden></p>`;
  if(av.view==="home"&&u){ const c=club(),os=orders();
    h=`<div class="prof"><span class="avatar">${esc(u.name.trim()[0]||"?").toUpperCase()}</span><div><h3>${T("Hola, ","Hi, ")}${esc(u.name.split(" ")[0])} 👋</h3><small>${esc(u.phone)}${u.method!=="phone"?` · ${u.method==="apple"?"Apple":"Google"}`:""}</small></div></div>
    <div class="club-strip">👑 Club del Rey <b>${c?c.stamps:0}/${D.CLUB.goal}</b><div class="crowns sm">${crownsHTML(c?c.stamps:0)}</div></div>
    <h4 class="sub">${T("Tus pedidos","Your orders")}</h4>
    ${os.length?`<div class="olist2">${os.map(orderCard).join("")}</div>`:`<p class="muted">${T("Todavía no tienes pedidos. ¡El primero suma una corona!","No orders yet. Your first one earns a crown!")}</p><a class="btn solid sm" href="ordenar/" style="margin-top:.8rem">${T("Ordenar ahora","Order now")} <span class="arr">→</span></a>`}
    <button class="lk signout" data-a="out">${T("Cerrar sesión","Sign out")}</button>`;}
  as.innerHTML=`<button class="cz-x" aria-label="Cerrar">✕</button><div class="acct-body">${h}</div>`;
  const first=$("input",as); if(first&&av.view!=="home") setTimeout(()=>first.focus(),350);
}
function finishLogin(u){
  ls.set("lc-user",u);
  let c=club(); if(!c){c={name:u.name,phone:u.phone,stamps:0,sms:false};ls.set("lc-club",c)}
  // attach orders placed as guest
  av={view:"home"}; renderAcct(); renderAcctBtn(); renderClub(); renderReorder();
  showToast(T(`¡Listo, ${u.name.split(" ")[0]}! Sesión iniciada 👑`,`You're in, ${u.name.split(" ")[0]}! 👑`));
}
as.addEventListener("click",e=>{
  if(e.target.closest(".cz-x")){closeAcct();return}
  const b=e.target.closest("[data-a]"); const ro=e.target.closest("[data-reorder]");
  if(ro){reorder(ro.dataset.reorder);closeAcct();return}
  if(!b) return; const err=$(".err",as);
  const a=b.dataset.a;
  if(a==="send"){const ph=$("[name=aphone]",as).value;if(ph.replace(/\D/g,"").length<10){err.hidden=false;err.textContent=T("Escribe un teléfono de 10 dígitos.","Enter a 10-digit phone.");return}av={view:"code",phone:ph};renderAcct();return}
  if(a==="back"){av={view:"start",phone:av.phone};renderAcct();return}
  if(a==="sso"){av={view:"name",sso:b.dataset.p};renderAcct();return}
  if(a==="finish"){const n=$("[name=aname]",as).value.trim();const ph=av.sso?$("[name=aphone2]",as).value:av.phone;
    if(!n){err.hidden=false;err.textContent=T("Escribe tu nombre.","Enter your name.");return}
    if(ph.replace(/\D/g,"").length<10){err.hidden=false;err.textContent=T("Escribe un teléfono de 10 dígitos.","Enter a 10-digit phone.");return}
    finishLogin({name:n,phone:fmtPhone(ph),method:av.sso||"phone"});return}
  if(a==="out"){try{localStorage.removeItem("lc-user")}catch(_){}closeAcct();renderAcctBtn();showToast(T("Sesión cerrada","Signed out"));return}
});
as.addEventListener("input",e=>{
  const t=e.target;
  if(t.name==="aphone"||t.name==="aphone2"){t.value=fmtPhone(t.value);return}
  if(t.dataset.otp!=null){t.value=t.value.replace(/\D/g,"").slice(-1);const all=$$("[data-otp]",as);
    if(t.value&&+t.dataset.otp<5)all[+t.dataset.otp+1].focus();
    const code=all.map(i=>i.value).join("");
    if(code.length===6){ $(".otp",as).classList.add("ok"); setTimeout(()=>{ const known=user(); const prev=ls.get("lc-known-"+av.phone.replace(/\D/g,""),null);
      if(prev) finishLogin(prev); else {av={view:"name",phone:av.phone};renderAcct();} },450); }}
});
as.addEventListener("keydown",e=>{const t=e.target;if(t.dataset&&t.dataset.otp!=null&&e.key==="Backspace"&&!t.value&&+t.dataset.otp>0){$$("[data-otp]",as)[+t.dataset.otp-1].focus()}});
as.addEventListener("paste",e=>{const t=e.target;if(t.dataset&&t.dataset.otp!=null){const v=(e.clipboardData.getData("text")||"").replace(/\D/g,"").slice(0,6);if(v.length){e.preventDefault();$$("[data-otp]",as).forEach((i,k)=>i.value=v[k]||"");$$("[data-otp]",as)[Math.min(5,v.length-1)].dispatchEvent(new Event("input",{bubbles:true}))}}});

function reorder(no){
  const o=orders().find(x=>x.no===no); if(!o) return;
  let added=0,skipped=0;
  o.lines.forEach(l=>{const it=ITEM(l.id); if(it&&avail(it).ok){cart.push({uid:Date.now().toString(36)+Math.random().toString(36).slice(2,5),id:l.id,qty:l.qty,sel:JSON.parse(JSON.stringify(l.sel||{})),note:l.note||""});added++} else skipped++;});
  save(); bump();
  showToast(skipped?T(`Agregamos ${added}. ${skipped} no está disponible hoy.`,`Added ${added}. ${skipped} not available today.`):T("¡Tu pedido de siempre está en la cajita! 👑","Your usual is in the cajita! 👑"));
  setTimeout(openDrawer,500);
}
function renderAcctBtn(){
  const u=user();
  $$("[data-acct]").forEach(b=>{b.innerHTML=u?`<span class="avatar sm">${esc(u.name.trim()[0]||"?").toUpperCase()}</span><span class="acct-lbl">${esc(u.name.split(" ")[0])}</span>`:`<svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="acct-lbl">${T("Entrar","Sign in")}</span>`;});
}
function renderReorder(){
  const root=$("#reorderRoot"); if(!root) return;
  const os=orders().slice(0,3);
  if(!os.length){root.innerHTML="";return}
  root.innerHTML=`<div class="reorder reveal in"><div class="ro-head"><h3>${T("Pide de nuevo","Order again")} ⚡</h3><small>${T("Tus últimos pedidos, en un toque","Your recent orders, in one tap")}</small></div><div class="olist2">${os.map(orderCard).join("")}</div></div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-acct]");if(b){e.preventDefault();openAcct()}const r=e.target.closest("#reorderRoot [data-reorder], .drawer [data-reorder]");if(r){reorder(r.dataset.reorder)}});

/* ---------------- Page renderers ---------------- */
function cardHTML(it){
  const a=avail(it);
  return `<article class="ocard reveal ${a.ok?"":"unavail"}" data-id="${it.id}" tabindex="0">
    <div class="om">${media(it)}${it.tag?`<span class="otag">${esc(N(it.tag))}</span>`:""}${a.label?`<span class="avail ${a.ok?"":"out"}">${esc(a.label)}</span>`:""}</div>
    <div class="ob"><h3>${esc(N(it))}</h3><p>${esc(L()==="en"?it.den:it.des)}</p>
    <div class="of"><b>${money(it.price)}</b><button class="add" data-add="${it.id}" aria-label="${T("Agregar","Add")} ${esc(N(it))}" ${a.ok?"":"disabled"}>+</button></div></div></article>`;
}
function renderOrderPage(){
  const root=$("#orderRoot"); if(!root) return;
  const pop=D.ITEMS.filter(i=>i.tag&&i.tag.es==="Más pedido");
  root.innerHTML=(pop.length?`<div class="cat popular"><div class="cat-head reveal"><h2>🔥 ${T("Los más pedidos","Most ordered")}</h2></div><div class="ogrid">${pop.map(cardHTML).join("")}</div></div>`:"")+D.CATS.map(c=>`<div class="cat" id="o-${c.id}"><div class="cat-head reveal"><div class="ico">${art(c.art)}</div><h2>${esc(N(c))}</h2><span class="note">${esc(N(c.note))}</span></div>
    <div class="ogrid">${D.ITEMS.filter(i=>i.cat===c.id).map(cardHTML).join("")}</div></div>`).join("");
}
function renderMenuPage(){
  const root=$("#menuRoot"); if(!root) return;
  root.innerHTML=D.CATS.map(c=>{
    const items=D.ITEMS.filter(i=>i.cat===c.id);
    const feat=items.filter(i=>i.img), rest=items.filter(i=>!i.img);
    return `<div class="cat" id="${c.id}"><div class="cat-head reveal"><div class="ico">${art(c.art)}</div><h2>${esc(N(c))}</h2><span class="note">${esc(N(c.note))}</span></div>
    ${feat.length?`<div class="specials" style="margin-bottom:1.5rem">${feat.map((it,k)=>`<div class="special photo reveal ${k?"d1":""}" data-id="${it.id}"><img src="${it.img}" alt="${esc(N(it))}" loading="lazy"><div class="sp-in">${it.tag?`<span class="otag">${esc(N(it.tag))}</span>`:""}<h3>${esc(N(it))}</h3><p>${esc(L()==="en"?it.den:it.des)}</p><div class="sp-f"><span class="p">${money(it.price)}</span><button class="btn light sm" data-add="${it.id}">${T("Ordenar","Order")} <span class="arr">→</span></button></div></div></div>`).join("")}</div>`:""}
    <div class="items">${rest.map((it,k)=>{const a=avail(it);return `<div class="item reveal ${k%2?"d1":""} ${a.ok?"":"unavail"}" data-id="${it.id}"><h3>${esc(N(it))}${it.tag?` <span class="tag">${esc(N(it.tag))}</span>`:""}${a.label?` <span class="tag ${a.ok?"lim":"out"}">${esc(a.label)}</span>`:""}</h3><span class="p">${money(it.price)}</span><p>${esc(L()==="en"?it.den:it.des)}</p>${a.ok?`<button class="add-mini" data-add="${it.id}">+ ${T("Agregar","Add")}</button>`:""}</div>`}).join("")}</div></div>`}).join("");
}
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-add]"); if(a){e.preventDefault();openCz(a.dataset.add,a);return}
  const card=e.target.closest(".ocard"); if(card){openCz(card.dataset.id,$(".add",card));return}
  const o=e.target.closest("[data-open-cart]"); if(o){e.preventDefault();openDrawer()}
});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("ocard"))openCz(e.target.dataset.id,$(".add",e.target))});

function renderAll(){renderOrderPage();renderMenuPage();renderClub();renderReorder();renderAcctBtn();renderFab();renderDrawer();if(acc.classList.contains("open"))renderAcct();
  if(window.LC_observe) window.LC_observe(); if(window.LC_refreshTabs) window.LC_refreshTabs();}
renderAll();
document.addEventListener("lc:lang",()=>{renderAll(); if(cz.classList.contains("open"))renderCz(); if(co.classList.contains("open")&&ck&&ck.step<4)renderCo();});
window.LC_openCart=openDrawer;
})();
