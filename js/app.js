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
  filterSelect: document.getElementById('filter-select'),
  
  // Importación por URL (Comentado temporalmente)
  // rebrickableUrlInput: document.getElementById('rebrickable-url-input'),
  // btnImportUrl: document.getElementById('btn-import-url'),

  // Importación por API
  btnToggleConfig: document.getElementById('btn-toggle-config'),
  configPanel: document.getElementById('config-panel'),
  apiKeyInput: document.getElementById('api-key-input'),
  btnSaveKey: document.getElementById('btn-save-key'),
  setNumberInput: document.getElementById('set-number-input'),
  btnImportApi: document.getElementById('btn-import-api'),

  // Gestión Multi-Set
  setSelector: document.getElementById('set-selector'),
  savedSetsWrapper: document.getElementById('saved-sets-wrapper'),
  btnDeleteSet: document.getElementById('btn-delete-set')
};

// Variable para almacenar la API Key en memoria activa
let rebrickableApiKey = '';

// 3. Inicialización y Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadApiKey();
  // Rellenar el selector al iniciar, pero mantener la app vacía por defecto
  updateSetSelector();
  registerServiceWorker();
});

function setupEventListeners() {
  // Carga de archivo
  elements.fileInput.addEventListener('change', handleFileSelect);
  
  // Importación por URL (Comentado temporalmente)
  // elements.btnImportUrl.addEventListener('click', handleUrlImport);

  // Importación por API y Configuración
  elements.btnToggleConfig.addEventListener('click', toggleConfigPanel);
  elements.btnSaveKey.addEventListener('click', saveApiKey);
  elements.btnImportApi.addEventListener('click', handleApiImport);

  // Selección y gestión de sets
  elements.setSelector.addEventListener('change', handleSetChange);
  elements.btnDeleteSet.addEventListener('click', deleteCurrentSet);
  
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
    
    // Buscar filas de la tabla de piezas
    const rows = doc.querySelectorAll('table tbody tr');
    if (rows.length === 0) {
      // Verificar si hay indicios de bloqueo de seguridad / Cloudflare
      const textLower = htmlText.toLowerCase();
      if (textLower.includes('cloudflare') || textLower.includes('captcha') || textLower.includes('attention required') || textLower.includes('security check')) {
        alert('Error de Seguridad (Cloudflare):\n\nRebrickable está bloqueando la descarga automatizada de esta página.\n\nPor favor, utiliza la opción "Descarga directa por API" (configurando tu API Key gratis) o sube el archivo HTML guardado localmente desde tu PC.');
      } else {
        alert('No se encontraron piezas en el archivo HTML. Asegúrate de que es una exportación de Rebrickable válida.');
      }
      return;
    }

    // Obtener título del set
    let setTitleText = 'Set Importado';
    const titleElement = doc.querySelector('title');
    if (titleElement && titleElement.textContent) {
      setTitleText = titleElement.textContent.trim().replace(/^Parts\s*-\s*/i, '');
    } else {
      setTitleText = filename.replace(/\.html$/i, '').replace(/^Parts\s*-\s*/i, '');
    }

    const parsedParts = [];
    
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return; // Fila incompleta

      // 1. Extraer Imagen de forma segura y validar origen
      const imgElement = cells[0].querySelector('img');
      let imageUrl = '';
      if (imgElement) {
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

    // Si ya existía este set en localStorage, preguntar si se desea conservar o sobreescribir
    if (localStorage.getItem(`lego_set_${currentSet.id}`)) {
      if (!confirm('Este set ya se encuentra importado. ¿Deseas sobreescribirlo y reiniciar todo el progreso?')) {
        // Cargar el set que ya existía en lugar del nuevo
        loadActiveSetFromStorage(currentSet.id);
        return;
      }
    }
    
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

function loadActiveSetFromStorage(forceId = null) {
  const activeId = forceId || localStorage.getItem('lego_active_set_id');
  if (!activeId) {
    updateUI(); // Asegura mostrar estado vacío si no hay sets
    return;
  }

  const setData = localStorage.getItem(`lego_set_${activeId}`);
  if (setData) {
    currentSet = JSON.parse(setData);
    localStorage.setItem('lego_active_set_id', currentSet.id);
    updateUI();
  } else {
    // Si la clave no existe, limpiar el ID activo y actualizar UI
    localStorage.removeItem('lego_active_set_id');
    currentSet = { id: '', title: '', parts: [] };
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
    // Limpiar listado
    while (elements.partsListSection.firstChild) {
      elements.partsListSection.removeChild(elements.partsListSection.firstChild);
    }
    elements.partsListSection.appendChild(elements.emptyState);
    return;
  }

  elements.setTitle.textContent = currentSet.title;
  elements.importSection.style.display = 'block';
  elements.statsSection.style.display = 'block';
  elements.emptyState.style.display = 'none';

  calculateStatsAndProgress();
  updateSetSelector(); // Actualizar el desplegable
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
    card.setAttribute('data-id', part.id); // Identificador único para actualizaciones del DOM
    
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
      img.setAttribute('loading', 'lazy'); // Carga perezosa para evitar error 429 (Too Many Requests) en el CDN
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
    // Usamos el color hex exacto si fue provisto por la API, si no, el mapa de fallback
    colorDot.style.backgroundColor = part.colorHex || LEGO_COLORS[colorKey] || '#888888';
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
    // Usamos spans con clases para poder actualizarlos de manera selectiva sin redibujar
    counterStats.innerHTML = `Tengo: <strong class="val-have">${part.have}</strong> / ${part.quantity}<br>Faltan: <strong class="val-missing">${missingCount}</strong>`;
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
    
    // Actualización selectiva del DOM para evitar perder la posición del scroll
    const cardElement = document.querySelector(`[data-id="${partId}"]`);
    if (cardElement) {
      // 1. Actualizar valores en el bloque de estadísticas de la tarjeta
      const valHaveSpan = cardElement.querySelector('.val-have');
      const valMissingSpan = cardElement.querySelector('.val-missing');
      const counterValueSpan = cardElement.querySelector('.counter-value');
      
      if (valHaveSpan) valHaveSpan.textContent = part.have;
      if (valMissingSpan) valMissingSpan.textContent = Math.max(0, part.quantity - part.have);
      if (counterValueSpan) counterValueSpan.textContent = part.have;
      
      // 2. Actualizar estado visual de completado
      if (part.have === part.quantity) {
        cardElement.classList.add('completed');
      } else {
        cardElement.classList.remove('completed');
      }
    }

    // 3. Actualizar el texto del set activo en el selector superior en tiempo real
    const activeOption = elements.setSelector.querySelector(`option[value="${currentSet.id}"]`);
    if (activeOption) {
      let total = 0;
      let owned = 0;
      currentSet.parts.forEach(p => {
        total += p.quantity;
        owned += p.have;
      });
      activeOption.textContent = `${currentSet.title} — ${owned}/${total}`;
    }
  }
}

// 8. Importación por URL desde Rebrickable usando un proxy CORS seguro (allorigins)
function handleUrlImport() {
  const urlInput = elements.rebrickableUrlInput.value.trim();
  if (!urlInput) {
    alert('Por favor, introduce una URL válida de Rebrickable.');
    return;
  }

  // Validar que sea un dominio de Rebrickable
  try {
    const parsedUrl = new URL(urlInput);
    if (!parsedUrl.hostname.includes('rebrickable.com')) {
      alert('La URL debe ser del dominio rebrickable.com');
      return;
    }
  } catch (e) {
    alert('Introduce una URL válida completa (ej: https://rebrickable.com/...)');
    return;
  }

  // Cambiar estado del botón para feedback visual
  const originalText = elements.btnImportUrl.textContent;
  elements.btnImportUrl.textContent = 'Importando...';
  elements.btnImportUrl.disabled = true;

  // Usar el proxy CORS público y gratuito allorigins para descargar el HTML crudo
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput)}`;

  fetch(proxyUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error en el servidor proxy (status: ${response.status})`);
      }
      return response.text();
    })
    .then(htmlText => {
      // Verificar si la respuesta devuelta por el proxy es vacía o tiene Cloudflare
      const textLower = htmlText.toLowerCase();
      if (!htmlText || textLower.includes('cloudflare') || textLower.includes('captcha') || textLower.includes('security check')) {
        throw new Error('Bloqueo de seguridad de Rebrickable (Cloudflare)');
      }
      
      // Procesar el HTML descargado
      parseRebrickableHTML(htmlText, 'Set desde Enlace');
      elements.rebrickableUrlInput.value = ''; // Limpiar campo
    })
    .catch(error => {
      console.error('Error al importar desde la URL:', error);
      if (error.message.includes('Cloudflare')) {
        alert('Error de Seguridad (Cloudflare):\n\nRebrickable ha bloqueado la descarga del HTML. Cloudflare impide las peticiones automatizadas de webs externas.\n\nPor favor, usa la "Descarga directa por API" (configurando tu API Key gratis) o sube el archivo HTML guardado en tu PC.');
      } else {
        alert('No se pudo descargar la lista de piezas. Verifica tu conexión a internet o la URL introducida.');
      }
    })
    .finally(() => {
      // Restaurar estado del botón
      elements.btnImportUrl.textContent = originalText;
      elements.btnImportUrl.disabled = false;
    });
}

