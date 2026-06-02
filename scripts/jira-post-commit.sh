#!/bin/bash
# Hook post-commit → crea issue en Jira automáticamente

ROOT=$(git rev-parse --show-toplevel)
ENV_FILE="$ROOT/.env.jira"

if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
fi

JIRA_URL="https://raccoonnow.atlassian.net"
JIRA_EMAIL="raccoonitweb@gmail.com"
JIRA_PROJECT="NA"

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
  ISSUE_TYPE="Bug"
else
  ISSUE_TYPE="Task"
fi

HTTP_CODE=$(curl -s -o /tmp/jira_resp.json -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -u "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_URL}/rest/api/3/issue" \
  -d "{
    \"fields\": {
      \"project\": { \"key\": \"${JIRA_PROJECT}\" },
      \"summary\": \"${SAFE_MSG}\",
      \"description\": {
        \"type\": \"doc\",
        \"version\": 1,
        \"content\": [{
          \"type\": \"paragraph\",
          \"content\": [{
            \"type\": \"text\",
            \"text\": \"Branch: ${BRANCH} | Commit: ${COMMIT_HASH} | Autor: ${AUTHOR}\"
          }]
        }]
      },
      \"issuetype\": { \"name\": \"${ISSUE_TYPE}\" }
    }
  }")

if [ "$HTTP_CODE" = "201" ]; then
  KEY=$(grep -o '"key":"[^"]*"' /tmp/jira_resp.json | head -1 | cut -d'"' -f4)
  echo "✅ Jira: issue creado → ${JIRA_URL}/browse/${KEY}"
else
  echo "⚠️  Jira: no se pudo crear el issue (HTTP ${HTTP_CODE})"
  cat /tmp/jira_resp.json 2>/dev/null
fi

exit 0
