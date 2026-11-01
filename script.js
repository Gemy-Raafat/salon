const WA = "https://wa.me/201018206041?text=" + encodeURIComponent("السلام عليكم، عايزة أحجز في كوافير لمسة حرير");
document.querySelectorAll("[data-wa]").forEach(a => a.href = WA);
const $ = id => document.getElementById(id);
const PER_PAGE = 10; // عدد الخدمات في كل صفحة

const ICON = {
  thread:'<svg viewBox="0 0 64 64"><path d="M14 54 46 10"/><ellipse cx="44" cy="13" rx="3" ry="6" transform="rotate(36 44 13)"/><path d="M16 50c-8-4 2-12 10-8s2 12 10 8 2-12 10-8"/></svg>',
  wax:'<svg viewBox="0 0 64 64"><path d="M32 8c10 14 16 22 16 31a16 16 0 0 1-32 0c0-9 6-17 16-31z"/><path d="M24 40a8 8 0 0 0 8 8"/></svg>',
  face:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="12"/><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M13 51l6-6M45 19l6-6"/></svg>',
  body:'<svg viewBox="0 0 64 64"><path d="M24 8c-4 10 0 16 2 22-6 4-10 12-8 26h28c2-14-2-22-8-26 2-6 6-12 2-22"/><path d="M24 8h16"/></svg>',
  hair:'<svg viewBox="0 0 64 64"><circle cx="16" cy="48" r="7"/><circle cx="16" cy="22" r="7"/><path d="M21 27 54 52M21 43 54 12"/></svg>',
  skin:'<svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="9"/><circle cx="20" cy="30" r="9"/><circle cx="44" cy="30" r="9"/><circle cx="25" cy="40" r="9"/><circle cx="39" cy="40" r="9"/><circle cx="32" cy="31" r="4"/><path d="M32 44v14"/></svg>',
  offers:'<svg viewBox="0 0 64 64"><path d="M32 6l7 16 17 2-13 12 4 17-15-9-15 9 4-17L8 24l17-2z"/></svg>'
};
// الصور: ضع صورة كل خدمة في مجلد image باسم الخدمة (مثال: wax-neck.jpg)
// ولو مش موجودة بيجرب صورة القسم (مثال: wax.jpg) ولو مش موجودة تظهر الرسمة
const CATS = {
  threading:{t:"الفتلة", k:"thread", c:["#c4566e","#6e1f36"]},
  wax:{t:"الشمع", k:"wax", c:["#e0a64f","#7a4a14"]},
  face:{t:"الوش", k:"face", c:["#d5a34c","#5c3b0f"]},
  hair:{t:"الشعر", k:"hair", c:["#b9668a","#4d1a38"]},
  body:{t:"الجسم", k:"body", c:["#cf8a5e","#6a2e22"]},
  skin:{t:"البشرة", k:"skin", c:["#e49aa4","#8c3a4b"]},
  offers:{t:"العروض", k:"offers", c:["#d9a43a","#6a3a0c"]}
};
// [id, القسم, الاسم, السعر بالجنيه (null = حسب الطول), بادئة, السعر القديم]
const ITEMS = [
  ["offer-full-body","offers","عرض جسم كامل",400,"",450],
  ["offer-hands-legs","offers","عرض إيد ورجل",180],
  ["threading-brows","threading","حواجب فتلة",20],
  ["threading-face","threading","وش فتلة وحواجب",50],
  ["wax-face","wax","وش شمع بس",50],
  ["wax-face-brows","wax","وش شمع وحواجب",70],
  ["wax-neck","wax","رقبة شمع",30],
  ["face-shaving","face","وش شيفنج",70],
  ["face-brow-dye","face","صبغة حواجب",20],
  ["face-mustache","face","شنب",20],
  ["hair-trim","hair","قص أطراف",20],
  ["hair-blowdry","hair","استشوار",100],
  ["hair-iron","hair","مكواة",null],
  ["hair-blowdry-iron","hair","استشوار ومكواة",150],
  ["hair-copper-half","hair","نص شعر خصل نحاسي",200],
  ["hair-copper-full","hair","شعر كامل خصل نحاسي",300,"يبدأ من"],
  ["body-arm-full","body","إيد كاملة",80],
  ["body-leg-full","body","رجل كاملة",120],
  ["body-arm-half","body","نص إيد",60],
  ["body-leg-half","body","نص رجل",80],
  ["body-back","body","ضهر بس",60],
  ["body-belly","body","بطن بس",50],
  ["skin-clean","skin","تنظيف بشرة عادي",70],
  ["skin-derma","skin","تنظيف بشرة بالديرما بلاننج",100]
].map(([id,cat,name,n,pre="",old])=>({id,cat,name,n,pre,old}));

const RANGES = {all:["الكل",()=>true], lt50:["أقل من 50 جنيه",n=>n!=null&&n<50], mid:["من 50 إلى 100 جنيه",n=>n!=null&&n>=50&&n<=100], gt100:["أكثر من 100 جنيه",n=>n!=null&&n>100]};
const norm = s => s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").trim();
const S = {cat:"all", range:"all", sort:"rel", q:"", page:1};