// 9. Lógica de la API oficial de Rebrickable
function loadApiKey() {
  const savedKey = localStorage.getItem('rebrickable_api_key');
  if (savedKey) {
    rebrickableApiKey = savedKey;
    elements.apiKeyInput.value = savedKey;
  }
}

function toggleConfigPanel() {
  const isHidden = elements.configPanel.style.display === 'none';
  elements.configPanel.style.display = isHidden ? 'block' : 'none';
}

function saveApiKey() {
  const key = elements.apiKeyInput.value.trim();
  if (!key) {
    alert('Introduce una clave válida.');
    return;
  }
  
  localStorage.setItem('rebrickable_api_key', key);
  rebrickableApiKey = key;
  alert('API Key guardada correctamente.');
  elements.configPanel.style.display = 'none';
}

async function handleApiImport() {
  const setNum = elements.setNumberInput.value.trim();
  if (!setNum) {
    alert('Introduce un número de set válido (ej: 9497-1).');
    return;
  }

  if (!rebrickableApiKey) {
    alert('Por favor, configura tu API Key de Rebrickable primero haciendo clic en el botón de Configuración ⚙️.');
    elements.configPanel.style.display = 'block';
    return;
  }

  const originalText = elements.btnImportApi.textContent;
  elements.btnImportApi.textContent = 'Descargando...';
  elements.btnImportApi.disabled = true;

  try {
    const result = await fetchSetFromRebrickable(setNum, rebrickableApiKey);

    // Si ya existe en local, preguntar sobreescritura
    const targetId = encodeURIComponent(result.title);
    if (localStorage.getItem(`lego_set_${targetId}`)) {
      if (!confirm('Este set ya se encuentra importado. ¿Deseas sobreescribirlo y reiniciar todo el progreso?')) {
        loadActiveSetFromStorage(targetId);
        elements.setNumberInput.value = '';
        return;
      }
    }
    
    // Mapear los resultados de la API a nuestro formato interno
    const parsedParts = result.parts.map((item, index) => {
      const part = item.part;
      const color = item.color;
      
      const rawUrl = part.part_img_url || item.element_img_url || '';
      const imageUrl = validateAndSanitizeUrl(rawUrl);

      return {
        id: `${part.part_num}_${color.name.replace(/\s+/g, '_')}_${index}`,
        partNum: part.part_num,
        quantity: item.quantity,
        color: color.name,
        colorHex: color.rgb ? `#${color.rgb}` : null, // Guardamos el color exacto
        description: part.name,
        imageUrl: imageUrl,
        have: 0
      };
    });

    // Guardar en el estado del set activo
    currentSet = {
      id: targetId,
      title: result.title,
      parts: parsedParts
    };

    // Guardar
    saveSetToStorage();
    updateUI();
    
    elements.setNumberInput.value = ''; // Limpiar input
    
  } catch (error) {
    console.error('Error al descargar set por API:', error);
    let errorMsg = error.message;
    // Si el set no existe y no tiene guión, sugerir el sufijo de versión (-1)
    if (error.message.includes('no existe') && !setNum.includes('-')) {
      errorMsg += `.\n\nSugerencia: Rebrickable requiere el número de versión. Intenta buscando "${setNum}-1" en lugar de "${setNum}".`;
    }
    alert(`Error: ${errorMsg}`);
  } finally {
    elements.btnImportApi.textContent = originalText;
    elements.btnImportApi.disabled = false;
  }
}

