#!/bin/bash
# Hook post-commit → crea issue en Jira con titulo y descripcion detallada

ROOT=$(git rev-parse --show-toplevel)
ENV_FILE="$ROOT/.env.jira"

if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

JIRA_URL="https://raccoonnow.atlassian.net"
JIRA_EMAIL="raccoonitweb@gmail.com"
JIRA_PROJECT="NA"
BOARD_ID="2"

if [ -z "$JIRA_API_TOKEN" ]; then
  echo "ℹ️  Jira: JIRA_API_TOKEN no configurado — saltando"
  exit 0
fi

# Generar titulo y descripcion con el script Python
ANALYSIS=$(python3 "$ROOT/scripts/jira-build-description.py" 2>/dev/null \
  || python "$ROOT/scripts/jira-build-description.py" 2>/dev/null)

if [ -z "$ANALYSIS" ]; then
  echo "⚠️  Jira: no se pudo analizar el commit"
  exit 0
fi

TITLE=$(echo "$ANALYSIS" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])" 2>/dev/null \
      || echo "$ANALYSIS" | python -c "import sys,json; print(json.load(sys.stdin)['title'])")

DESCRIPTION=$(echo "$ANALYSIS" | python3 -c "import sys,json; import json as j; print(j.dumps(json.load(sys.stdin)['description']))" 2>/dev/null \
            || echo "$ANALYSIS" | python -c "import sys,json; import json as j; print(j.dumps(json.load(sys.stdin)['description']))")

COMMIT_MSG=$(git log -1 --pretty=%s)
if echo "$COMMIT_MSG" | grep -qi "^fix\|^bug\|^hotfix"; then
  ISSUE_TYPE="Error"
else
  ISSUE_TYPE="Tarea"
fi

SAFE_TITLE=$(echo "$TITLE" | sed 's/\\/\\\\/g; s/"/\\"/g')

# Obtener sprint activo
SPRINT_ID=$(curl -s \
  -H "Accept: application/json" \
  -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_URL}/rest/agile/1.0/board/${BOARD_ID}/sprint?state=active" \
  | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# Construir payload combinando titulo y descripcion
PAYLOAD=$(echo "$ANALYSIS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
payload = {
  'fields': {
    'project': {'key': '${JIRA_PROJECT}'},
    'summary': data['title'],
    'description': data['description'],
    'issuetype': {'name': '${ISSUE_TYPE}'}
  }
}
print(json.dumps(payload))
" 2>/dev/null || echo "$ANALYSIS" | python -c "
import sys, json
data = json.load(sys.stdin)
payload = {
  'fields': {
    'project': {'key': '${JIRA_PROJECT}'},
    'summary': data['title'],
    'description': data['description'],
    'issuetype': {'name': '${ISSUE_TYPE}'}
  }
}
print(json.dumps(payload))
")

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_URL}/rest/api/3/issue" \
  --data-binary "${PAYLOAD}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ]; then
  ISSUE_KEY=$(echo "$BODY" | grep -o '"key":"[^"]*"' | head -1 | cut -d'"' -f4)
  ISSUE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  # Agregar al sprint activo
  if [ -n "$SPRINT_ID" ] && [ -n "$ISSUE_ID" ]; then
    curl -s -o /dev/null \
      -X POST \
      -H "Content-Type: application/json" \
      -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
      "${JIRA_URL}/rest/agile/1.0/sprint/${SPRINT_ID}/issue" \
      --data-binary "{\"issues\":[\"${ISSUE_ID}\"]}"
  fi

  echo "✅ Jira: ${ISSUE_KEY} → ${JIRA_URL}/browse/${ISSUE_KEY}"
else
  echo "⚠️  Jira: error HTTP ${HTTP_CODE} — ${BODY}"
fi

exit 0
