/* Lego Parts Tracker - Lógica de la Aplicación (PoC) */

// 1. Estado Global de la Aplicación
let currentSet = {
  id: '',
  title: '',
  parts: [] // Array de objetos { partNum, quantity, color, description, imageUrl, have }
};

// Mapeo de colores comunes de Lego a valores Hexadecimales para la interfaz
const LEGO_COLORS = {
  'black': '#05131d',
  'white': '#f2f3f2',
  'red': '#c91a09',
  'blue': '#0055a2',
  'yellow': '#f4d03f',
  'green': '#237841',
  'dark bluish gray': '#5c5d5e',
  'light bluish gray': '#a0a2a4',
  'dark gray': '#3e3e3e',
  'light gray': '#9c9c9c',
  'reddish brown': '#5c3526',
  'brown': '#482a1b',
  'dark brown': '#372115',
  'orange': '#e76318',
  'lime': '#bbe90b',
  'tan': '#dfd5ae',
  'dark tan': '#958a73',
  'sand green': '#708e7a',
  'sand blue': '#5e748c',
  'trans-red': 'rgba(201, 26, 9, 0.7)',
  'trans-light blue': 'rgba(174, 219, 240, 0.7)',
  'trans-clear': 'rgba(255, 255, 255, 0.3)',
  'trans-yellow': 'rgba(244, 208, 63, 0.7)',
  'trans-green': 'rgba(35, 120, 65, 0.7)',
  'trans-neon orange': 'rgba(255, 95, 0, 0.8)',
  'trans-neon green': 'rgba(0, 255, 0, 0.8)',
  'dark blue': '#14304f',
  'medium blue': '#478cc6',
  'bright light blue': '#9fc3e9',
  'dark red': '#720e18',
  'flat silver': '#899395',
  'pearl gold': '#aa7f2a',
  'metallic silver': '#a5a9b4',
  'glow in dark opaque': '#d9f5d9'
};

// 2. Inicialización de Elementos del DOM
const elements = {
  fileInput: document.getElementById('html-file-input'),
  fileNameDisplay: document.getElementById('file-name-display'),
  importSection: document.getElementById('import-section'),
  statsSection: document.getElementById('stats-section'),
  partsListSection: document.getElementById('parts-list-section'),
  emptyState: document.getElementById('empty-state'),
  setTitle: document.getElementById('set-title'),
  btnResetSet: document.getElementById('btn-reset-set'),
  
  // Estadísticas
  statTotalParts: document.getElementById('stat-total-parts'),
  statOwnedParts: document.getElementById('stat-owned-parts'),
  statMissingParts: document.getElementById('stat-missing-parts'),
  statProgressPercent: document.getElementById('stat-progress-percent'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  
  // Filtros
  searchInput: document.getElementById('search-input'),
  filterSelect: document.getElementById('filter-select')
};

// 3. Inicialización y Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadActiveSetFromStorage();
  registerServiceWorker();
});

function setupEventListeners() {
  // Carga de archivo
  elements.fileInput.addEventListener('change', handleFileSelect);
  
  // Controles de filtros
  elements.searchInput.addEventListener('input', renderPartsList);
  elements.filterSelect.addEventListener('change', renderPartsList);
  
  // Botón reiniciar set
  elements.btnResetSet.addEventListener('click', resetCurrentSetProgress);
}

// 4. Lógica de Negocio: Parsear el HTML de Rebrickable de forma segura (Mitigación XSS - OWASP)
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  elements.fileNameDisplay.textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    const htmlContent = e.target.result;
    parseRebrickableHTML(htmlContent, file.name);
  };
  reader.readAsText(file);
}

function parseRebrickableHTML(htmlText, filename) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    // Obtener título del set
    let setTitleText = 'Set Importado';
    const titleElement = doc.querySelector('title');
    if (titleElement && titleElement.textContent) {
      setTitleText = titleElement.textContent.trim().replace(/^Parts\s*-\s*/i, '');
    } else {
      // Fallback usando el nombre del archivo
      setTitleText = filename.replace(/\.html$/i, '').replace(/^Parts\s*-\s*/i, '');
    }

    // Buscar filas de la tabla de piezas
    const rows = doc.querySelectorAll('table tbody tr');
    if (rows.length === 0) {
      alert('No se encontraron piezas en el archivo HTML. Asegúrate de que es una exportación de Rebrickable válida.');
      return;
    }

    const parsedParts = [];
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return; // Fila incompleta

      // 1. Extraer Imagen de forma segura y validar origen
      const imgElement = cells[0].querySelector('img');
      let imageUrl = '';
      if (imgElement) {
        // data-src suele ser la imagen real en rebrickable (con lazy load)
        const rawUrl = imgElement.getAttribute('data-src') || imgElement.getAttribute('src') || '';
        imageUrl = validateAndSanitizeUrl(rawUrl);
      }

      // 2. Extraer metadatos en texto plano (Previene XSS)
      const partNum = cells[1].textContent.trim();
      const quantity = parseInt(cells[2].textContent.trim(), 10) || 1;
      const color = cells[3].textContent.trim();
      const description = cells[4].textContent.trim();

      // Las cantidades deben ser estrictamente positivas mayores de 1
      if (quantity < 1) return;

      parsedParts.push({
        id: `${partNum}_${color.replace(/\s+/g, '_')}_${index}`, // ID único local
        partNum: partNum,
        quantity: quantity,
        color: color,
        description: description,
        imageUrl: imageUrl,
        have: 0 // Valor inicial
      });
    });

    // Crear el set y guardar en estado
    currentSet = {
      id: encodeURIComponent(setTitleText),
      title: setTitleText,
      parts: parsedParts
    };

    // Si ya existía este set en localStorage, recuperar el progreso ("have")
    restoreProgressFromStorage();
    
    // Guardar en Storage
    saveSetToStorage();
    
    // Actualizar UI
    updateUI();
  } catch (error) {
    console.error('Error al parsear el HTML:', error);
    alert('Ocurrió un error al procesar el archivo. Revisa la consola.');
  }
}

