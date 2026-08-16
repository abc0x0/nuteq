(() => {
"use strict";

const DB = window.SMAE_DATA || {};
const foods = DB.alimentos || [];
const LS_MEALS = "miniSMAE_v4_meals";
let meal = [];
let selectedMealFood = null;
let substituteIndex = null;
let substitutionHistory = [];
let challengeSnapshot = null;
let activeValidationView = "correcciones";

const $ = id => document.getElementById(id);
const fmt = v => v == null || Number.isNaN(Number(v)) ? "ND" : Number(v).toLocaleString("es-MX",{maximumFractionDigits:2});
const nval = (f,k) => f?.nutrimentos?.[k]?.valor ?? null;
const norm = s => String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const esc = s => String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const isEstimated = o => o?.estado === "estimado" || o?.correccion?.tipo === "estimacion_por_coherencia";

function portion(f, eq=1){
  const p=f?.porcion||{};
  const base=p.cantidad;
  if(base!=null) return `${fmt(base*eq)} ${p.unidad||""}`.trim();
  return `${p.cantidad_fuente||""} ${p.unidad||""}`.trim();
}
function searchFoods(q,limit=12){
  q=norm(q); if(q.length<2) return [];
  const a=[],b=[];
  for(const f of foods){
    const n=f.nombre_busqueda||norm(f.nombre);
    if(n.startsWith(q)) a.push(f); else if(n.includes(q)) b.push(f);
  }
  return a.concat(b).slice(0,limit);
}
function renderSuggestions(input, box, onPick){
  const matches=searchFoods(input.value);
  box.innerHTML="";
  if(!matches.length){box.hidden=true;return}
  for(const f of matches){
    const b=document.createElement("button");
    b.type="button"; b.className="suggestion";
    b.innerHTML=`<span><strong>${esc(f.nombre)}</strong><br><small>${esc(portion(f))}</small></span><small>${esc(f.grupo)}</small>`;
    b.onclick=()=>{box.hidden=true;input.value=f.nombre;onPick(f)};
    box.appendChild(b);
  }
  box.hidden=false;
}

/* ---------- Meal builder ---------- */
function bindMealSearch(){
  const input=$("mealFoodInput"), box=$("mealSuggestions");
  input.addEventListener("input",()=>renderSuggestions(input,box,f=>selectedMealFood=f));
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      const f=searchFoods(input.value,1)[0];
      if(f){selectedMealFood=f;input.value=f.nombre;box.hidden=true}
    }
    if(e.key==="Escape") box.hidden=true;
  });
}
function addMealItem(){
  if(!selectedMealFood){
    const f=searchFoods($("mealFoodInput").value,1)[0];
    if(f) selectedMealFood=f;
  }
  if(!selectedMealFood){alert("Selecciona un alimento de la lista.");return}
  const eq=Number($("mealEqCount").value);
  if(!(eq>0)){alert("Indica un número de equivalentes mayor que cero.");return}
  const existing=meal.find(x=>x.foodId===selectedMealFood.id);
  if(existing) existing.eq+=eq;
  else meal.push({foodId:selectedMealFood.id,eq});
  $("mealFoodInput").value=""; selectedMealFood=null; $("mealEqCount").value="1";
  renderMeal();
}
function foodById(id){return foods.find(f=>f.id===id)}
function mealTotals(source=meal){
  const keys=["energia","proteina","lipidos","hidratos_carbono","fibra","sodio","potasio","calcio"];
  const totals=Object.fromEntries(keys.map(k=>[k,0]));
  const known=Object.fromEntries(keys.map(k=>[k,false]));
  for(const item of source){
    const f=foodById(item.foodId); if(!f) continue;
    for(const k of keys){
      const v=nval(f,k);
      if(v!=null){totals[k]+=v*item.eq;known[k]=true}
    }
  }
  return {totals,known};
}
function groupTotals(source=meal){
  const m=new Map();
  for(const item of source){
    const f=foodById(item.foodId); if(!f) continue;
    const key=f.grupo_codigo;
    if(!m.has(key)) m.set(key,{name:f.grupo,eq:0});
    m.get(key).eq+=item.eq;
  }
  return m;
}
function renderMeal(){
  const c=$("mealItems"); c.innerHTML="";
  $("mealItemCount").textContent=meal.length;
  $("mealEmpty").hidden=meal.length>0;
  meal.forEach((item,index)=>{
    const f=foodById(item.foodId); if(!f)return;
    const d=document.createElement("div"); d.className="v4-meal-item";
    d.innerHTML=`
      <div>
        <h3>${esc(f.nombre)}</h3>
        <div class="v4-meal-meta">${esc(f.grupo)} · ${esc(portion(f,item.eq))}</div>
        <div class="v4-eq-control"><label>Equiv.</label><input type="number" min="0.25" step="0.25" value="${item.eq}" data-meal-eq="${index}"></div>
      </div>
      <div class="v4-meal-actions">
        <button class="v4-mini-btn" data-substitute="${index}">⇄ Sustituir</button>
        <button class="v4-mini-btn danger" data-remove="${index}">Eliminar</button>
      </div>`;
    c.appendChild(d);
  });
  c.querySelectorAll("[data-meal-eq]").forEach(inp=>inp.onchange=()=>{
    const i=Number(inp.dataset.mealEq),v=Number(inp.value);
    if(v>0){meal[i].eq=v;renderMeal()}
  });
  c.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{meal.splice(Number(b.dataset.remove),1);renderMeal()});
  c.querySelectorAll("[data-substitute]").forEach(b=>b.onclick=()=>openSubstitute(Number(b.dataset.substitute)));
  renderMealSummary();
}
function renderMealSummary(){
  const keys=[["energia","Energía","kcal"],["proteina","Proteína","g"],["lipidos","Lípidos","g"],["hidratos_carbono","Hidratos de carbono","g"],["fibra","Fibra","g"],["sodio","Sodio","mg"]];
  const {totals,known}=mealTotals();
  $("mealTotals").innerHTML=keys.map(([k,label,unit])=>`<div class="nutrient"><div class="lab">${label}</div><div class="val">${known[k]?fmt(totals[k]):"ND"} ${known[k]?unit:""}</div></div>`).join("");
  const groups=groupTotals();
  $("mealGroups").innerHTML=[...groups.values()].map(g=>`<div class="v4-group-row"><span>${esc(g.name)}</span><strong>${fmt(g.eq)} eq</strong></div>`).join("");
  if(!meal.length){$("mealAnalysis").textContent="Agrega alimentos para obtener un análisis.";return}
  const protein=meal.map(i=>({f:foodById(i.foodId),v:(nval(foodById(i.foodId),"proteina")??-1)*i.eq})).sort((a,b)=>b.v-a.v)[0];
  const sodium=meal.map(i=>({f:foodById(i.foodId),v:(nval(foodById(i.foodId),"sodio")??-1)*i.eq})).sort((a,b)=>b.v-a.v)[0];
  let txt=`La comida contiene ${fmt([...groups.values()].reduce((s,g)=>s+g.eq,0))} equivalentes distribuidos en ${groups.size} grupos/subgrupos.`;
  if(protein?.v>=0) txt+=` Mayor aporte de proteína: ${protein.f.nombre}.`;
  if(sodium?.v>=0) txt+=` Mayor aporte de sodio: ${sodium.f.nombre}.`;
  $("mealAnalysis").textContent=txt;
}
function openSubstitute(index){
  substituteIndex=index;
  const item=meal[index],f=foodById(item.foodId); if(!f)return;
  $("substituteTitle").textContent=`Sustituir ${f.nombre}`;
  $("substituteHelp").textContent=`Se conservarán ${fmt(item.eq)} equivalentes del grupo ${f.grupo}.`;
  const options=foods.filter(x=>x.id!==f.id&&x.grupo_codigo===f.grupo_codigo)
    .sort((a,b)=>{
      const t=nval(f,"energia"),aa=nval(a,"energia"),bb=nval(b,"energia");
      if(t!=null&&aa!=null&&bb!=null)return Math.abs(aa-t)-Math.abs(bb-t);
      return a.nombre.localeCompare(b.nombre,"es");
    }).slice(0,30);
  $("substituteOptions").innerHTML="";
  options.forEach(opt=>{
    const b=document.createElement("button");b.className="v4-sub-option";
    b.innerHTML=`<strong>${esc(opt.nombre)}</strong><small>${esc(portion(opt,item.eq))} · ${nval(opt,"energia")!=null?fmt(nval(opt,"energia")*item.eq)+" kcal":"energía ND"}</small>`;
    b.onclick=()=>applySubstitution(opt);
    $("substituteOptions").appendChild(b);
  });
  $("substituteModal").hidden=false;
}
function applySubstitution(newFood){
  if(substituteIndex==null)return;
  const item=meal[substituteIndex],oldFood=foodById(item.foodId),eq=item.eq;
  const before={energy:(nval(oldFood,"energia")??0)*eq,sodium:(nval(oldFood,"sodio")??0)*eq};
  const after={energy:(nval(newFood,"energia")??0)*eq,sodium:(nval(newFood,"sodio")??0)*eq};
  meal[substituteIndex]={foodId:newFood.id,eq};
  substitutionHistory.unshift({
    time:new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),
    oldName:oldFood.nombre,newName:newFood.nombre,eq,group:oldFood.grupo,
    deltaEnergy:after.energy-before.energy,deltaSodium:after.sodium-before.sodium
  });
  $("substituteModal").hidden=true; substituteIndex=null;
  renderMeal();renderSubHistory();
}
function renderSubHistory(){
  const c=$("substitutionHistory");
  if(!substitutionHistory.length){c.innerHTML='<p class="muted">Todavía no se han realizado sustituciones.</p>';return}
  c.innerHTML=substitutionHistory.map(h=>`<div class="v4-history-entry"><strong>${esc(h.oldName)} → ${esc(h.newName)}</strong><br>${fmt(h.eq)} equivalentes · ${esc(h.group)} · Δ energía ${h.deltaEnergy>=0?"+":""}${fmt(h.deltaEnergy)} kcal · Δ sodio ${h.deltaSodium>=0?"+":""}${fmt(h.deltaSodium)} mg <span class="muted">(${h.time})</span></div>`).join("");
}
function getSavedMeals(){try{return JSON.parse(localStorage.getItem(LS_MEALS)||"[]")}catch{return[]}}
function saveMeals(x){localStorage.setItem(LS_MEALS,JSON.stringify(x))}
function saveCurrentMeal(){
  if(!meal.length){alert("La comida está vacía.");return}
  const name=$("mealName").value.trim()||`Comida ${new Date().toLocaleDateString("es-MX")}`;
  const arr=getSavedMeals();
  arr.unshift({id:Date.now(),name,items:meal.map(x=>({...x})),date:new Date().toISOString()});
  saveMeals(arr.slice(0,20));$("mealName").value="";renderSavedMeals();
}
function renderSavedMeals(){
  const c=$("savedMeals"),arr=getSavedMeals();c.innerHTML="";
  if(!arr.length){c.innerHTML='<p class="muted">No hay comidas guardadas.</p>';return}
  arr.forEach(m=>{
    const b=document.createElement("div");b.className="sub";
    b.innerHTML=`<strong>${esc(m.name)}</strong><small>${m.items.length} alimentos guardados</small><span class="kcal"><button class="v4-mini-btn" data-load="${m.id}">Cargar</button></span>`;
    c.appendChild(b);
  });
  c.querySelectorAll("[data-load]").forEach(b=>b.onclick=()=>{
    const m=arr.find(x=>x.id===Number(b.dataset.load)); if(m){meal=m.items.map(x=>({...x}));renderMeal()}
  });
}
function startChallenge(){
  if(!meal.length){alert("Construye primero una comida.");return}
  challengeSnapshot=meal.map(x=>({...x}));
  $("evaluateChallengeBtn").disabled=false;
  const s=mealTotals(challengeSnapshot).totals.sodio;
  $("challengeResult").hidden=false;
  $("challengeResult").innerHTML=`<h3>Reto iniciado</h3><p>Sodio inicial: <strong>${fmt(s)} mg</strong>. Realiza sustituciones y después evalúa.</p>`;
}
function evaluateChallenge(){
  if(!challengeSnapshot)return;
  const before=mealTotals(challengeSnapshot).totals.sodio,after=mealTotals().totals.sodio;
  const gb=groupTotals(challengeSnapshot),ga=groupTotals();
  const keys=new Set([...gb.keys(),...ga.keys()]);
  let same=true;
  keys.forEach(k=>{if(Math.abs((gb.get(k)?.eq||0)-(ga.get(k)?.eq||0))>0.001)same=false});
  const delta=after-before,pct=before?delta/before*100:0;
  const ok=same&&after<before;
  $("challengeResult").hidden=false;
  $("challengeResult").innerHTML=`<h3>${ok?"✓ Objetivo cumplido":"Resultado del reto"}</h3><p>Equivalentes por grupo: <strong>${same?"conservados":"modificados"}</strong>.</p><p>Sodio: ${fmt(before)} → ${fmt(after)} mg (${delta>=0?"+":""}${fmt(pct)}%).</p>${ok?"<p>Reduciste el sodio sin cambiar los equivalentes por grupo.</p>":"<p>Intenta reducir el sodio conservando los equivalentes por grupo.</p>"}`;
}

