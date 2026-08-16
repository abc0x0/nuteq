(() => {
  "use strict";

  const JSON_URL = "data/SMAE-4ed-normalizado-validado-v7.json";
  const INITIAL_SUBSTITUTE_LIMIT = 10;

  let database = null;
  let foods = [];
  let visibleSubstitutes = [];
  let substituteLimit = INITIAL_SUBSTITUTE_LIMIT;
  let currentFood = null;

  const el = (id) => document.getElementById(id);
  const search = el("foodSearch");
  const suggestions = el("suggestions");
  const emptyState = el("emptyState");
  const foodView = el("foodView");
  const status = el("dataStatus");

  const labels = {
    peso_bruto: "Peso bruto",
    peso_neto: "Peso neto",
    energia: "Energía",
    proteina: "Proteína",
    lipidos: "Lípidos",
    hidratos_carbono: "Hidratos de carbono",
    fibra: "Fibra",
    vitamina_a: "Vitamina A",
    acido_ascorbico: "Ácido ascórbico",
    acido_folico: "Ácido fólico",
    hierro_no_hem: "Hierro no hem",
    hierro: "Hierro",
    calcio: "Calcio",
    sodio: "Sodio",
    potasio: "Potasio",
    selenio: "Selenio",
    colesterol: "Colesterol",
    indice_glicemico: "Índice glicémico",
    carga_glicemica: "Carga glicémica",
    azucar_por_equivalente: "Azúcar por equivalente",
    azucares_por_equivalente: "Azúcares por equivalente",
    acidos_grasos_saturados: "Ácidos grasos saturados",
    acidos_grasos_monoinsaturados: "Ácidos grasos monoinsaturados",
    acidos_grasos_poliinsaturados: "Ácidos grasos poliinsaturados",
    etanol: "Etanol"
  };

  function normalize(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadData() {
    try {
      // Preferred path when the folder is served by a simple HTTP server.
      const response = await fetch(JSON_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      database = await response.json();
      foods = database.alimentos || [];
      setReady(`JSON cargado · ${foods.length.toLocaleString("es-MX")} alimentos`);
    } catch (error) {
      // Fallback allows opening index.html directly from disk (file://).
      if (window.SMAE_DATA?.alimentos) {
        database = window.SMAE_DATA;
        foods = database.alimentos;
        setReady(`Datos locales · ${foods.length.toLocaleString("es-MX")} alimentos`);
      } else {
        status.textContent = "No se pudieron cargar los datos";
        console.error(error);
      }
    }
  }

  function setReady(message) {
    status.textContent = message;
    status.classList.add("ready");
    search.disabled = false;
  }

  function formatNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "ND";
    return Number(value).toLocaleString("es-MX", { maximumFractionDigits: 2 });
  }

  function portionText(food) {
    const p = food.porcion || {};
    const qty = p.cantidad_fuente || (p.cantidad != null ? formatNumber(p.cantidad) : "");
    return [qty, p.unidad].filter(Boolean).join(" ");
  }

  function nutrientValue(food, key) {
    return food.nutrimentos?.[key]?.valor ?? null;
  }

  function energyValue(food) {
    return nutrientValue(food, "energia");
  }

  function isEstimated(obj) {
    return obj?.estado === "estimado" || obj?.correccion?.tipo === "estimacion_por_coherencia";
  }

  function searchFoods(query, limit = 12) {
    const q = normalize(query);
    if (q.length < 2) return [];

    const starts = [];
    const contains = [];
    for (const food of foods) {
      const name = food.nombre_busqueda || normalize(food.nombre);
      if (name.startsWith(q)) starts.push(food);
      else if (name.includes(q)) contains.push(food);
    }
    return starts.concat(contains).slice(0, limit);
  }

  function renderSuggestions(matches) {
    suggestions.innerHTML = "";
    if (!matches.length) {
      suggestions.hidden = true;
      return;
    }
    for (const food of matches) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion";
      button.setAttribute("role", "option");
      button.innerHTML = `<span><strong>${escapeHtml(food.nombre)}</strong><br><small>${escapeHtml(portionText(food))}</small></span>
                          <small>${escapeHtml(food.grupo)}</small>`;
      button.addEventListener("click", () => selectFood(food));
      suggestions.appendChild(button);
    }
    suggestions.hidden = false;
  }

  function selectFood(food) {
    currentFood = food;
    search.value = food.nombre;
    suggestions.hidden = true;
    emptyState.hidden = true;
    foodView.hidden = false;
    substituteLimit = INITIAL_SUBSTITUTE_LIMIT;

    el("foodName").textContent = food.nombre;
    el("foodGroup").textContent = food.grupo;
    el("foodPortion").textContent = `Porción sugerida: ${portionText(food)}`;

    renderEstimatedInfo(food);
    renderNutrients(food);
    renderSource(food);
    buildSubstitutes(food);

    if (window.innerWidth < 700) {
      foodView.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderEstimatedInfo(food) {
    const badge = el("estimatedBadge");
    const notice = el("estimatedNotice");
    const msg = el("estimatedMessage");
    const detail = el("estimateDetail");
    const estimated = Object.entries(food.nutrimentos || {})
      .filter(([, obj]) => isEstimated(obj));

    if (!estimated.length) {
      badge.hidden = true;
      notice.hidden = true;
      detail.hidden = true;
      detail.innerHTML = "";
      return;
    }

    badge.hidden = false;
    notice.hidden = false;
    msg.textContent = database?.politica_uso_aplicacion?.mensaje_usuario_sugerido ||
      "El dato original presenta una inconsistencia y para los cálculos se utiliza una estimación documentada.";

    detail.innerHTML = estimated.map(([key, obj]) => {
      const c = obj.correccion || {};
      return `<div>
        <strong>${escapeHtml(labels[key] || key)}</strong><br>
        Valor fuente: ${escapeHtml(c.valor_original ?? obj.valor_fuente ?? "ND")} ${escapeHtml(obj.unidad || "")}<br>
        Valor usado: ${escapeHtml(c.valor_estimado ?? obj.valor)} ${escapeHtml(obj.unidad || "")}<br>
        ${c.intervalo_estimado ? `Intervalo considerado: ${c.intervalo_estimado.join("–")} ${escapeHtml(obj.unidad || "")}<br>` : ""}
        ${c.metodo ? `Método: ${escapeHtml(c.metodo.replaceAll("_", " "))}<br>` : ""}
        ${c.motivo ? `<span>${escapeHtml(c.motivo)}</span>` : ""}
      </div>`;
    }).join("<hr>");
  }

  function renderNutrients(food) {
    const grid = el("nutrientGrid");
    grid.innerHTML = "";

    const priority = [
      "energia", "proteina", "lipidos", "hidratos_carbono", "fibra",
      "peso_neto", "peso_bruto", "indice_glicemico", "carga_glicemica"
    ];

    const remaining = Object.keys(food.nutrimentos || {}).filter(k => !priority.includes(k));
    const ordered = priority.concat(remaining);

    for (const key of ordered) {
      const obj = food.nutrimentos?.[key];
      if (!obj) continue;
      if (obj.valor === null && obj.estado !== "estimado") continue;

      const item = document.createElement("div");
      item.className = "nutrient" + (isEstimated(obj) ? " estimated" : "");
      item.innerHTML = `<span class="label">${escapeHtml(labels[key] || key.replaceAll("_", " "))}${isEstimated(obj) ? " · estimado" : ""}</span>
                        <span class="value">${escapeHtml(formatNumber(obj.valor))}${obj.unidad ? " " + escapeHtml(obj.unidad) : ""}</span>`;
      grid.appendChild(item);
    }
  }

  function renderSource(food) {
    const dl = el("sourceInfo");
    const warnings = food.validacion_semantica?.advertencias || [];
    dl.innerHTML = `
      <dt>Documento</dt><dd>${escapeHtml(food.fuente?.documento || "SMAE")}</dd>
      <dt>Página PDF</dt><dd>${escapeHtml(food.fuente?.pagina_pdf ?? "ND")}</dd>
      <dt>Estado</dt><dd>${escapeHtml(food.validacion_semantica?.estado || "sin advertencias")}</dd>
      <dt>Advertencias activas</dt><dd>${warnings.length ? escapeHtml(warnings.map(w => w.codigo).join(", ")) : "Ninguna"}</dd>
    `;
  }

  function buildSubstitutes(food) {
    // grupo_codigo represents the exact SMAE group/subgroup used in the normalized JSON,
    // e.g. cereales_sin_grasa, aoa_bajo, leche_entera, etc.
    visibleSubstitutes = foods
      .filter(x => x.id !== food.id && x.grupo_codigo === food.grupo_codigo)
      .sort((a, b) => {
        const ea = energyValue(a);
        const eb = energyValue(b);
        const target = energyValue(food);
        if (target != null && ea != null && eb != null) {
          return Math.abs(ea - target) - Math.abs(eb - target);
        }
        return a.nombre.localeCompare(b.nombre, "es");
      });

    el("substituteCount").textContent = visibleSubstitutes.length.toLocaleString("es-MX");
    el("substituteIntro").textContent =
      `Opciones del mismo grupo/subgrupo SMAE: ${food.grupo}. Haz clic en cualquiera para consultar su ficha.`;

    renderSubstitutes();
  }

  function renderSubstitutes() {
    const container = el("substitutes");
    container.innerHTML = "";

    const subset = visibleSubstitutes.slice(0, substituteLimit);
    for (const food of subset) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "substitute";
      const kcal = energyValue(food);
      const eObj = food.nutrimentos?.energia;
      button.innerHTML = `
        <strong>${escapeHtml(food.nombre)}</strong>
        <span class="portion-text">${escapeHtml(portionText(food))}</span>
        <span class="kcal">${kcal == null ? "ND" : formatNumber(kcal) + " kcal"}${isEstimated(eObj) ? " *" : ""}</span>
      `;
      button.title = "Consultar este alimento";
      button.addEventListener("click", () => selectFood(food));
      container.appendChild(button);
    }

    const more = el("showMore");
    more.hidden = substituteLimit >= visibleSubstitutes.length;
    more.textContent = `Ver más (${visibleSubstitutes.length - substituteLimit})`;
  }

  search.disabled = true;

  search.addEventListener("input", () => {
    const value = search.value;
    renderSuggestions(searchFoods(value));
    el("searchHelp").textContent = value.trim().length < 2
      ? "Escribe al menos 2 letras para ver sugerencias."
      : "Selecciona un alimento de la lista.";
  });

  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const matches = searchFoods(search.value, 1);
      if (matches.length) selectFood(matches[0]);
    }
    if (event.key === "Escape") suggestions.hidden = true;
  });

  el("clearSearch").addEventListener("click", () => {
    search.value = "";
    suggestions.hidden = true;
    search.focus();
  });

  el("showMore").addEventListener("click", () => {
    substituteLimit += 10;
    renderSubstitutes();
  });

  el("toggleEstimateDetail").addEventListener("click", () => {
    const detail = el("estimateDetail");
    detail.hidden = !detail.hidden;
    el("toggleEstimateDetail").textContent = detail.hidden ? "Ver detalle" : "Ocultar detalle";
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-box")) suggestions.hidden = true;
  });

  loadData();
})();
