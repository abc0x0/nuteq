(()=>{"use strict";
const DATA=window.SMAE_DATA||{}; const foods=DATA.alimentos||[];
const $=id=>document.getElementById(id);
const LS_FAV="miniSMAE_v3_favorites", LS_HIST="miniSMAE_v3_history";
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const fmt=v=>v==null||Number.isNaN(Number(v))?"ND":Number(v).toLocaleString("es-MX",{maximumFractionDigits:2});
const nval=(f,k)=>f?.nutrimentos?.[k]?.valor??null;
function portion(f){const p=f?.porcion||{};const q=p.cantidad!=null?fmt(p.cantidad):(p.cantidad_fuente||"");return [q,p.unidad].filter(Boolean).join(" ")}
function byName(name){const n=norm(name);return foods.find(f=>norm(f.nombre)===n)||foods.find(f=>norm(f.nombre).startsWith(n))}
function getStore(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}}
function setStore(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
function favIds(){return getStore(LS_FAV)}
function isFav(id){return favIds().includes(id)}
function currentFood(){return byName($("foodName")?.textContent||$("foodSearch")?.value||"")}
function gotoFood(f){document.querySelector('[data-view="buscar"]')?.click();const input=$("foodSearch");if(input){input.value=f.nombre;input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))}}
function miniButton(f){const b=document.createElement("button");b.className="sub";b.innerHTML=`<strong>${f.nombre}</strong><small>${f.grupo} · ${portion(f)}</small><span class="kcal">${nval(f,"energia")!=null?fmt(nval(f,"energia"))+" kcal":"ND"}</span>`;b.onclick=()=>gotoFood(f);return b}
function renderFavorites(){const c=$("favoritesList"),empty=$("favoritesEmpty");if(!c)return;c.innerHTML="";const fs=favIds().map(id=>foods.find(f=>f.id===id)).filter(Boolean);if(empty)empty.hidden=fs.length>0;fs.forEach(f=>c.appendChild(miniButton(f)));updateFavButton()}
function renderHistory(){const c=$("historyList"),empty=$("historyEmpty");if(!c)return;c.innerHTML="";const fs=getStore(LS_HIST).map(id=>foods.find(f=>f.id===id)).filter(Boolean);if(empty)empty.hidden=fs.length>0;fs.forEach(f=>c.appendChild(miniButton(f)))}
function updateFavButton(){const b=$("favoriteBtn"),f=currentFood();if(!b||!f)return;b.textContent=isFav(f.id)?"★":"☆";b.classList.toggle("active",isFav(f.id));b.title=isFav(f.id)?"Quitar de favoritos":"Agregar a favoritos"}
function addHistory(f){if(!f)return;let h=getStore(LS_HIST).filter(id=>id!==f.id);h.unshift(f.id);setStore(LS_HIST,h.slice(0,20));renderHistory()}
$("favoriteBtn")?.addEventListener("click",()=>{const f=currentFood();if(!f)return;let a=favIds();a=isFav(f.id)?a.filter(id=>id!==f.id):[f.id,...a];setStore(LS_FAV,a);renderFavorites()});
$("clearFavorites")?.addEventListener("click",()=>{setStore(LS_FAV,[]);renderFavorites()});
$("clearHistory")?.addEventListener("click",()=>{setStore(LS_HIST,[]);renderHistory()});
const nameNode=$("foodName");if(nameNode){new MutationObserver(()=>{const f=currentFood();if(f){addHistory(f);updateFavButton()}}).observe(nameNode,{childList:true,subtree:true})}

// Explicación adicional para el agente por reglas.
const goalText={similar:"cercanía de energía",menos_energia:"menor energía",mas_fibra:"mayor fibra",menos_sodio:"menor sodio",mas_proteina:"mayor proteína"};
function explanation(food,goal){if(!food)return"";const candidates=foods.filter(f=>f.id!==food.id&&f.grupo_codigo===food.grupo_codigo);return `Criterio del agente: primero restringe la búsqueda a “${food.grupo}” (${candidates.length} candidatos) y después los ordena por ${goalText[goal]||"el criterio seleccionado"}. Así evita mezclar alimentos de subgrupos SMAE diferentes.`}
document.querySelectorAll("#assistantGoals button").forEach(btn=>btn.addEventListener("click",()=>{setTimeout(()=>{const food=byName($("assistantFoodInput")?.value);const chat=$("chat");if(!food||!chat)return;const d=document.createElement("div");d.className="bubble bot";d.textContent=explanation(food,btn.dataset.goal);chat.appendChild(d);chat.scrollTop=chat.scrollHeight},30)}));

