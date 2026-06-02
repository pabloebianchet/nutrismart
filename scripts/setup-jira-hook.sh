#!/bin/bash
# Instala el hook post-commit de Jira en este repositorio

ROOT=$(git rev-parse --show-toplevel)
HOOK_FILE="$ROOT/.git/hooks/post-commit"

cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)
bash "$ROOT/scripts/jira-post-commit.sh"
EOF

chmod +x "$HOOK_FILE"
echo "✅ Hook instalado en .git/hooks/post-commit"

if [ ! -f "$ROOT/.env.jira" ]; then
  echo ""
  echo "⚠️  Falta configurar el token:"
  echo "   1. Copiá .env.jira.example → .env.jira"
  echo "   2. Reemplazá 'tu_token_aqui' con tu API token de Jira"
  echo "   → https://id.atlassian.com/manage-profile/security/api-tokens"
fi
