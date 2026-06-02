#!/bin/bash
# Hook post-commit → crea issue en Jira y lo agrega al sprint activo

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
  echo "ℹ️  Jira: JIRA_API_TOKEN no configurado — saltando creación de issue"
  exit 0
fi

COMMIT_MSG=$(git log -1 --pretty=%s)
COMMIT_HASH=$(git log -1 --pretty=%H | cut -c1-8)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
AUTHOR=$(git log -1 --pretty=%an)
SAFE_MSG=$(echo "$COMMIT_MSG" | sed 's/\\/\\\\/g; s/"/\\"/g')

if echo "$COMMIT_MSG" | grep -qi "^fix\|^bug\|^hotfix"; then
  ISSUE_TYPE="Error"
else
  ISSUE_TYPE="Tarea"
fi

# Obtener sprint activo
SPRINT_ID=$(curl -s \
  -H "Accept: application/json" \
  -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_URL}/rest/agile/1.0/board/${BOARD_ID}/sprint?state=active" \
  | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

# Crear el issue
PAYLOAD="{\"fields\":{\"project\":{\"key\":\"${JIRA_PROJECT}\"},\"summary\":\"${SAFE_MSG}\",\"description\":{\"type\":\"doc\",\"version\":1,\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Branch: ${BRANCH} | Commit: ${COMMIT_HASH} | Autor: ${AUTHOR}\"}]}]},\"issuetype\":{\"name\":\"${ISSUE_TYPE}\"}}}"

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

  # Agregar al sprint activo si existe
  if [ -n "$SPRINT_ID" ] && [ -n "$ISSUE_ID" ]; then
    curl -s -o /dev/null \
      -X POST \
      -H "Content-Type: application/json" \
      -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
      "${JIRA_URL}/rest/agile/1.0/sprint/${SPRINT_ID}/issue" \
      --data-binary "{\"issues\":[\"${ISSUE_ID}\"]}"
  fi

  echo "✅ Jira: ${ISSUE_KEY} creado en sprint → ${JIRA_URL}/browse/${ISSUE_KEY}"
else
  echo "⚠️  Jira: no se pudo crear el issue (HTTP ${HTTP_CODE})"
fi

exit 0
