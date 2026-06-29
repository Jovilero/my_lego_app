# Plan de Implementación: Lego Offline Parts Tracker (Enfoque Iterativo con PoC)

Aplicación web PWA (Progressive Web App) de cliente puro, **libre de Node.js/NPM y de cualquier dependencia externa**. Diseñada bajo principios de seguridad por diseño, mitigando los riesgos del OWASP Top 10 y funcionando 100% offline en el dispositivo móvil.

Priorizaremos el desarrollo mediante una **Prueba de Concepto (PoC)** iterativa para validar la usabilidad en el Samsung A54 antes de implementar la persistencia avanzada y el Service Worker.

---

## Memoria del Proyecto (`PROJECT_MEMORY.md`)

Registramos la idea de este proyecto para el contexto permanente:
- **Objetivo**: Permitir al usuario consultar las piezas de un set de Lego y gestionar su inventario local en la tienda sin conexión a internet.
- **Flujo de inventario**:
  - Las cantidades de piezas son números enteros $\ge 1$.
  - Cada pieza tiene: Foto, Cantidad Total, Cantidad que Tengo, Cantidad que Falta (Faltan = Total - Tengo), Color, Descripción y Número de pieza.
  - Al aumentar "Tengo", "Faltan" disminuye. Si "Faltan" es 0, la pieza se completa.
- **Dispositivo objetivo**: Samsung A54 (Android).
- **Arquitectura sin dependencias**:
  - **Frontend**: HTML5, Vanilla CSS (estética premium, adaptado a táctil) y JavaScript ES6+ nativo sin empaquetadores.
  - **Persistencia (Final)**: `IndexedDB` mediante una interfaz nativa en JS.
  - **Persistencia (PoC)**: Estado en memoria / `localStorage` temporal para pruebas rápidas.
  - **Servidor local**: Servidor ligero nativo de Python (`python -m http.server 8000`) usado para la transferencia e instalación inicial de la PWA en el móvil.

---

## Análisis y Auditoría de Ciberseguridad (Alineado con OWASP)

Para garantizar la máxima seguridad y privacidad del usuario (local-first), auditamos y aplicamos medidas de mitigación basadas en el **OWASP Top 10** aplicable a PWAs y aplicaciones móviles:

1. **Inyección de Código y Cross-Site Scripting (XSS) - *OWASP A03:2021***: No se usará `innerHTML`. El parser extraerá texto plano y construirá el DOM mediante `textContent` y `createElement`.
2. **Configuración de Seguridad Incorrecta - CSP - *OWASP A05:2021***: CSP estricta mediante etiquetas `<meta>` para restringir scripts locales y limitar conexiones/imágenes a `cdn.rebrickable.com` y `rebrickable.com`.
3. **Almacenamiento Inseguro de Datos - *OWASP Mobile M2***: Sandbox de `IndexedDB`/`localStorage` protegido por Same-Origin Policy.
4. **Vulnerabilidades en Componentes de Terceros - *OWASP A06:2021***: Cero dependencias de NPM.

---

## Plan de Trabajo (Pasos de Ejecución)

### FASE 0: Prueba de Concepto (PoC) Interactivas - [ESTADO: Pendiente]
1. **Crear `index.html` y `css/styles.css` (PoC)**: Diseñar una interfaz limpia, adaptada a pantallas táctiles (Samsung A54), con el maquetado de las piezas y los botones de incremento/decremento de gran tamaño para facilitar su uso con el pulgar.
2. **Implementar Parser en Caliente (`js/app.js` - PoC)**: Lógica en JS para cargar el archivo HTML de Rebrickable y procesar la tabla de piezas en memoria.
3. **Persistencia Temporal**: Guardar temporalmente el progreso en el estado de la página o `localStorage` para que no se pierda al recargar durante las pruebas iniciales.
4. **Validación del Usuario**: El usuario prueba la PoC desde su PC o móvil usando el servidor temporal de Python (`start.bat` / `start.sh`) e itera sobre el diseño de la interfaz y la respuesta táctil.

### FASE 1: Estructura Git e Inicialización
1. Copiar carpetas `06-configuracion` y `0-Copilot` de `plantillas-juanj` a `my_lego_app`.
2. Inicializar repositorio Git local en `my_lego_app` y realizar el primer commit de la PoC.
3. Crear archivo `PROJECT_MEMORY.md` y `.gitignore`.

### FASE 2: Persistencia Robusta y Funcionamiento Offline
1. **Base de Datos (`js/db.js`)**: Migrar de `localStorage` a `IndexedDB` nativo para soportar múltiples sets de gran tamaño de forma eficiente.
2. **Service Worker (`sw.js`)**: Implementar el Service Worker con estrategia **Cache-First** para los recursos locales de la app y las imágenes del CDN de Rebrickable (utilizando respuestas opacas para mitigar restricciones de CORS).

### FASE 3: Suite de Tests Completa (Funcionales y Seguridad)
1. Escribir las pruebas unitarias en `tests/tests.js` y la interfaz visual de pruebas en `tests/index.html`.
2. Incluir los tests de sanitización XSS, validación de dominios de imágenes, validación de CSP y sanitización de IndexedDB.

---

## Plan de Verificación de la PoC

### Verificación Manual
1. Levantar el servidor local con `start.bat` (servidor de Python).
2. Entrar desde el móvil, cargar el HTML de Rebrickable provisto y comprobar:
   - Que las piezas se listan correctamente con su imagen, color, descripción e identificador.
   - Que los botones de sumar/restar piezas son cómodos en el Samsung A54.
   - Que al cambiar "Tengo", el contador "Faltan" se actualiza al instante y se resalta visualmente cuando llega a 0 (completado).
