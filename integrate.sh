#!/usr/bin/env bash
set -euo pipefail

# Config
BASE_BRANCH="main"
INTEGRATOR_BRANCH="feature-integrator"
FEATURES=(${@:-feature-backend feature-economy feature-mechanics feature-frontend})

need_clean_tree() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ Hay cambios sin commit. Haz commit o stash antes de continuar."
    exit 1
  fi
}
exist_branch() {
  git show-ref --verify --quiet "refs/heads/$1"
}

echo "⚓ PirateWorld Integrator"
echo "→ Base: $BASE_BRANCH"
echo "→ Integrator: $INTEGRATOR_BRANCH"
echo "→ Features: ${FEATURES[*]}"
echo

need_clean_tree

echo "🔄 Actualizando $BASE_BRANCH…"
git checkout "$BASE_BRANCH"
git pull --ff-only

echo "🌱 Creando/Reseteando $INTEGRATOR_BRANCH desde $BASE_BRANCH…"
git checkout -B "$INTEGRATOR_BRANCH"
git push -u origin "$INTEGRATOR_BRANCH" || true

for FEAT in "${FEATURES[@]}"; do
  echo
  echo "➕ Integrando $FEAT → $INTEGRATOR_BRANCH"
  if ! exist_branch "$FEAT"; then
    echo "  ⚠️ Rama '$FEAT' no existe localmente. Intentando fetch…"
    git fetch origin "$FEAT":"$FEAT" || {
      echo "  ❌ No pude traer '$FEAT' desde origin. Sáltandola."
      continue
    }
  fi

  need_clean_tree
  git checkout "$INTEGRATOR_BRANCH"
  set +e
  git merge --no-ff "$FEAT" -m "Merge $FEAT into $INTEGRATOR_BRANCH"
  MERGE_STATUS=$?
  set -e

  if [[ $MERGE_STATUS -ne 0 ]]; then
    echo "  ⚠️ Conflictos detectados. Resuélvelos, luego:"
    echo "     git add . && git commit"
    echo "     bash integrate.sh ${FEATURES[@]}"
    exit 1
  fi

  echo "  ✅ $FEAT integrado."
  git push
done

echo
echo "🧪 Instalando deps (por si acaso) y recordatorio de pruebas locales…"
npm install >/dev/null 2>&1 || true
echo "  → Corre 'npm run dev' para validar manualmente."

echo
echo "✅ Integrator listo. Siguiente:"
echo "   vercel --yes          # Preview de feature-integrator"
echo "   (si todo ok)"
echo "   git checkout main && git pull"
echo "   git merge --no-ff feature-integrator -m \"Release from integrator\" && git push"
echo "   vercel --prod --yes"