// Modo estudiante: preguntas generadas exclusivamente con los datos locales.
let score={ok:0,total:0};
const sample=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function option(text,correct,good,bad){const b=document.createElement("button");b.className="v3-quiz-option";b.textContent=text;b.onclick=()=>{const box=$("questionOptions");if(box.dataset.answered==="1")return;box.dataset.answered="1";score.total++;if(correct)score.ok++;b.classList.add(correct?"correct":"incorrect");const fb=$("questionFeedback");fb.hidden=false;fb.className="v3-quiz-feedback "+(correct?"ok":"bad");fb.textContent=correct?good:bad;$("scoreCorrect").textContent=score.ok;$("scoreTotal").textContent=score.total};$("questionOptions").appendChild(b)}
function newQuestion(){if(!foods.length)return;const box=$("questionOptions");box.innerHTML="";box.dataset.answered="0";$("questionFeedback").hidden=true;const type=Math.floor(Math.random()*3);
 if(type===0){const base=sample(foods);const same=foods.filter(f=>f.id!==base.id&&f.grupo_codigo===base.grupo_codigo);const wrong=foods.filter(f=>f.grupo_codigo!==base.grupo_codigo);if(!same.length||wrong.length<3)return newQuestion();const correct=sample(same),opts=shuffle([correct,...shuffle(wrong).slice(0,3)]);$("questionType").textContent="Grupo equivalente";$("questionText").textContent=`¿Cuál pertenece al mismo grupo/subgrupo SMAE que “${base.nombre}”?`;opts.forEach(f=>option(f.nombre,f.id===correct.id,`Correcto: ambos pertenecen a ${base.grupo}.`,`No. ${base.nombre} pertenece a ${base.grupo}.`));}
 else if(type===1){const groups=[...new Set(foods.map(f=>f.grupo_codigo))];const g=sample(groups);const list=foods.filter(f=>f.grupo_codigo===g&&nval(f,"fibra")!=null);if(list.length<4)return newQuestion();const opts=shuffle(list).slice(0,4),correct=[...opts].sort((a,b)=>nval(b,"fibra")-nval(a,"fibra"))[0];$("questionType").textContent="Fibra";$("questionText").textContent=`En ${correct.grupo}, ¿cuál de estos alimentos aporta más fibra por porción?`;opts.forEach(f=>option(`${f.nombre} — ${fmt(nval(f,"fibra"))} g`,f.id===correct.id,`Correcto: ${correct.nombre} tiene ${fmt(nval(correct,"fibra"))} g de fibra.`,`La mayor cantidad de fibra entre estas opciones es ${correct.nombre}.`));}
 else {const groups=[...new Set(foods.map(f=>f.grupo_codigo))];const g=sample(groups);const list=foods.filter(f=>f.grupo_codigo===g&&nval(f,"energia")!=null);if(list.length<4)return newQuestion();const opts=shuffle(list).slice(0,4),correct=[...opts].sort((a,b)=>nval(a,"energia")-nval(b,"energia"))[0];$("questionType").textContent="Energía";$("questionText").textContent=`En ${correct.grupo}, ¿cuál de estas porciones tiene menor energía?`;opts.forEach(f=>option(`${f.nombre} — ${fmt(nval(f,"energia"))} kcal`,f.id===correct.id,`Correcto: ${correct.nombre} tiene ${fmt(nval(correct,"energia"))} kcal.`,`La opción de menor energía es ${correct.nombre}.`));}}
$("newQuestion")?.addEventListener("click",newQuestion);

renderFavorites();renderHistory();newQuestion();
})();