async function fetchSetFromRebrickable(setNum, apiKey) {
  const headers = { 'Authorization': `key ${apiKey}` };
  
  // 1. Obtener detalles del set para verificar existencia y obtener nombre
  const setResponse = await fetch(`https://rebrickable.com/api/v3/lego/sets/${setNum}/`, { headers });
  if (!setResponse.ok) {
    if (setResponse.status === 401) {
      throw new Error('API Key no válida o no autorizada');
    }
    if (setResponse.status === 404) {
      throw new Error('El número de set no existe en Rebrickable');
    }
    throw new Error(`Error del servidor (${setResponse.status})`);
  }
  
  const setData = await setResponse.json();
  const setTitleText = `${setData.set_num} - ${setData.name}`;

  // 2. Descargar lista completa de piezas gestionando la paginación automáticamente
  let parts = [];
  let nextUrl = `https://rebrickable.com/api/v3/lego/sets/${setNum}/parts/?page_size=100`;

  while (nextUrl) {
    const partsResponse = await fetch(nextUrl, { headers });
    if (!partsResponse.ok) {
      throw new Error('Error al descargar las piezas del set');
    }
    
    const partsData = await partsResponse.json();
    parts = parts.concat(partsData.results);
    nextUrl = partsData.next; // URL de la siguiente página (o null si es la última)
  }

  return {
    title: setTitleText,
    parts: parts
  };
}

