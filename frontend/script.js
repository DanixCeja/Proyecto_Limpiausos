const API_URL = "https://proyecto-limpiausos.onrender.com/predict";

const imageInput      = document.getElementById("imageInput");
const preview         = document.getElementById("preview");
const uploadZone      = document.getElementById("uploadZone");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const fileNameEl      = document.getElementById("fileName");
const fileInfoEl      = document.getElementById("fileInfo");
const analyzeBtn      = document.getElementById("analyzeBtn");
const panelRight      = document.getElementById("panelRight");

/* ─── Helpers ─── */

function formatSize(bytes) {
  if (bytes < 1024)    return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

/* ─── Carga de imagen ─── */

function handleFile(file) {
  if (!file) return;

  // Vista previa
  preview.src = URL.createObjectURL(file);
  preview.classList.add("visible");
  uploadPlaceholder.style.display = "none";
  uploadZone.classList.add("has-image");

  // Nombre y tamaño
  fileNameEl.textContent = file.name;
  fileNameEl.style.color = "";

  const oldSize = fileInfoEl.querySelector(".file-size");
  if (oldSize) oldSize.remove();

  const sizeSpan = document.createElement("span");
  sizeSpan.className = "file-size";
  sizeSpan.textContent = formatSize(file.size);
  fileInfoEl.appendChild(sizeSpan);

  // Activar botón
  analyzeBtn.disabled = false;
  analyzeBtn.setAttribute("aria-disabled", "false");

  // Limpiar resultados anteriores
  panelRight.innerHTML = `
    <div class="empty-state">
      <p class="empty-text" style="color:var(--text-muted)">Imagen cargada — presiona <em>Analizar</em> para continuar</p>
    </div>
  `;
}

/* Clic en el área */
imageInput.addEventListener("change", () => handleFile(imageInput.files[0]));
uploadZone.addEventListener("click", () => imageInput.click());
uploadZone.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") imageInput.click(); });

/* Arrastrar y soltar */
uploadZone.addEventListener("dragover", e => {
  e.preventDefault();
  uploadZone.classList.add("dragging");
});

uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragging"));

uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadZone.classList.remove("dragging");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const dt = new DataTransfer();
    dt.items.add(file);
    imageInput.files = dt.files;
    handleFile(file);
  }
});

/* ─── Renderizado de estados ─── */

function renderLoading() {
  panelRight.innerHTML = `
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner-ring" aria-hidden="true"></div>
      <div class="loading-text">ANALIZANDO IMAGEN...</div>
    </div>
  `;
}

function renderResults(data) {
  const envaseOk   = data.envase_correcto;
  const llena      = data.botella_llena;
  const aprobado   = data.producto_aprobado;

  const pEnvase   = (data.prob_envase   * 100).toFixed(1);
  const pBotella  = (data.prob_botella  * 100).toFixed(1);
  const pProducto = (data.prob_producto * 100).toFixed(1);

  const iconCheck = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00e5a0"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

  const iconX = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>`;

  panelRight.innerHTML = `
    <div class="section-label">Resultados de inspección</div>

    <div class="results-grid">

      <div class="metric-card">
        <div class="metric-label">Estado del envase</div>
        <div class="metric-value ${envaseOk ? "ok" : "bad"}">${envaseOk ? "Correcto" : "Defectuoso"}</div>
        <div class="conf-bar-bg">
          <div class="conf-bar ${envaseOk ? "" : "bad"}" style="width:${pEnvase}%"></div>
        </div>
        <div class="conf-text">Confianza: ${pEnvase}%</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Nivel de llenado</div>
        <div class="metric-value ${llena ? "ok" : "bad"}">${llena ? "Llena" : "Vacía"}</div>
        <div class="conf-bar-bg">
          <div class="conf-bar ${llena ? "" : "bad"}" style="width:${pBotella}%"></div>
        </div>
        <div class="conf-text">Confianza: ${pBotella}%</div>
      </div>

      <div class="metric-card full">
        <div class="metric-label">Resultado del producto</div>
        <div class="metric-value ${aprobado ? "ok" : "bad"}" style="font-size:22px">
          ${aprobado ? "Aprobado" : "Rechazado"}
        </div>
        <div class="conf-bar-bg">
          <div class="conf-bar ${aprobado ? "" : "bad"}" style="width:${pProducto}%"></div>
        </div>
        <div class="conf-text">Confianza: ${pProducto}%</div>
      </div>

    </div>

    <div class="verdict-card ${aprobado ? "aprobado" : "rechazado"}" role="alert">
      <div class="verdict-icon">${aprobado ? iconCheck : iconX}</div>
      <div>
        <div class="verdict-title">
          ${aprobado ? "Aprobado para distribución" : "Rechazado — Requiere revisión"}
        </div>
        <p class="verdict-desc">
          ${aprobado
            ? "El producto cumple todos los criterios de calidad."
            : "El producto no cumple los estándares. Se debe retirar de la línea de producción."}
        </p>
      </div>
    </div>
  `;
}

function renderError(msg) {
  panelRight.innerHTML = `
    <div class="error-state" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           style="flex-shrink:0" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8"  x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      ${msg || "Error al conectar con la API. Verifica tu conexión e inténtalo de nuevo."}
    </div>
  `;
}

/* ─── Envío principal ─── */

async function enviarImagen() {
  const file = imageInput.files[0];
  if (!file) return;

  analyzeBtn.disabled = true;
  analyzeBtn.setAttribute("aria-disabled", "true");
  renderLoading();

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(API_URL, { method: "POST", body: formData });

    if (!response.ok) {
      throw new Error(`Error del servidor: HTTP ${response.status}`);
    }

    const data = await response.json();
    renderResults(data);

  } catch (error) {
    renderError("Error al conectar con la API: " + error.message);
    console.error("[LIMPIAUSOS]", error);

  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.setAttribute("aria-disabled", "false");
  }
}