# Directrices de Desarrollo (Referencia Sincronizada)

> **NOTA**: Esta es una copia de referencia rápida de `0-Copilot/directrices_copilot.md` (actualizado al 25 Feb 2026).
> Para detalles completos, abre el archivo original en `A:\3-Ocio\4-Programacion\0-Copilot\`

---

## 🔐 REGLAS DE ORO (No Negociables)

### Seguridad & Privacidad
1. **No hardcodes de secrets**: Siempre `.env` o Windows Credential Manager
2. **Git safety**: `git status` antes de `git add .`; verifica `.gitignore`
   - Sensibles: `arxv_DB.txt`, `.env`, `.keys`, `.credentials`
3. **Local-first para datos sensibles**: Genealogía, fiscal, personal → **Ollama local**, nunca cloud APIs
4. **SQL safety**: Prepared statements SIEMPRE (`?` o `:param` en SQLAlchemy), **NUNCA f-strings**
   ```python
   # ✅ BIEN
   session.query(User).filter(User.id == user_id).first()
   
   # ❌ MAL
   db.execute(f"SELECT * FROM users WHERE id = {user_id}")
   ```
5. **Subprocess safety**: `subprocess.run(["cmd", "arg"])`, **NUNCA `os.system()` o `shell=True`**
   ```python
   # ✅ BIEN
   subprocess.run(["python", "script.py"], cwd=path)
   
   # ❌ MAL
   os.system(f"python {script_path}")
   ```

### 📐 Código Limpio
6. **Idioma**: 
   - Código/functions → **English**
   - Interfaz (print, labels) → **Spanish**
7. **Type hints**: SIEMPRE en código nuevo (Python 3.10+)
   ```python
   def process_genealogy(data: dict[str, Any]) -> list[str]:
       ...
   ```
8. **`pathlib.Path`**: Para file operations, NUNCA `os.path`
   ```python
   # ✅ BIEN
   from pathlib import Path
   path = Path("data") / "genealogy.db"
   
   # ❌ MAL
   path = os.path.join("data", "genealogy.db")
   ```
9. **Logging**: Usa `logging` module, NO prints directos (excepto UI)
   ```python
   import logging
   logger = logging.getLogger(__name__)
   logger.info("Procesando genealogía...")
   ```
10. **Dead code**: Comentar, NO borrar (histórico)
    ```python
    # OLD: Esta lógica reemplazada por v2 en 2026-02-20
    # if old_logic:
    #     ...
    ```