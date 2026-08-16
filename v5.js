(()=>{
"use strict";
const $=id=>document.getElementById(id);
const rows=[
 {g:"Verduras",s:"",min:1,max:5,q:2,k:50,p:4,f:0,c:8,cho:.6,e:"🥦"},
 {g:"Frutas",s:"",min:1,max:6,q:1,k:60,p:0,f:0,c:15,cho:1,e:"🍎"},
 {g:"Cereales y tubérculos",s:"a. Sin grasa",min:1,max:7,q:1,k:70,p:2,f:0,c:15,cho:1,e:"🌽"},
 {g:"Cereales y tubérculos",s:"b. Con grasa",min:1,max:8,q:1,k:115,p:2,f:5,c:15,cho:1,e:"🍞"},
 {g:"Leguminosas",s:"",min:1,max:9,q:1,k:120,p:8,f:1,c:20,cho:1.3,e:"🫘"},
 {g:"Alimentos de origen animal",s:"a. Muy bajo aporte de grasa",min:1,max:10,q:1,k:40,p:7,f:1,c:0,cho:0,e:"🐟"},
 {g:"Alimentos de origen animal",s:"b. Bajo aporte de grasa",min:1,max:11,q:1,k:55,p:7,f:3,c:0,cho:0,e:"🍗"},
 {g:"Alimentos de origen animal",s:"c. Moderado aporte de grasa",min:1,max:12,q:1,k:75,p:7,f:5,c:0,cho:0,e:"🥚"},
 {g:"Alimentos de origen animal",s:"d. Alto aporte de grasa",min:1,max:13,q:1,k:100,p:7,f:8,c:0,cho:0,e:"🧀"},
 {g:"Leche",s:"a. Descremada",min:1,max:14,q:1,k:95,p:9,f:2,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"b. Semidescremada",min:1,max:15,q:1,k:110,p:9,f:4,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"c. Entera",min:1,max:16,q:1,k:150,p:9,f:8,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"d. Con azúcar",min:1,max:17,q:1,k:200,p:8,f:5,c:30,cho:2,e:"🥤"},
 {g:"Aceites y Grasas",s:"a. Sin proteína",min:1,max:18,q:1,k:45,p:0,f:5,c:0,cho:0,e:"🥑"},
 {g:"Aceites y Grasas",s:"b. Con proteína",min:1,max:19,q:1,k:70,p:3,f:5,c:3,cho:.2,e:"🥜"},
 {g:"Azúcares",s:"a. Sin grasa",min:1,max:20,q:1,k:40,p:0,f:0,c:10,cho:.7,e:"🍬"},
 {g:"Azúcares",s:"b. Con grasa",min:1,max:21,q:1,k:85,p:0,f:5,c:10,cho:.7,e:"🍪"},
 {g:"Alimentos libres en energía",s:"",min:1,max:22,q:1,k:0,p:0,f:0,c:0,cho:0,e:"🌿"},
 {g:"Bebidas alcohólicas",s:"",min:1,max:23,q:1,k:140,p:0,f:0,c:20,cho:1.3,e:"🍺"}
];
const defaults=JSON.parse(JSON.stringify(rows));
let profile={name:"General",sex:"Hombre",age:50,condition:"Sin condición clínica",goal:1800,macro:{p:20,f:30,c:50}};
const saved=localStorage.getItem("miniSmaeV5Profile"); if(saved){try{profile={...profile,...JSON.parse(saved)}}catch(_){}}
const savedRows=localStorage.getItem("miniSmaeV5Table"); if(savedRows){try{const a=JSON.parse(savedRows);a.forEach((x,i)=>{if(rows[i])Object.assign(rows[i],x)})}catch(_){}}
function fmt(x,d=0){return Number(x).toLocaleString("es-MX",{maximumFractionDigits:d})}
function totals(qs=rows.map(r=>r.q)){return rows.reduce((a,r,i)=>{let q=qs[i];a.q+=q;a.k+=q*r.k;a.p+=q*r.p;a.f+=q*r.f;a.c+=q*r.c;a.cho+=q*r.cho;return a},{q:0,k:0,p:0,f:0,c:0,cho:0})}
function macroTargets(){return {p:profile.goal*profile.macro.p/100/4,f:profile.goal*profile.macro.f/100/9,c:profile.goal*profile.macro.c/100/4}}
function macroPenalty(t){const m=macroTargets();return Math.abs(t.p-m.p)/(m.p||1)+Math.abs(t.f-m.f)/(m.f||1)+Math.abs(t.c-m.c)/(m.c||1)}
function profileRender(){ $("v5ProfileTitle").textContent="👤 "+profile.name;$("v5Sex").textContent=profile.sex;$("v5Age").textContent=profile.age;$("v5Condition").textContent=profile.condition;$("v5Goal").textContent=profile.goal;$("v5Goal2").textContent=profile.goal; const m=macroTargets();$("v5MacroTarget").innerHTML=[["Proteína",profile.macro.p,m.p,"g"],["Lípidos",profile.macro.f,m.f,"g"],["Hidratos",profile.macro.c,m.c,"g"]].map(x=>`<div class="v5-target-row"><span>${x[0]}</span><div class="v5-target-bar"><span style="width:${x[1]}%"></span></div><b>${fmt(x[2],1)} ${x[3]}</b></div>`).join("")}
function render(){profileRender();let b=$("v5TableBody");b.innerHTML=rows.map((r,i)=>`<tr data-i="${i}"><td><span class="v5-group-emoji">${r.e}</span><strong>${r.g}</strong></td><td>${r.s||"—"}</td><td><input class="v5-limit v5-min" data-i="${i}" type="number" min="0" max="99" step="1" value="${r.min}"></td><td><input class="v5-limit v5-max" data-i="${i}" type="number" min="0" max="99" step="1" value="${r.max}"></td><td><div class="v5-qty"><button data-act="minus" data-i="${i}">−</button><input class="v5-q" data-i="${i}" type="number" step="1" value="${r.q}"><button data-act="plus" data-i="${i}">+</button></div></td><td>${fmt(r.q*r.k)}</td><td>${fmt(r.q*r.p)}</td><td>${fmt(r.q*r.f)}</td><td>${fmt(r.q*r.c)}</td><td>${fmt(r.q*r.cho,1)}</td></tr>`).join("");
 let t=totals(),d=t.k-profile.goal,cls=Math.abs(d)<=20?"v5-kcal-ok":Math.abs(d)<=100?"v5-kcal-warn":"v5-kcal-bad";$("v5TableFoot").innerHTML=`<tr><td colspan="4">TOTAL</td><td>${t.q}</td><td>${fmt(t.k)}</td><td>${fmt(t.p)}</td><td>${fmt(t.f)}</td><td>${fmt(t.c)}</td><td>${fmt(t.cho,1)}</td></tr><tr class="v5-ideal"><td colspan="5">IDEAL (Objetivo)</td><td>${fmt(profile.goal)}</td><td colspan="4">Prioridad 2: ${profile.macro.p}% P · ${profile.macro.f}% L · ${profile.macro.c}% HC</td></tr><tr class="v5-difference"><td colspan="5">DIFERENCIA</td><td class="${cls}">${d>0?"+":""}${fmt(d)}</td><td colspan="4"></td></tr>`;
 $("v5TotalKcal").textContent=fmt(t.k);$("v5Protein").textContent=fmt(t.p)+" g";$("v5Fat").textContent=fmt(t.f)+" g";$("v5Carbs").textContent=fmt(t.c)+" g";$("v5Cho").textContent=fmt(t.cho,1);$("v5ProgressBar").style.width=Math.min(100,t.k/profile.goal*100)+"%";$("v5Diff").className="v5-diff "+cls;$("v5Diff").textContent=d===0?"Objetivo energético exacto":`${Math.abs(d)} kcal ${d<0?"por debajo":"por encima"} del objetivo`;
 bindTable(); localStorage.setItem("miniSmaeV5Table",JSON.stringify(rows.map(r=>({min:r.min,max:r.max,q:r.q}))));}
function clamp(i,v){const r=rows[i];return Math.max(r.min,Math.min(r.max,Math.round(Number(v)||0)))}
function bindTable(){document.querySelectorAll("#v5TableBody button[data-act]").forEach(b=>b.onclick=()=>{let i=+b.dataset.i;rows[i].q=clamp(i,rows[i].q+(b.dataset.act==="plus"?1:-1));render()});document.querySelectorAll(".v5-q").forEach(x=>x.onchange=()=>{let i=+x.dataset.i;rows[i].q=clamp(i,x.value);render()});document.querySelectorAll(".v5-min").forEach(x=>x.onchange=()=>{let i=+x.dataset.i;rows[i].min=Math.max(0,Math.round(+x.value||0));if(rows[i].max<rows[i].min)rows[i].max=rows[i].min;rows[i].q=clamp(i,rows[i].q);render()});document.querySelectorAll(".v5-max").forEach(x=>x.onchange=()=>{let i=+x.dataset.i;rows[i].max=Math.max(rows[i].min,Math.round(+x.value||0));rows[i].q=clamp(i,rows[i].q);render()})}
function stateTotals(qs){return totals(qs)}
function optimize(){const goal=profile.goal,cap=Math.max(goal+500,Math.round(goal*1.25));let states=new Map([[0,[{qs:[],p:0,f:0,c:0,cho:0,q:0}]]]);rows.forEach((r,idx)=>{let next=new Map();for(const [energy,list] of states){for(const st of list){for(let q=r.min;q<=r.max;q++){let ne=energy+q*r.k;if(ne>cap&&r.k>0)continue;let ns={qs:st.qs.concat(q),p:st.p+q*r.p,f:st.f+q*r.f,c:st.c+q*r.c,cho:st.cho+q*r.cho,q:st.q+q};let arr=next.get(ne)||[];arr.push(ns);if(arr.length>12){arr.sort((a,b)=>{let ta={k:ne,p:a.p,f:a.f,c:a.c},tb={k:ne,p:b.p,f:b.f,c:b.c};return macroPenalty(ta)-macroPenalty(tb)||a.q-b.q});arr.length=12}next.set(ne,arr)}}}states=next});
 let all=[];for(const [k,list] of states)for(const s of list)all.push({k,...s});if(!all.length)return;const minDiff=Math.min(...all.map(x=>Math.abs(x.k-goal)));const near=all.filter(x=>Math.abs(x.k-goal)<=minDiff+60);let chosen=[];function add(x,label){if(!x)return;if(chosen.some(y=>y.qs.join(",")===x.qs.join(",")))return;chosen.push({...x,label})}
 add([...all].sort((a,b)=>Math.abs(a.k-goal)-Math.abs(b.k-goal)||macroPenalty(a)-macroPenalty(b)||a.q-b.q)[0],"Más cercana");
 add([...near].sort((a,b)=>macroPenalty(a)-macroPenalty(b)||Math.abs(a.k-goal)-Math.abs(b.k-goal)||a.q-b.q)[0],"Más equilibrada");
 add([...near].sort((a,b)=>a.q-b.q||Math.abs(a.k-goal)-Math.abs(b.k-goal)||macroPenalty(a)-macroPenalty(b))[0],"Menos equivalentes");
 for(const x of [...all].sort((a,b)=>Math.abs(a.k-goal)-Math.abs(b.k-goal)||macroPenalty(a)-macroPenalty(b))){add(x,"Alternativa similar");if(chosen.length>=4)break}
 renderAlternatives(chosen.slice(0,4));}
function renderAlternatives(list){$("v5Alternatives").innerHTML=list.map((x,i)=>{let d=x.k-profile.goal;return `<div class="v5-alt"><div><strong>${i+1}. ${x.label}</strong><small>${fmt(x.k)} kcal (${d>0?"+":""}${fmt(d)}) · P ${fmt(x.p)} g · L ${fmt(x.f)} g · HC ${fmt(x.c)} g · ${x.q} equivalentes</small></div><button data-alt="${i}">Aplicar</button></div>`}).join("");window.__v5alts=list;document.querySelectorAll("[data-alt]").forEach(b=>b.onclick=()=>{let x=window.__v5alts[+b.dataset.alt];x.qs.forEach((q,i)=>rows[i].q=q);render()})}
function openProfile(){ $("v5ProfileName").value=profile.name;$("v5ProfileSex").value=profile.sex;$("v5ProfileAge").value=profile.age;$("v5ProfileGoal").value=profile.goal;$("v5TargetProtein").value=profile.macro.p;$("v5TargetFat").value=profile.macro.f;$("v5TargetCarbs").value=profile.macro.c;$("v5ProfileModal").hidden=false}
function closeProfile(){$("v5ProfileModal").hidden=true}
$("v5EditProfile").onclick=openProfile;$("v5ProfileClose").onclick=closeProfile;document.querySelectorAll("[data-close-v5-profile]").forEach(x=>x.onclick=closeProfile);$("v5SaveProfile").onclick=()=>{let p=+$("v5TargetProtein").value,f=+$("v5TargetFat").value,c=+$("v5TargetCarbs").value,sum=p+f+c;if(Math.abs(sum-100)>0.01){$("v5ProfileWarning").hidden=false;$("v5ProfileWarning").textContent=`Los porcentajes de macronutrimentos deben sumar 100%. Actualmente suman ${sum}%.`;return}$("v5ProfileWarning").hidden=true;profile={...profile,name:$("v5ProfileName").value.trim()||"General",sex:$("v5ProfileSex").value,age:Math.round(+$("v5ProfileAge").value||50),goal:Math.round(+$("v5ProfileGoal").value||1800),macro:{p,f,c}};localStorage.setItem("miniSmaeV5Profile",JSON.stringify(profile));closeProfile();render();$("v5Alternatives").innerHTML='<p class="muted">El perfil cambió. Ejecuta nuevamente la optimización.</p>'};
$("v5Optimize").onclick=optimize;$("v5Reset").onclick=()=>{defaults.forEach((d,i)=>Object.assign(rows[i],JSON.parse(JSON.stringify(d))));render();$("v5Alternatives").innerHTML='<p class="muted">Valores reiniciados a la tabla base.</p>'};
render();
})();
