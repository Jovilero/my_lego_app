# ✅ Checklist de Inicio de Sesión

**LEER ESTO AL PRINCIPIO DE CADA SESIÓN**

Este archivo es tu acceso directo a las reglas y configuración. **NO OMITIR**.

---

## 🔴 REGLAS DE ORO (No Negociables)

Antes de escribir código, verifica:

### 🔐 Seguridad & Privacidad
- [ ] ¿Hay **secrets hardcodeados**? → Usar `.env` o Windows Credential Manager
- [ ] ¿Voy a hacer `git add .`? → Revisar `.gitignore` (sensibles: `arxv_DB.txt`, `.env`, `.keys`)
- [ ] ¿Es código local-first?** → Genealogía, fiscal, personal → **Ollama local**, nunca cloud APIs
- [ ] ¿Tengo SQL crudo?** → Prepared statements SIEMPRE (`?` o `:param` con SQLAlchemy), NUNCA f-strings

### 📐 Código Limpio
- [ ] ¿Código en English, interfaz (print, labels) en Spanish?**
- [ ] ¿Nuevas funciones tiene type hints?** (Python 3.10+)
- [ ] ¿Uso `pathlib.Path` para file ops?** (no `os.path`)
- [ ] ¿Logging con `logging` module?** (no prints directos salvo UI)
- [ ] ¿Subprocess con lista, NO `shell=True` o `os.system()`?**

---

## 🎯 Workflow: O-P-E-V

Para **tareas complejas multi-step**:

### **O** — Exploración
Analizo tu codebase, busco referencias, patterns

### **P** — Planificación
Creo plan técnico en Markdown → Te pido aprobación ANTES de editar

### **E** — Ejecución
Implemento plan aprobado → Commits atómicos

### **V** — Verificación
Ejecuto tests, valido output, documento cambios

---

## 📂 Estructura de Carpetas Clave

### `0-Copilot/` (REFERENCIA)
```
0-Copilot/
├── directrices_copilot.md          ← DETALLES COMPLETOS (abrir si necesitas profundidad)
├── perfil_desarrollador.md         ← Tu análisis como dev
├── instrucciones.md                ← Qué soy y configuración
├── hardware_config.md              ← Optimización para tu RTX 4070
└── stack_tecnologico.md            ← Tu tech stack actual
```

**Ubicación**: `A:\3-Ocio\4-Programacion\0-Copilot\`

### `0-antigravity/` (HISTORIAL OFICIAL)
...