const catOpts = [["all","كل الأقسام"],...Object.entries(CATS).map(([k,v])=>[k,v.t])];
$("catSel").innerHTML = catOpts.map(([k,t])=>`<option value="${k}">${t}</option>`).join("");
$("subnav").innerHTML = catOpts.map(([k,t])=>`<button type="button" data-cat="${k}">${t}</button>`).join("");

function matches(i, skip){
  return (skip==="cat"||S.cat==="all"||i.cat===S.cat) && (skip==="range"||RANGES[S.range][1](i.n)) &&
    (!S.q || norm(i.name+" "+CATS[i.cat].t).includes(S.q));
}
function sideRender(){
  $("fCat").innerHTML = catOpts.map(([k,t])=>{
    const c = ITEMS.filter(i=>matches(i,"cat")&&(k==="all"||i.cat===k)).length;
    return `<label><input type="radio" name="fc" value="${k}" ${S.cat===k?"checked":""}>${t}<small>${c}</small></label>`}).join("");
  $("fPrice").innerHTML = Object.entries(RANGES).map(([k,[t]])=>`<label><input type="radio" name="fp" value="${k}" ${S.range===k?"checked":""}>${t}</label>`).join("");
  $("catSel").value = S.cat;
  document.querySelectorAll("#subnav button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.cat===S.cat));
}
window.imgFallback = img => { if(!img.dataset.s){ img.dataset.s=1; img.src="image/"+img.dataset.cat+".jpg"; } else img.remove(); };

function render(){
  let list = ITEMS.filter(i=>matches(i));
  if(S.sort!=="rel"){ const big = S.sort==="asc"?1e9:-1; list.sort((a,b)=>{const x=a.n??big, y=b.n??big; return S.sort==="asc"?x-y:y-x;}); }
  const pages = Math.max(1, Math.ceil(list.length/PER_PAGE));
  S.page = Math.min(S.page, pages);
  const from = (S.page-1)*PER_PAGE, slice = list.slice(from, from+PER_PAGE);
  $("count").textContent = list.length ? `${from+1}-${from+slice.length} من ${list.length} نتيجة` : "لا توجد نتائج";
  $("empty").hidden = list.length>0;
  $("grid").innerHTML = slice.map(i=>{
    const c = CATS[i.cat], msg = encodeURIComponent(`السلام عليكم، عايزة أحجز ${i.name} في كوافير لمسة حرير`);
    const price = i.n==null ? `<span class="t">حسب الطول</span>` :
      `${i.pre?`<span class="t">${i.pre}</span>`:""}<span class="p">${i.n}</span><span class="u">جنيه</span>${i.old?`<s>${i.old} جنيه</s>`:""}`;
    return `<article class="card">
      <div class="art" style="--c1:${c.c[0]};--c2:${c.c[1]}">${i.cat==="offers"?'<span class="badge">عرض</span>':""}${ICON[c.k]}<img src="image/${i.id}.jpg" alt="${i.name}" data-cat="${i.cat}" loading="lazy" onerror="imgFallback(this)"></div>
      <div class="info"><h3>${i.name}</h3><span class="c">${c.t}</span><div class="price">${price}</div>
      <a class="btn" href="https://wa.me/201018206041?text=${msg}" target="_blank" rel="noopener">احجزي الآن</a></div></article>`}).join("");
  $("pager").innerHTML = pages<2 ? "" :
    `<button type="button" data-p="${S.page-1}" ${S.page===1?"disabled":""}>السابق</button>`+
    Array.from({length:pages},(_,n)=>`<button type="button" data-p="${n+1}" ${n+1===S.page?'aria-current="page"':""}>${n+1}</button>`).join("")+
    `<button type="button" data-p="${S.page+1}" ${S.page===pages?"disabled":""}>التالي</button>`;
  sideRender();
}
const go = () => { S.page=1; render(); };
$("searchForm").onsubmit = e => { e.preventDefault(); S.q=norm($("q").value); S.cat=$("catSel").value; go(); $("top").scrollIntoView({behavior:"smooth"}); };
$("q").oninput = e => { S.q=norm(e.target.value); go(); };
$("catSel").onchange = e => { S.cat=e.target.value; go(); };
$("subnav").onclick = e => { const b=e.target.closest("button"); if(b){ S.cat=b.dataset.cat; go(); } };
$("fCat").onchange = e => { S.cat=e.target.value; go(); };
$("fPrice").onchange = e => { S.range=e.target.value; go(); };
$("sort").onchange = e => { S.sort=e.target.value; go(); };
$("reset").onclick = () => { Object.assign(S,{cat:"all",range:"all",sort:"rel",q:""}); $("q").value=""; $("sort").value="rel"; go(); };
$("pager").onclick = e => { const b=e.target.closest("button"); if(!b||b.disabled) return; S.page=+b.dataset.p; render(); document.querySelector(".bar").scrollIntoView({behavior:"smooth"}); };
document.querySelectorAll("[data-offer]").forEach(t => t.onclick = () => { S.cat="offers"; S.q=""; $("q").value=""; go(); document.querySelector(".shop").scrollIntoView({behavior:"smooth"}); });
$("filterBtn").onclick = () => $("side").classList.toggle("open");
render();
