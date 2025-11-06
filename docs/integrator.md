# PirateWorld — Guía de Integración (`feature-integrator`)

## Objetivo
`feature-integrator` es la rama “mesa de mezclas”. Aquí unimos trabajo de:
- `feature-backend`
- `feature-economy`
- `feature-mechanics`
- `feature-frontend`

Se usa para **revisar en conjunto** antes de promover a `main`.

---

## Micro-mejoras (reglas rápidas)
- **Protege `main`:** parte SIEMPRE de `main` limpio antes de resetear `feature-integrator`.
- **Árbol limpio:** no hagas merges con cambios sin commit/stash.
- **Logs claros:** usa mensajes de merge consistentes; si quieres, agrega tag de pre-release.

---

## Flujo recomendado

### 1) Preparar integrator desde `main`
```bash
git checkout main
git pull
git checkout -B feature-integrator
git push -u origin feature-integrator


# 1) Crear carpeta docs si no existe
mkdir -p docs

# 2) Guarda el texto que pegaste como docs/integrator.md
# (pégalo desde el editor en esa ruta)

# 3) (Opcional pero recomendado) agrega el script 1-click en la raíz
# archivo: integrate.sh  (con el contenido que te pasé)
chmod +x integrate.sh

# 4) Commit + push
git add docs/integrator.md integrate.sh
git commit -m "docs: integrator guide + integrate.sh (1-click integration)"
git push