// Validación y saneamiento estricto de URLs (OWASP)
function validateAndSanitizeUrl(url) {
  if (!url) return '';
  
  // Si es un placeholder local o base64 seguro
  if (url.startsWith('data:image/')) return url;
  if (url.startsWith('./') || url.startsWith('img/')) return url;

  try {
    const parsedUrl = new URL(url);
    // Lista blanca de dominios para imágenes
    const allowedHosts = ['cdn.rebrickable.com', 'rebrickable.com'];
    if (allowedHosts.includes(parsedUrl.hostname)) {
      return parsedUrl.href;
    }
  } catch (e) {
    // Si no es una URL absoluta válida, no la permitimos
  }

  // Si no cumple, devolvemos vacío (se usará un marcador local)
  return '';
}

// 5. Gestión del Almacenamiento (LocalStorage en PoC)
function saveSetToStorage() {
  if (!currentSet.title) return;
  localStorage.setItem(`lego_set_${currentSet.id}`, JSON.stringify(currentSet));
  localStorage.setItem('lego_active_set_id', currentSet.id);
}

function loadActiveSetFromStorage() {
  const activeId = localStorage.getItem('lego_active_set_id');
  if (!activeId) return;

  const setData = localStorage.getItem(`lego_set_${activeId}`);
  if (setData) {
    currentSet = JSON.parse(setData);
    updateUI();
  }
}

function restoreProgressFromStorage() {
  const storedData = localStorage.getItem(`lego_set_${currentSet.id}`);
  if (!storedData) return;

  const storedSet = JSON.parse(storedData);
  const progressMap = {};
  
  // Mapear el progreso anterior por número de pieza y color
  storedSet.parts.forEach(part => {
    const key = `${part.partNum}_${part.color}`;
    progressMap[key] = part.have;
  });

  // Aplicar el progreso al nuevo set importado
  currentSet.parts.forEach(part => {
    const key = `${part.partNum}_${part.color}`;
    if (progressMap[key] !== undefined) {
      part.have = Math.min(part.have + progressMap[key], part.quantity);
    }
  });
}

function resetCurrentSetProgress() {
  if (!currentSet.title) return;
  if (confirm('¿Seguro que quieres reiniciar el progreso de este set a 0?')) {
    currentSet.parts.forEach(part => {
      part.have = 0;
    });
    saveSetToStorage();
    updateUI();
  }
}

