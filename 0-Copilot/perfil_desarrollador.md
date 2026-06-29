# Perfil del Desarrollador — juanj
> Análisis generado: 25 Feb 2026

## Resumen Ejecutivo

Eres un **desarrollador full-stack enfocado en Python**, con proyectos que abarcan web scraping, análisis de datos, genealogía, y **IA local (Ollama)**. Tu arquitectura es pragmática: minimizas dependencias externas mediante procesamiento local, mantienes una estructura Git bien documentada, y priorizas la privacidad de datos.

**Madurez del código**: Mezcla de MVPs ágiles y proyectos en producción con arquitectura profesional.

---

## Stack Tecnológico Identificado

### Lenguajes (por uso)
| Lenguaje | Uso Principal | Carpetas |
|----------|--------------|----------|
| **Python** | 85% del codebase | `1-RepositoriosGIT/`, `2-Genealogia/`, scripts varios |
| **C++** | Herramientas especializadas | `CC++/` |
| **Rust** | Experimental / Cargo | `.cargo/` |
| **SQL** | Análisis de BDs | `2-Genealogia/`, `*.sql` files |
| **Node.js** | Pruebas/Experimentación | `nodeJStest/` |
| **Docker** | Despliegue contenido | Dockerfiles en repos |

### Frameworks & Librerías (Python)
| Framework | Proyectos | Estado |
|-----------|-----------|--------|
| **Flask** | `xA-Scraper` | ✅ Activo, producción |
| **SQLAlchemy** | `xA-Scraper`, scrapers | ✅ En uso |
| **Pandas** | Análisis de datos | ✅ Genealogía, Censos |
| **Requests** | Web scraping | ✅ Múltiples proyectos |
| **Ollama API** | `3-Genealogia_ollama` | ✅ In-house, local |
| **pytesseract/OCR** | `2-Genealogia/OCR.py` | ✅ Activo para docs |
| **Selenium** | Probable en scrapers | 🟡 Posible |

### Bases de Datos
- **PostgreSQL** (instalado localmente en PATH)
- **SQLite** (probable en algunos proyectos)
- **MongoDB** (carpeta `mongodb/`, estado unclear)

### Infraestructura & DevOps
- **Windows 11** (sistema operativo)
- **Git** (control de versiones, repositorios en `1-RepositoriosGIT/`)
- **Docker** (soporte básico para deployments)
- **Ollama** (en `C:\Users\juanj\AppData\Local\Programs\Ollama`)
  - Modelos activos: `qwen2.5-coder:14b`, `llama3.1`
- **JDK 21** (Java development, uso unclear)

---

## Proyectos Activos (Por Importancia)

### 🟢 Tier 1: Producción/Activos

#### 1. **3-Genealogia_ollama**
- **Descripción**: Análisis de BDs SQL genealógicas con IA local
- **Stack**: Python + Ollama (qwen2.5-coder:14b) + Regex
- **Características**: Resume system, log detallado, procesamiento chunked
- **Patrón**: Local-first, privacidad, sin APIs externas
- **Madurez**: Nivel 3-4 (producción, documentado)
- **Tu rol**: Probablemente principal, diseño arquitectónico avanzado
...