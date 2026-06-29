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