// 6. Actualización de la Interfaz (UI)
function updateUI() {
  if (!currentSet.title) {
    elements.importSection.style.display = 'block';
    elements.statsSection.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.setTitle.textContent = currentSet.title;
  elements.importSection.style.display = 'block'; // Permitir importar otro set encima
  elements.statsSection.style.display = 'block';
  elements.emptyState.style.display = 'none';

  calculateStatsAndProgress();
  renderPartsList();
}

function calculateStatsAndProgress() {
  let total = 0;
  let owned = 0;

  currentSet.parts.forEach(part => {
    total += part.quantity;
    owned += part.have;
  });

  const missing = Math.max(0, total - owned);
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  // Actualizar valores de texto
  elements.statTotalParts.textContent = total;
  elements.statOwnedParts.textContent = owned;
  elements.statMissingParts.textContent = missing;
  elements.statProgressPercent.textContent = `${percent}%`;

  // Actualizar barra de progreso
  elements.progressBarFill.style.width = `${percent}%`;
}

// 7. Renderizado Seguro del Listado (Mitigación XSS - OWASP)
function renderPartsList() {
  const container = elements.partsListSection;
  
  // Limpiar contenedor eliminando elementos (seguro y rápido)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (!currentSet.parts || currentSet.parts.length === 0) {
    container.appendChild(elements.emptyState);
    return;
  }

  const searchQuery = elements.searchInput.value.toLowerCase().trim();
  const filterValue = elements.filterSelect.value; // 'all', 'missing', 'completed'

  const filteredParts = currentSet.parts.filter(part => {
    // Filtro de búsqueda por texto
    const matchesSearch = part.description.toLowerCase().includes(searchQuery) || 
                          part.partNum.toLowerCase().includes(searchQuery) ||
                          part.color.toLowerCase().includes(searchQuery);
    
    // Filtro de estado
    const isMissing = part.have < part.quantity;
    let matchesFilter = true;
    if (filterValue === 'missing') {
      matchesFilter = isMissing;
    } else if (filterValue === 'completed') {
      matchesFilter = !isMissing;
    }

    return matchesSearch && matchesFilter;
  });

  if (filteredParts.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'empty-state';
    noResults.innerHTML = `
      <div class="empty-state-icon">🔍</div>
      <h3>Sin resultados</h3>
      <p>No hay piezas que coincidan con tu búsqueda o filtros.</p>
    `;
    container.appendChild(noResults);
    return;
  }

  // Generar tarjetas de piezas usando métodos del DOM seguros (Cero innerHTML para datos del usuario)
  filteredParts.forEach(part => {
    const card = document.createElement('div');
    card.className = 'part-item-card';
    if (part.have === part.quantity) {
      card.classList.add('completed');
    }

    // Contenedor de la Imagen
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'part-img-wrapper';

    if (part.imageUrl) {
      const img = document.createElement('img');
      img.className = 'part-img';
      img.alt = part.description;
      // Asignar src (ya fue validado por validateAndSanitizeUrl al importar)
      img.src = part.imageUrl;
      // Fallback si la imagen no carga
      img.onerror = () => {
        imgWrapper.removeChild(img);
        imgWrapper.appendChild(createImageFallback(part.partNum));
      };
      imgWrapper.appendChild(img);
    } else {
      imgWrapper.appendChild(createImageFallback(part.partNum));
    }

    // Contenedor de Detalles
    const details = document.createElement('div');
    details.className = 'part-details';

    // Descripción
    const desc = document.createElement('h3');
    desc.className = 'part-desc';
    desc.textContent = part.description;
    details.appendChild(desc);

    // Metadatos (Número y Color)
    const meta = document.createElement('div');
    meta.className = 'part-meta';

    const numSpan = document.createElement('span');
    numSpan.className = 'meta-num';
    numSpan.textContent = `#${part.partNum}`;
    meta.appendChild(numSpan);

    const colorSpan = document.createElement('span');
    colorSpan.className = 'meta-color';
    
    // Indicador visual de color
    const colorDot = document.createElement('span');
    colorDot.className = 'color-dot';
    const colorKey = part.color.toLowerCase();
    colorDot.style.backgroundColor = LEGO_COLORS[colorKey] || '#888888';
    colorSpan.appendChild(colorDot);

    const colorText = document.createTextNode(` ${part.color}`);
    colorSpan.appendChild(colorText);
    meta.appendChild(colorSpan);
    
    details.appendChild(meta);

    // Sección de Contador e Inventario
    const counterSection = document.createElement('div');
    counterSection.className = 'part-counter-section';

    const counterStats = document.createElement('div');
    counterStats.className = 'counter-stats';
    
    const missingCount = Math.max(0, part.quantity - part.have);
    counterStats.innerHTML = `Tengo: <strong>${part.have}</strong> / ${part.quantity}<br>Faltan: <strong>${missingCount}</strong>`;
    counterSection.appendChild(counterStats);

    const counterControls = document.createElement('div');
    counterControls.className = 'counter-controls';

    // Botón restar
    const btnMinus = document.createElement('button');
    btnMinus.className = 'btn-counter';
    btnMinus.textContent = '-';
    btnMinus.setAttribute('aria-label', 'Restar una pieza');
    btnMinus.onclick = () => updatePartQuantity(part.id, -1);
    counterControls.appendChild(btnMinus);

    const valSpan = document.createElement('span');
    valSpan.className = 'counter-value';
    valSpan.textContent = part.have;
    counterControls.appendChild(valSpan);

    // Botón sumar
    const btnPlus = document.createElement('button');
    btnPlus.className = 'btn-counter';
    btnPlus.textContent = '+';
    btnPlus.setAttribute('aria-label', 'Sumar una pieza');
    btnPlus.onclick = () => updatePartQuantity(part.id, 1);
    counterControls.appendChild(btnPlus);

    counterSection.appendChild(counterControls);
    details.appendChild(counterSection);

    card.appendChild(imgWrapper);
    card.appendChild(details);
    container.appendChild(card);
  });
}

function createImageFallback(partNum) {
  const fallback = document.createElement('div');
  fallback.className = 'part-img-fallback';
  fallback.textContent = '🧩';
  return fallback;
}

function updatePartQuantity(partId, change) {
  const partIndex = currentSet.parts.findIndex(p => p.id === partId);
  if (partIndex === -1) return;

  const part = currentSet.parts[partIndex];
  const newHave = part.have + change;

  // Límite entre 0 y el total de piezas del set
  if (newHave >= 0 && newHave <= part.quantity) {
    part.have = newHave;
    saveSetToStorage();
    calculateStatsAndProgress();
    
    // Volver a renderizar la lista manteniendo el estado visual
    renderPartsList();
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('[Service Worker] Registrado con éxito:', reg.scope))
        .catch(err => console.error('[Service Worker] Error al registrar:', err));
    });
  }
}