// 10. Gestión de Múltiples Listas e Intercambio
function getSavedSetsList() {
  const sets = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    // Filtrar claves de sets de Lego
    if (key.startsWith('lego_set_') && key !== 'lego_set_list') {
      try {
        const setData = JSON.parse(localStorage.getItem(key));
        if (setData && setData.title) {
          // Calcular estadísticas para el nombre en el desplegable
          let total = 0;
          let owned = 0;
          setData.parts.forEach(p => {
            total += p.quantity;
            owned += p.have;
          });
          sets.push({
            id: setData.id,
            title: setData.title,
            total: total,
            owned: owned
          });
        }
      } catch (e) {
        console.error('Error al parsear set guardado:', e);
      }
    }
  }
  
  // Ordenar alfabéticamente por título
  return sets.sort((a, b) => a.title.localeCompare(b.title));
}

function updateSetSelector() {
  const selector = elements.setSelector;
  selector.innerHTML = '';
  
  const savedSets = getSavedSetsList();
  
  // Si no hay sets guardados, ocultar el contenedor por completo
  if (savedSets.length === 0) {
    elements.savedSetsWrapper.style.display = 'none';
    return;
  }
  
  // Si hay sets, mostrar el contenedor del selector
  elements.savedSetsWrapper.style.display = 'block';
  
  // Añadir opción vacía de selección por defecto
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '— Selecciona un set guardado —';
  defaultOption.selected = (!currentSet.id);
  selector.appendChild(defaultOption);
  
  savedSets.forEach(set => {
    const option = document.createElement('option');
    option.value = set.id;
    // Formato: "Número del set - piezastengo/piezastotales"
    option.textContent = `${set.title} — ${set.owned}/${set.total}`;
    if (set.id === currentSet.id) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
}

function handleSetChange(event) {
  const selectedId = event.target.value;
  if (!selectedId) {
    // Si selecciona la opción vacía, limpiar el estado activo y mostrar pantalla vacía
    localStorage.removeItem('lego_active_set_id');
    currentSet = { id: '', title: '', parts: [] };
    updateUI();
    return;
  }
  loadActiveSetFromStorage(selectedId);
}

function deleteCurrentSet() {
  if (!currentSet.id) return;
  
  const confirmMsg = `¿Seguro que quieres eliminar el set "${currentSet.title}" de forma permanente?\n\nEsta acción borrará todo tu progreso.`;
  
  if (confirm(confirmMsg)) {
    localStorage.removeItem(`lego_set_${currentSet.id}`);
    localStorage.removeItem('lego_active_set_id');
    
    // Limpiar estado
    currentSet = { id: '', title: '', parts: [] };
    
    // Actualizar selector y UI
    updateSetSelector();
    updateUI();
    
    alert('Set eliminado correctamente.');
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
