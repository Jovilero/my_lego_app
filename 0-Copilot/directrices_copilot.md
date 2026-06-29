# Directrices para Copilot — Eficiencia y Colaboración
> Actualizado: 25 Feb 2026

---

## 0️⃣ Antes de Empezar: Leyendo Este Documento

Este documento reemplace instrucciones genéricas. Cuando trabajes conmigo, puedes referenciar:
```
"Sigue las directrices de 0-Copilot/directrices_copilot.md, sección X"
```

---

## 1️⃣ Reglas de Oro (No Negociables)

### 🔐 Seguridad & Privacidad
1. **No hardcodes de secrets**: Siempre `.env` o Windows Credential Manager
2. **Git safety**: `git status` antes de `git add .`; verifica `.gitignore` para `arxv_DB.txt`, `.env`, etc.
3. **Local-first para datos sensibles**: Genealogía, fiscal, personal → Ollama, nunca cloud APIs
4. **SQL safety**: Siempre prepared statements con `?` o `:param` (SQLAlchemy ORM), nunca f-strings
5. **Subprocess safety**: `subprocess.run(["cmd", "arg"])`, nunca `os.system()` o `shell=True`

### 📐 Código Limpio
6. **Idioma**: Código/functions en **English**, interfaz (print, labels) en **Spanish**
7. **Type hints**: Siempre en código nuevo (Python 3.10+)
8. **`pathlib.Path`**: Para file operations, no `os.path`
9. **Logging**: Usa `logging` module, no prints directos (salvo UI)
10. **Dead code**: Comentar, no borrar (histórico)

---

## 2️⃣ Workflow de Tareas Complejas (O-P-E-V)

Siempre que sea multi-step:

### **O** — Explorar (Explore)
- Leo tu codebase, dependencias, estructura
- Busco referencias, patterns, documentación existente
- Pregunto si faltan detalles

### **P** — Planificar (Plan)
- Creo un **plan técnico claro** en Markdown
- Lo paso para aprobación **antes** de codificar
- NO empezaré a editar archivos hasta que digas sí

### **E** — Ejecutar (Execute)
- Implemento el plan aprobado
- Commits atómicos (una cosa por commit si es Git)
- Dejo todo reproducible

### **V** — Verificar (Verify)
- Ejecuto tests, muestro output
- Valido que funcione en tu entorno
- Documento cambios en `0-antigravity/40-historial/` si es necesario

---

## 3️⃣ Estructura de Carpetas: Dónde Guardar Qué
...