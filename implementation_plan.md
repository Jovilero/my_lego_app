# Plan de Implementación: Lego Offline Parts Tracker

Aplicación web offline (PWA) diseñada para visualizar piezas de sets de Lego en una tienda sin conexión a internet. Permite importar sets de Lego (a partir de HTMLs de Rebrickable), mostrar las piezas con sus imágenes, descripciones y colores, y llevar un control de inventario ("Tengo" / "Faltan").

---

## Memoria del Proyecto (`PROJECT_MEMORY.md`)

Registramos la idea de este proyecto para el contexto permanente de los agentes:
- **Objetivo**: Ayudar al usuario en la tienda de Lego a verificar qué piezas de un set le faltan, sin necesidad de conexión a internet.
- **Flujo de inventario**:
  - Las cantidades de piezas son números enteros positivos $\ge 1$.
  - Cada pieza tiene: Foto, Cantidad Total, Cantidad que Tengo, Cantidad que Falta (Faltan = Total - Tengo), Color (nombre/código), Descripción y Número de pieza.
  - Al incrementar "Tengo", "Faltan" disminuye. Si "Faltan" llega a 0, la pieza está completada.
- **Dispositivo objetivo**: Samsung A54 (Android). Debe ser cómodo para uso táctil en movilidad.
- **Arquitectura propuesta**:
  1. **Scraper / Procesador (Python)**: Script local que procesa el HTML de Rebrickable, descarga las imágenes de las piezas localmente y empaqueta todo en un único archivo JSON con las imágenes codificadas en Base64. Esto evita problemas de CORS en el móvil y garantiza que las fotos estén 100% disponibles offline.
  2. **Frontend (PWA - HTML5/Vanilla CSS/JavaScript)**: Aplicación web progresiva ultra-ligera y con estética premium (modo oscuro, gradientes, micro-animaciones). Usa **IndexedDB** para almacenar los sets y el progreso localmente. Se instala en el Samsung A54 como app nativa.
  3. **Docker**: Contenedor para servir la PWA localmente y facilitar su acceso desde el móvil en la red local para la instalación inicial.

---

## Preguntas Abiertas & Peticiones al Usuario

> [!IMPORTANT]
> 1. **HTML de Ejemplo**: Por favor, facilítanos un archivo HTML de ejemplo descargado de Rebrickable (puedes guardarlo en la raíz de `my_lego_app` o pasárnoslo) para que podamos diseñar el parser exacto.
> 2. **Confirmación de Arquitectura**: ¿Te parece bien la arquitectura híbrida (Procesador Python en PC $\rightarrow$ JSON con Base64 $\rightarrow$ PWA en móvil)? Creemos que es la más robusta para asegurar que las imágenes funcionen offline sin problemas de CORS.

---

## Cambios Propuestos

### Estructura de Carpetas del Proyecto

```
my_lego_app/
├── 0-Copilot/                  # Copiado de plantillas-juanj
├── 06-configuracion/           # Copiado de plantillas-juanj
├── PROJECT_MEMORY.md           # [NEW] Memoria del proyecto
├── docker-compose.yml          # [NEW] Orquestación Docker para desarrollo/producción
├── start.sh                    # [NEW] Script de arranque y tests (Linux/WSL)
├── start.bat                   # [NEW] Script de arranque y tests (Windows)
├── scraper/                    # [NEW] Procesador del HTML de Rebrickable
│   ├── src/
│   │   ├── __init__.py
│   │   ├── parser.py           # Parser del HTML y descargador de imágenes
│   │   └── main.py             # CLI del procesador
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_parser.py      # Tests unitarios del parser
│   ├── requirements.txt        # Dependencias de Python (BeautifulSoup4, requests, etc.)
│   └── Dockerfile              # Dockerfile para ejecutar el scraper en contenedor
├── frontend/                   # [NEW] Aplicación PWA
│   ├── index.html              # Estructura principal
│   ├── css/
│   │   └── style.css           # Estilos premium (Vanilla CSS, dark mode, responsive)
│   ├── js/
│   │   ├── app.js              # Lógica de la aplicación y gestión de IndexedDB
│   │   └── sw.js               # Service Worker para funcionamiento offline
│   ├── manifest.json           # Configuración de PWA para instalación en Android
│   ├── tests/
│   │   └── app.test.js         # Tests de lógica del frontend
│   └── Dockerfile              # Servidor Nginx para la PWA
```

---

## Plan de Trabajo (Pasos de Ejecución)

### Fase 1: Inicialización y Configuración
1. Copiar carpetas `06-configuracion` y `0-Copilot` de `plantillas-juanj` a `my_lego_app`.
2. Inicializar repositorio Git local en `my_lego_app`.
3. Crear archivo `PROJECT_MEMORY.md` y `.gitignore` configurado adecuadamente.
4. Realizar el primer commit descriptivo en la rama `main` (o crear la estructura Gitflow si se prefiere).

### Fase 2: Desarrollo del Scraper (Python)
1. Crear el entorno virtual de Python en `scraper/.venv`.
2. Implementar `parser.py` para extraer los datos del HTML de Rebrickable.
3. Implementar la descarga de imágenes y conversión a Base64.
4. Escribir tests unitarios en `scraper/tests/test_parser.py`.
5. Crear el `Dockerfile` para el scraper.

### Fase 3: Desarrollo del Frontend (PWA)
1. Crear `index.html` con estructura semántica y accesible.
2. Desarrollar `css/style.css` con diseño premium, responsivo y adaptado para móviles (táctil).
3. Desarrollar `js/app.js` usando IndexedDB para guardar el estado de las piezas y los sets.
4. Implementar el Service Worker `js/sw.js` y el `manifest.json`.
5. Desarrollar tests unitarios para la lógica del checklist.
6. Crear el `Dockerfile` de Nginx para servir la app.

### Fase 4: Integración, Docker y Scripts
1. Crear `docker-compose.yml` para levantar el servidor web del frontend.
2. Crear `start.sh` y `start.bat` para automatizar la ejecución de tests y el levantamiento de la aplicación.
3. Realizar pruebas de camino crítico.

---

## Plan de Verificación

### Pruebas Automatizadas
- **Python (Scraper)**: Ejecutar `pytest` para verificar el correcto parseo del HTML y la generación del JSON.
- **Frontend (JavaScript)**: Tests unitarios de la lógica de contadores y almacenamiento con un entorno de test de JS (como Jest o un script de test simple e independiente).

### Verificación Manual
- Cargar el HTML de ejemplo en el scraper, generar el JSON.
- Levantar la app con Docker.
- Acceder desde el móvil Samsung A54 a la IP local de la máquina, instalar la PWA.
- Importar el JSON en la app móvil.
- Desconectar el móvil de la red (modo avión) y comprobar que:
  - La app carga y es funcional.
  - Se ven las imágenes de las piezas.
  - Los contadores de "Tengo" y "Faltan" funcionan correctamente y se guardan al recargar la página.
