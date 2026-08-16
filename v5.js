(()=>{
"use strict";
const $=id=>document.getElementById(id);
const rows=[
 {g:"Verduras",s:"",min:0,max:5,q:0,k:50,p:4,f:0,c:8,cho:.6,e:"🥦"},
 {g:"Frutas",s:"",min:0,max:6,q:0,k:60,p:0,f:0,c:15,cho:1,e:"🍎"},
 {g:"Cereales y tubérculos",s:"a. Sin grasa",min:0,max:7,q:0,k:70,p:2,f:0,c:15,cho:1,e:"🌽"},
 {g:"Cereales y tubérculos",s:"b. Con grasa",min:0,max:8,q:0,k:115,p:2,f:5,c:15,cho:1,e:"🍞"},
 {g:"Leguminosas",s:"",min:0,max:9,q:0,k:120,p:8,f:1,c:20,cho:1.3,e:"🫘"},
 {g:"Alimentos de origen animal",s:"a. Muy bajo aporte de grasa",min:0,max:10,q:0,k:40,p:7,f:1,c:0,cho:0,e:"🐟"},
 {g:"Alimentos de origen animal",s:"b. Bajo aporte de grasa",min:0,max:11,q:0,k:55,p:7,f:3,c:0,cho:0,e:"🍗"},
 {g:"Alimentos de origen animal",s:"c. Moderado aporte de grasa",min:0,max:12,q:0,k:75,p:7,f:5,c:0,cho:0,e:"🥚"},
 {g:"Alimentos de origen animal",s:"d. Alto aporte de grasa",min:0,max:13,q:0,k:100,p:7,f:8,c:0,cho:0,e:"🧀"},
 {g:"Leche",s:"a. Descremada",min:0,max:14,q:0,k:95,p:9,f:2,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"b. Semidescremada",min:0,max:15,q:0,k:110,p:9,f:4,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"c. Entera",min:0,max:16,q:0,k:150,p:9,f:8,c:12,cho:.8,e:"🥛"},
 {g:"Leche",s:"d. Con azúcar",min:0,max:17,q:0,k:200,p:8,f:5,c:30,cho:2,e:"🥤"},
 {g:"Aceites y Grasas",s:"a. Sin proteína",min:0,max:18,q:0,k:45,p:0,f:5,c:0,cho:0,e:"🥑"},
 {g:"Aceites y Grasas",s:"b. Con proteína",min:0,max:19,q:0,k:70,p:3,f:5,c:3,cho:.2,e:"🥜"},
 {g:"Azúcares",s:"a. Sin grasa",min:0,max:20,q:0,k:40,p:0,f:0,c:10,cho:.7,e:"🍬"},
 {g:"Azúcares",s:"b. Con grasa",min:0,max:21,q:0,k:85,p:0,f:5,c:10,cho:.7,e:"🍪"},
 {g:"Alimentos libres en energía",s:"",min:0,max:22,q:0,k:0,p:0,f:0,c:0,cho:0,e:"🌿"},
 {g:"Bebidas alcohólicas",s:"",min:0,max:23,q:0,k:140,p:0,f:0,c:20,cho:1.3,e:"🍺"}
];
const defaults=JSON.parse(JSON.stringify(rows));
let profile={
 name:"General",sex:"Hombre",age:50,condition:"Sin condición clínica",
 goal:1800,target:{p:82,f:57,c:182,cho:12.2}
};
const saved=localStorage.getItem("miniSmaeV5Profile");
if(saved){
 try{
   const old=JSON.parse(saved);
   profile={...profile,...old};
   if(old.target){
     profile.target={...profile.target,...old.target};
   }else if(old.macro){
     // Migración transparente desde v5/v5.1: convierte porcentajes a gramos.
     const g=Number(old.goal)||profile.goal;
     profile.target={
       p:g*(Number(old.macro.p)||0)/100/4,
       f:g*(Number(old.macro.f)||0)/100/9,
       c:g*(Number(old.macro.c)||0)/100/4,
       cho:profile.target.cho
     };
     delete profile.macro;
   }
 }catch(_){}
}
const savedRows=localStorage.getItem("miniSmaeV53Table"); if(savedRows){try{const a=JSON.parse(savedRows);a.forEach((x,i)=>{if(rows[i])Object.assign(rows[i],x)})}catch(_){}}

let savedProfiles=[];
try{savedProfiles=JSON.parse(localStorage.getItem("miniSmaeV53Profiles")||"[]")}catch(_){savedProfiles=[]}
if(!Array.isArray(savedProfiles))savedProfiles=[];
function normalizeProfile(p){
 return {
   name:String(p?.name||"General"),
   sex:(p?.sex==="Mujer"?"Mujer":"Hombre"),
   age:Math.round(Number(p?.age)||50),
   condition:String(p?.condition||"Sin condición clínica"),
   goal:Number(p?.goal)||1800,
   target:{
     p:Number(p?.target?.p)||0,
     f:Number(p?.target?.f)||0,
     c:Number(p?.target?.c)||0,
     cho:Number(p?.target?.cho)||0
   }
 };
}
function persistProfiles(){localStorage.setItem("miniSmaeV53Profiles",JSON.stringify(savedProfiles))}
function saveProfileToList(p){
 const n=normalizeProfile(p);
 const idx=savedProfiles.findIndex(x=>String(x.name).toLocaleLowerCase("es-MX")===n.name.toLocaleLowerCase("es-MX"));
 if(idx>=0)savedProfiles[idx]=n; else savedProfiles.unshift(n);
 savedProfiles=savedProfiles.slice(0,20);
 persistProfiles();
}
if(!savedProfiles.length){saveProfileToList(profile)}
function compactProfileText(p){
 const s=p.sex==="Hombre"?"H":"M";
 const safeName=String(p.name||"General").trim().replace(/\s+/g,"_");
 return `${safeName}_${s}_${p.age}a_${fmt(p.goal)}kcal_P${fmt(p.target.p,1)}_L${fmt(p.target.f,1)}_HC${fmt(p.target.c,1)}_CH${fmt(p.target.cho,1)}`;
}
function renderSavedProfiles(){
 const count=$("v54SavedCount");
 if(count)count.textContent=`${savedProfiles.length} ${savedProfiles.length===1?"perfil":"perfiles"}`;
 const host=$("v54SavedProfilesList");
 if(!host)return;
 if(!savedProfiles.length){
   host.innerHTML='<p class="muted">No hay perfiles guardados.</p>';
   return;
 }
 host.innerHTML=savedProfiles.map((raw,i)=>{
   const p=normalizeProfile(raw);
   return `<button type="button" class="v54-saved-row" data-profile-i="${i}">
     <span class="v54-saved-index">${i+1}:</span>
     <span class="v54-saved-text">${compactProfileText(p)}</span>
   </button>`;
 }).join("");
 host.querySelectorAll("[data-profile-i]").forEach(btn=>btn.onclick=()=>{
   profile=normalizeProfile(savedProfiles[+btn.dataset.profileI]);
   localStorage.setItem("miniSmaeV5Profile",JSON.stringify(profile));
   closeSavedProfiles();
   render();
   $("v5Alternatives").innerHTML='<p class="muted">Perfil recuperado y aplicado. Ejecuta la optimización para generar nuevas alternativas.</p>';
 });
}
function openSavedProfiles(){
 renderSavedProfiles();
 $("v54SavedProfilesModal").hidden=false;
}
function closeSavedProfiles(){$("v54SavedProfilesModal").hidden=true}
function fmt(x,d=0){return Number(x).toLocaleString("es-MX",{maximumFractionDigits:d})}
function totals(qs=rows.map(r=>r.q)){return rows.reduce((a,r,i)=>{let q=qs[i];a.q+=q;a.k+=q*r.k;a.p+=q*r.p;a.f+=q*r.f;a.c+=q*r.c;a.cho+=q*r.cho;return a},{q:0,k:0,p:0,f:0,c:0,cho:0})}
function targetObj(){return {k:Number(profile.goal)||0,p:Number(profile.target.p)||0,f:Number(profile.target.f)||0,c:Number(profile.target.c)||0,cho:Number(profile.target.cho)||0}}
function relDev(actual,target){
 if(target===0)return actual===0?0:999;
 return Math.abs(actual-target)/Math.abs(target);
}
function profileScore(t){
 const z=targetObj();
 const dev=[relDev(t.k,z.k),relDev(t.p,z.p),relDev(t.f,z.f),relDev(t.c,z.c),relDev(t.cho,z.cho)];
 const outside=dev.filter(x=>x>.10+1e-9).length;
 const max=Math.max(...dev);
 const mean=dev.reduce((a,b)=>a+b,0)/dev.length;
 const rms=Math.sqrt(dev.reduce((a,b)=>a+b*b,0)/dev.length);
 return {outside,max,mean,rms,dev};
}
function compareProfile(a,b){
 const A=profileScore(a),B=profileScore(b);
 return A.outside-B.outside || A.max-B.max || A.rms-B.rms || A.mean-B.mean || a.q-b.q;
}
function isGood(t){return profileScore(t).outside===0}
function signed(v,d=0){return `${v>0?"+":""}${fmt(v,d)}`}
function diffClass(actual,target){
 const d=relDev(actual,target);
 return d<=.10+1e-9?"v52-good":"v52-out";
}
function profileRender(){
 $("v5ProfileTitle").textContent="👤 "+profile.name;
 $("v5Sex").textContent=profile.sex;
 $("v5Age").textContent=profile.age;
 $("v5Condition").textContent=profile.condition;
 $("v5Goal").textContent=fmt(profile.goal);
 $("v5Goal2").textContent=fmt(profile.goal);
 const z=targetObj();
 const items=[
   ["🔥 Energía",z.k,"kcal"],["🥩 Proteína",z.p,"g"],["🫒 Lípidos",z.f,"g"],
   ["🌾 Hidratos",z.c,"g"],["🔢 Conteo HC",z.cho,""]
 ];
 $("v5MacroTarget").innerHTML=items.map(x=>`<div class="v52-target-value"><span>${x[0]}</span><b>${fmt(x[1],x[0].includes("Conteo")?1:0)} ${x[2]}</b></div>`).join("");
 renderSavedProfiles();
}
function render(){
 profileRender();
 let b=$("v5TableBody");
 b.innerHTML=rows.map((r,i)=>`<tr data-i="${i}">
   <td><span class="v5-group-emoji">${r.e}</span><strong>${r.g}</strong></td>
   <td>${r.s||"—"}</td>
   <td><div class="v5-qty"><button data-act="minus" data-i="${i}">−</button><input class="v5-q" data-i="${i}" type="number" min="0" step="1" value="${r.q}"><button data-act="plus" data-i="${i}">+</button></div></td>
   <td>${fmt(r.q*r.k)}</td><td>${fmt(r.q*r.p)}</td><td>${fmt(r.q*r.f)}</td><td>${fmt(r.q*r.c)}</td><td>${fmt(r.q*r.cho,1)}</td>
 </tr>`).join("");
 const t=totals(),z=targetObj(),s=profileScore(t);
 const dk=t.k-z.k,dp=t.p-z.p,df=t.f-z.f,dc=t.c-z.c,dcho=t.cho-z.cho;
 $("v5TableFoot").innerHTML=`
 <tr><td colspan="2">TOTAL</td><td>${t.q}</td><td>${fmt(t.k)}</td><td>${fmt(t.p)}</td><td>${fmt(t.f)}</td><td>${fmt(t.c)}</td><td>${fmt(t.cho,1)}</td></tr>
 <tr class="v5-ideal"><td colspan="2">IDEAL (Objetivo)</td><td>—</td><td>${fmt(z.k)}</td><td>${fmt(z.p,1)}</td><td>${fmt(z.f,1)}</td><td>${fmt(z.c,1)}</td><td>${fmt(z.cho,1)}</td></tr>
 <tr class="v5-difference"><td colspan="2">DIFERENCIA</td><td>—</td>
 <td class="${diffClass(t.k,z.k)}">${signed(dk)}</td>
 <td class="${diffClass(t.p,z.p)}">${signed(dp,1)}</td>
 <td class="${diffClass(t.f,z.f)}">${signed(df,1)}</td>
 <td class="${diffClass(t.c,z.c)}">${signed(dc,1)}</td>
 <td class="${diffClass(t.cho,z.cho)}">${signed(dcho,1)}</td></tr>`;
 $("v5TotalKcal").textContent=fmt(t.k);
 $("v5Protein").textContent=fmt(t.p)+" g";
 $("v5Fat").textContent=fmt(t.f)+" g";
 $("v5Carbs").textContent=fmt(t.c)+" g";
 $("v5Cho").textContent=fmt(t.cho,1);
 $("v5ProgressBar").style.width=Math.min(100,z.k? t.k/z.k*100:0)+"%";
 $("v5Diff").className="v5-diff "+(s.outside===0?"v5-kcal-ok":"v5-kcal-warn");
 $("v5Diff").textContent=s.outside===0
   ?"✓ Perfil dentro de ±10% en todas las referencias"
   :`${s.outside} de 5 referencias fuera del margen ±10%`;

 // Las referencias actuales fuera del margen de tolerancia se muestran en rojo.
 $("v5TotalKcal").classList.toggle("v53-summary-out",relDev(t.k,z.k)>.10+1e-9);
 [["v53ProteinRef",t.p,z.p],["v53FatRef",t.f,z.f],["v53CarbsRef",t.c,z.c],["v53ChoRef",t.cho,z.cho]]
   .forEach(([id,a,target])=>$(id)?.classList.toggle("v53-summary-out",relDev(a,target)>.10+1e-9));

 bindTable();
 localStorage.setItem("miniSmaeV53Table",JSON.stringify(rows.map(r=>({q:r.q}))));
}
function clamp(i,v){
 const r=rows[i];
 return Math.max(0,Math.min(r.max,Math.round(Number(v)||0)));
}
function bindTable(){
 document.querySelectorAll("#v5TableBody button[data-act]").forEach(b=>b.onclick=()=>{
   let i=+b.dataset.i;
   rows[i].q=clamp(i,rows[i].q+(b.dataset.act==="plus"?1:-1));
   render();
 });
 document.querySelectorAll(".v5-q").forEach(x=>x.onchange=()=>{
   let i=+x.dataset.i;
   rows[i].q=clamp(i,x.value);
   render();
 });
}
function stateTotals(qs){return totals(qs)}
function flashOptimizedRows(previousQs,newQs){
 const changed=[];
 newQs.forEach((q,i)=>{if(previousQs[i]!==q)changed.push(i)});
 requestAnimationFrame(()=>{
   changed.forEach(i=>{
     const tr=document.querySelector(`#v5TableBody tr[data-i="${i}"]`);
     if(tr){tr.classList.remove("v51-row-changed");void tr.offsetWidth;tr.classList.add("v51-row-changed")}
   });
   const table=document.querySelector(".v5-table-card");
   if(table){table.classList.remove("v51-table-updated");void table.offsetWidth;table.classList.add("v51-table-updated")}
 });
 setTimeout(()=>document.querySelectorAll(".v51-row-changed").forEach(el=>el.classList.remove("v51-row-changed")),1800);
}
function optimize(){
 const z=targetObj();
 // La energía sigue siendo una dimensión eficiente para el DP, pero la selección
 // final se ordena exclusivamente por diferencia relativa frente al perfil completo.
 const maxPossible=rows.reduce((a,r)=>a+r.max*r.k,0);
 const cap=Math.min(maxPossible,Math.max(Math.round(z.k*2),z.k+1500));
 let states=new Map([[0,[{qs:[],p:0,f:0,c:0,cho:0,q:0}]]]);
 rows.forEach(r=>{
   const next=new Map();
   for(const [energy,list] of states){
     for(const st of list){
       for(let q=r.min;q<=r.max;q++){
         const ne=energy+q*r.k;
         if(ne>cap&&r.k>0)continue;
         const ns={qs:st.qs.concat(q),p:st.p+q*r.p,f:st.f+q*r.f,c:st.c+q*r.c,cho:st.cho+q*r.cho,q:st.q+q};
         let arr=next.get(ne)||[];
         arr.push(ns);
         // Conserva varias configuraciones por energía, priorizando el perfil completo.
         if(arr.length>20){
           arr.sort((a,b)=>compareProfile({k:ne,...a},{k:ne,...b}));
           arr.length=20;
         }
         next.set(ne,arr);
       }
     }
   }
   states=next;
 });
 let all=[];
 for(const [k,list] of states)for(const s of list)all.push({k,...s});
 if(!all.length)return;
 all.sort(compareProfile);
 const chosen=[];
 for(const x of all){
   if(chosen.some(y=>y.qs.join(",")===x.qs.join(",")))continue;
   chosen.push({...x,label:chosen.length===0?"Más cercana al perfil":`Alternativa ${chosen.length+1}`});
   if(chosen.length>=4)break;
 }
 const best=chosen[0],previousQs=rows.map(r=>r.q);
 if(best){
   best.qs.forEach((q,i)=>rows[i].q=q);
   render();
   flashOptimizedRows(previousQs,best.qs);
 }
 renderAlternatives(chosen,true);
}
function altDeviations(x){
 const z=targetObj();
 const vals=[
   ["E",x.k,z.k],["P",x.p,z.p],["L",x.f,z.f],["HC",x.c,z.c],["CHO",x.cho,z.cho]
 ];
 return vals.map(([n,a,t])=>`${n} ${t?((a-t)/t*100).toFixed(1):"—"}%`).join(" · ");
}
function renderAlternatives(list,autoApplied=false){
 $("v5Alternatives").innerHTML=list.map((x,i)=>{
   const applied=autoApplied&&i===0;
   const good=isGood(x);
   const sc=profileScore(x);
   return `<div class="v5-alt ${applied?"v51-alt-applied":""}">
     <div><strong>${i+1}. ${x.label}${applied?' <span class="v51-applied-badge">Aplicada automáticamente</span>':''}
       ${good?'<span class="v52-good-badge">✓ ±10%</span>':''}</strong>
     <small>${fmt(x.k)} kcal · P ${fmt(x.p)} g · L ${fmt(x.f)} g · HC ${fmt(x.c)} g · CHO ${fmt(x.cho,1)} · ${x.q} equivalentes</small>
     <small class="v52-devline">Diferencia relativa: ${altDeviations(x)} · máx. ${fmt(sc.max*100,1)}%</small></div>
     <button data-alt="${i}">${applied?"Aplicada":"Aplicar"}</button>
   </div>`}).join("");
 window.__v5alts=list;
 document.querySelectorAll("[data-alt]").forEach(b=>b.onclick=()=>{
   const x=window.__v5alts[+b.dataset.alt],previousQs=rows.map(r=>r.q);
   x.qs.forEach((q,i)=>rows[i].q=q);
   render();
   flashOptimizedRows(previousQs,x.qs);
   renderAlternatives(window.__v5alts,false);
   const card=b.closest(".v5-alt");
   if(card){card.classList.add("v51-alt-applied");b.textContent="Aplicada";}
 });
}
$("v54OpenSavedProfiles").onclick=openSavedProfiles;
$("v54SavedProfilesClose").onclick=closeSavedProfiles;
document.querySelectorAll("[data-close-v54-saved]").forEach(x=>x.onclick=closeSavedProfiles);
function openProfile(){
 $("v5ProfileName").value=profile.name;
 $("v5ProfileSex").value=profile.sex;
 $("v5ProfileAge").value=profile.age;
 $("v5ProfileGoal").value=profile.goal;
 $("v5TargetProtein").value=profile.target.p;
 $("v5TargetFat").value=profile.target.f;
 $("v5TargetCarbs").value=profile.target.c;
 $("v5TargetCho").value=profile.target.cho;
 $("v5ProfileModal").hidden=false;
}
function closeProfile(){$("v5ProfileModal").hidden=true}
$("v5EditProfile").onclick=openProfile;
$("v5ProfileClose").onclick=closeProfile;
document.querySelectorAll("[data-close-v5-profile]").forEach(x=>x.onclick=closeProfile);
$("v5SaveProfile").onclick=()=>{
 const goal=Number($("v5ProfileGoal").value),p=Number($("v5TargetProtein").value),
       f=Number($("v5TargetFat").value),c=Number($("v5TargetCarbs").value),
       cho=Number($("v5TargetCho").value);
 if([goal,p,f,c,cho].some(v=>!Number.isFinite(v)||v<0)||goal<=0){
   $("v5ProfileWarning").hidden=false;
   $("v5ProfileWarning").textContent="Los valores objetivo deben ser números válidos y no negativos; la energía debe ser mayor que cero.";
   return;
 }
 $("v5ProfileWarning").hidden=true;
 profile={
   ...profile,
   name:$("v5ProfileName").value.trim()||"General",
   sex:$("v5ProfileSex").value,
   age:Math.round(+$("v5ProfileAge").value||50),
   goal:Math.round(goal),
   target:{p,f,c,cho}
 };
 delete profile.macro;
 localStorage.setItem("miniSmaeV5Profile",JSON.stringify(profile));
 saveProfileToList(profile);
 closeProfile();render();
 $("v5Alternatives").innerHTML='<p class="muted">El perfil cambió. Ejecuta nuevamente la optimización.</p>';
};
$("v5Optimize").onclick=()=>{
 const btn=$("v5Optimize");
 btn.disabled=true;
 btn.dataset.oldText=btn.textContent;
 btn.textContent="⏳ Procesando...";
 $("v5Alternatives").innerHTML='<div class="v53-processing"><span class="v53-spinner" aria-hidden="true"></span><strong>Procesando...</strong><small>Buscando las combinaciones más cercanas al perfil objetivo.</small></div>';
 // Se difiere el cálculo para permitir que el navegador pinte el estado "Procesando..."
 setTimeout(()=>{
   try{optimize()}
   finally{
     btn.disabled=false;
     btn.textContent=btn.dataset.oldText||"✨ Optimizar automáticamente";
   }
 },60);
};
$("v5Reset").onclick=()=>{
 defaults.forEach((d,i)=>Object.assign(rows[i],JSON.parse(JSON.stringify(d))));
 render();
 $("v5Alternatives").innerHTML='<p class="muted">Cantidades reiniciadas a 0.</p>';
};
render();
})();