/* ---------- Validation / corrections ---------- */
function walkCorrections(obj,path=[],out=[]){
  if(!obj||typeof obj!=="object")return out;
  if(obj.correccion && typeof obj.correccion==="object") out.push({path:[...path],correction:obj.correccion,container:obj});
  for(const [k,v] of Object.entries(obj)){
    if(k==="correccion"||k==="fuente"||k==="celdas_fuente")continue;
    if(v&&typeof v==="object")walkCorrections(v,[...path,k],out);
  }
  return out;
}
function collectValidation(){
  const confirmed=[],estimated=[],warnings=[];
  for(const f of foods){
    const cs=walkCorrections({porcion:f.porcion,nutrimentos:f.nutrimentos});
    cs.forEach(x=>{
      const field=x.path[x.path.length-1]||"dato";
      const rec={food:f,field,correction:x.correction,container:x.container};
      if(x.correction.tipo==="estimacion_por_coherencia")estimated.push(rec);else confirmed.push(rec);
    });
    const ws=f.validacion_semantica?.advertencias||[];
    ws.forEach(w=>warnings.push({food:f,warning:w}));
  }
  return {confirmed,estimated,warnings};
}
function renderValidationSummary(){
  const {confirmed,estimated,warnings}=collectValidation();
  const selenium=confirmed.filter(x=>x.field==="selenio"&&x.correction?.unidad_original==="mg"&&x.correction?.unidad_normalizada==="µg");
  $("validationSummary").innerHTML=`
    <div class="v4-stat"><strong>${confirmed.length}</strong><span>correcciones registradas</span></div>
    <div class="v4-stat"><strong>${selenium.length}</strong><span>normalizaciones de selenio</span></div>
    <div class="v4-stat"><strong>${estimated.length}</strong><span>valores estimados</span></div>
    <div class="v4-stat"><strong>${warnings.length}</strong><span>advertencias activas</span></div>`;
}
function correctionValue(rec){
  const c=rec.correction;
  const old=c.valor_original ?? c.unidad_original ?? rec.container.valor_fuente ?? "—";
  const neu=c.valor_normalizado ?? c.valor_estimado ?? c.unidad_normalizada ?? rec.container.valor ?? "—";
  const unit=c.unidad||rec.container.unidad||"";
  return `${old}${unit?" "+unit:""} → ${neu}${unit?" "+unit:""}`;
}
function renderValidationContent(){
  const {confirmed,estimated,warnings}=collectValidation();
  const box=$("validationContent");
  if(activeValidationView==="correcciones"){
    const selenium=confirmed.filter(x=>x.field==="selenio"&&x.correction?.unidad_original==="mg");
    const other=confirmed.filter(x=>!selenium.includes(x));
    box.innerHTML=`<div class="v4-correction-group"><h3>Selenio: normalización sistemática</h3><p><strong>${selenium.length} registros.</strong> La unidad fuente mg fue normalizada a µg, conservando intactos los valores numéricos y registrando <code>unidad_fuente="mg"</code>.</p></div>
      <div class="v4-correction-list">${other.map(x=>`<div class="v4-correction-item"><strong>${esc(x.food.nombre)}</strong> · ${esc(x.field.replaceAll("_"," "))}<br>${esc(correctionValue(x))}${x.correction.motivo?`<br><span class="muted">${esc(x.correction.motivo)}</span>`:""}</div>`).join("")||"<p>No hay otras correcciones.</p>"}</div>`;
  } else if(activeValidationView==="estimados"){
    box.innerHTML=estimated.map(x=>`<div class="v4-estimated-item"><strong>${esc(x.food.nombre)}</strong><br>Valor fuente: ${esc(x.correction.valor_original)} ${esc(x.correction.unidad||"")} · Valor operativo: <strong>${esc(x.correction.valor_estimado)} ${esc(x.correction.unidad||"")}</strong>${x.correction.intervalo_estimado?`<br>Intervalo: ${x.correction.intervalo_estimado.join("–")} ${esc(x.correction.unidad||"")}`:""}<br><span class="muted">${esc(x.correction.motivo||"")}</span></div>`).join("")||"<p>No hay valores estimados.</p>";
  } else if(activeValidationView==="advertencias"){
    box.innerHTML=warnings.map(x=>`<div class="v4-warning-item"><strong>${esc(x.food.nombre)}</strong> · ${esc(x.warning.codigo||"advertencia")}<br>${esc(x.warning.mensaje||"")}</div>`).join("")||"<p>No hay advertencias activas.</p>";
  } else {
    box.innerHTML=`<div class="v4-correction-group"><h3>Criterios aplicados</h3>
    <p>1. Se conserva el valor publicado en la fuente para trazabilidad.</p>
    <p>2. Las erratas corroboradas se registran como correcciones, sin ocultar el dato original.</p>
    <p>3. Los valores que no pudieron confirmarse exactamente se marcan como <strong>estimados</strong>.</p>
    <p>4. El validador energético utiliza la relación 4-9-4 como prueba diagnóstica y considera la fibra para reducir falsos positivos.</p>
    <p>5. Un índice glicémico mayor que 100 no se considera automáticamente erróneo; se revisan valores extraordinarios o incoherentes con la carga glicémica.</p>
    <p>6. En la aplicación, cuando existe un valor estimado, se usa como valor operativo con un mensaje aclaratorio.</p></div>`;
  }
}
function openValidation(){renderValidationSummary();renderValidationContent();$("validationModal").hidden=false}
function closeValidation(){$("validationModal").hidden=true}
function closeSubstitute(){$("substituteModal").hidden=true;substituteIndex=null}

/* ---------- Bind ---------- */
bindMealSearch();
$("mealAddBtn").onclick=addMealItem;
$("saveMealBtn").onclick=saveCurrentMeal;
$("startChallengeBtn").onclick=startChallenge;
$("evaluateChallengeBtn").onclick=evaluateChallenge;
$("clearSubHistory").onclick=()=>{substitutionHistory=[];renderSubHistory()};
$("validationBtn").onclick=openValidation;
$("validationClose").onclick=closeValidation;
document.querySelectorAll("[data-close-validation]").forEach(x=>x.onclick=closeValidation);
$("substituteClose").onclick=closeSubstitute;
document.querySelectorAll("[data-close-substitute]").forEach(x=>x.onclick=closeSubstitute);
document.querySelectorAll(".v4-val-tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".v4-val-tab").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");activeValidationView=b.dataset.valView;renderValidationContent();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeValidation();closeSubstitute()}});
document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))$("mealSuggestions").hidden=true});

renderMeal();
renderSavedMeals();
renderSubHistory();
})();