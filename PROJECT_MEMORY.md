# Memoria del Proyecto: Lego Offline Parts Tracker

## 1. Idea del Proyecto y Requerimientos
- **Objetivo**: Aplicación cómoda para usar en tiendas de Lego sin conexión a internet, que permite verificar las piezas de un set, ver cuáles se tienen y cuáles faltan.
- **Flujo de Inventario**:
  - Cantidades de piezas: Números enteros $\ge 1$.
  - Cada pieza incluye: Foto, Cantidad Total, Cantidad que Tengo (inicia en 0), Cantidad que Falta (Faltan = Total - Tengo), Color, Descripción e Identificador de pieza.
  - Al aumentar "Tengo", "Faltan" disminuye. Si "Faltan" llega a 0, la pieza se marca como completada.
- **Dispositivo Objetivo**: Samsung A54 (Android). Debe optimizarse para interacción táctil y móvil.

## 2. Decisiones de Arquitectura y Diseño
- **Cliente Puro (No-Server)**: No se requiere backend permanente ni bases de datos en red. La app se ejecuta 100% en el dispositivo del usuario.
- **Sin NPM (Seguridad por Diseño)**: Se prohíbe el uso de Node.js/NPM para evitar vulnerabilidades en la cadena de suministro.
- **Tecnologías**: HTML5, Vanilla CSS (estilo moderno con gradientes y modo oscuro) y Vanilla JS (ES6+) nativo.
- **Persistencia**:
  - *PoC*: Estado en memoria y `localStorage`.
  - *Producción*: `IndexedDB` nativo.
- **Caché Offline**: Service Worker con estrategia *Cache-First* e interceptación de imágenes del CDN de Rebrickable para almacenamiento en caché opaco (mitigando CORS).
- **Despliegue**: Servidor de desarrollo temporal con Python (`python -m http.server 8000`) usado para la instalación inicial en la red local. Opcionalmente, despliegue en GitHub Pages para HTTPS directo y gratuito.

## 3. Auditoría de Ciberseguridad e Integración OWASP
- **XSS (OWASP A03:2021)**: Sanitización absoluta del HTML de Rebrickable. No se utiliza `innerHTML` para renderizar datos importados; se emplean `textContent` y `document.createElement`.
- **Configuración de Seguridad (OWASP A05:2021)**: Content Security Policy (CSP) estricta implementada vía etiqueta `<meta>`.
- **Validación de Recursos**: Las URLs de imágenes extraídas del HTML son validadas contra una lista blanca (`cdn.rebrickable.com`, `rebrickable.com`) antes de asignarse a las etiquetas `<img>`.
- **Integridad de Datos**: Los datos en IndexedDB se sanitizan para ajustarse estrictamente al esquema esperado, mitigando riesgos de inyección de propiedades u objetos maliciosos.

---

## 4. Estado Actual y Progreso (29 de junio de 2026)

### ✅ Fase 0 (Prueba de Concepto - PoC) - COMPLETADA & ITERADA
- Diseñada la interfaz táctil premium optimizada para el Samsung A54 en [index.html](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/index.html) y [css/styles.css](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/css/styles.css).
- Implementado el parser seguro y la lógica de contadores en [js/app.js](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/js/app.js).
- **Iteración 1**: Corregido el bug del reinicio de scroll al actualizar contadores (+1/-1) mediante actualización selectiva de nodos en el DOM.
- **Iteración 2**: Añadida la importación directa de listas de piezas pegando el enlace de Rebrickable (usando un proxy CORS de cliente seguro: `api.allorigins.win`).
- Creado el [manifest.json](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/manifest.json) y el logo vectorial en [img/logo.svg](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/img/logo.svg).
- Implementado el Service Worker nativo [sw.js](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/sw.js) para soporte offline.
- **Despliegue**: Sincronizado en GitHub ([github.com/Jovilero/my_lego_app](https://github.com/Jovilero/my_lego_app)) y publicado automáticamente con HTTPS en **GitHub Pages** ([jovilero.github.io/my_lego_app](https://jovilero.github.io/my_lego_app/)).

---

## 5. Siguientes Pasos (Próxima Sesión)

### 1. Feedback de Usabilidad
- Esperar el feedback del usuario tras probar la PoC en su móvil con el set de ejemplo para ajustar el tamaño de los botones de contadores, transiciones, colores o comportamiento de la lista de piezas.

### 2. Implementar la Persistencia Definitiva (IndexedDB)
- Desarrollar `js/db.js` para reemplazar `localStorage` por `IndexedDB`.
- Esto permitirá gestionar múltiples sets, almacenar miles de piezas de forma eficiente y evitar el límite de 5MB de `localStorage`.

### 3. Refinamiento de Caché Offline
- Verificar y optimizar el comportamiento del almacenamiento en caché del Service Worker para garantizar la disponibilidad del 100% de las imágenes de las piezas en el sótano de la tienda (modo 100% offline).

### 4. Suite de Tests Automatizados y de Seguridad
- Crear [tests/index.html](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/tests/index.html) y [tests/tests.js](file:///a:/3-Ocio/4-Programacion/1-RepositoriosGIT/my_lego_app/tests/tests.js) para ejecutar pruebas unitarias en el navegador.
- Implementar los tests de ciberseguridad (XSS con payloads maliciosos, validación de dominios de imágenes, directivas CSP).

---

## 6. Futuras Mejoras / Backlog (Anotado para el futuro)
- **Migración a App Nativa de Android (Kotlin + Jetpack Compose)**:
  - Diseñar la app de forma nativa en Kotlin para Android.
  - Usar la base de datos local **Room** (SQLite nativo) para el almacenamiento persistente de sets y piezas.
  - Esto eliminará por completo las restricciones de CORS del navegador, permitiendo a la app descargar directamente los HTMLs y las imágenes desde los servidores de Rebrickable sin necesidad de proxies intermedios.
  - Integrar la **API oficial de Rebrickable** usando la clave de API gratuita del usuario para permitir la búsqueda directa de sets por número dentro de la aplicación.
