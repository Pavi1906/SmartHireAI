#!/usr/bin/env bash
set -euo pipefail

ART_DIR="/Users/pavithra/Desktop/SmartHireAI-Project/artifacts/phase6"
mkdir -p "$ART_DIR"
TS=$(date +%s)
EMAIL_A="test_student_A_${TS}@example.com"
EMAIL_B="test_student_B_${TS}@example.com"
PASS="TestPass123!"

# Register Student A (ignore body)
REG_CODE_A=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:8000/api/v1/auth/student/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PASS\",\"full_name\":\"Student A\",\"college\":\"TestCollege\",\"graduation_year\":2025,\"branch\":\"CS\"}")
# Login Student A and capture token
LOGIN_RESP_A=$(curl -s -w "\n%{http_code}" -X POST http://127.0.0.1:8000/api/v1/auth/student/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PASS\"}")
CODE_LOGIN_A=$(printf "%s" "$LOGIN_RESP_A" | tail -n1)
BODY_LOGIN_A=$(printf "%s" "$LOGIN_RESP_A" | sed '$d')
TOKEN_A=$(printf "%s" "$BODY_LOGIN_A" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token',''))")

# Register Student B
REG_CODE_B=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:8000/api/v1/auth/student/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_B\",\"password\":\"$PASS\",\"full_name\":\"Student B\",\"college\":\"TestCollege\",\"graduation_year\":2025,\"branch\":\"CS\"}")
# Login Student B and capture token
LOGIN_RESP_B=$(curl -s -w "\n%{http_code}" -X POST http://127.0.0.1:8000/api/v1/auth/student/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_B\",\"password\":\"$PASS\"}")
CODE_LOGIN_B=$(printf "%s" "$LOGIN_RESP_B" | tail -n1)
BODY_LOGIN_B=$(printf "%s" "$LOGIN_RESP_B" | sed '$d')
TOKEN_B=$(printf "%s" "$BODY_LOGIN_B" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token',''))")

# Save summary (no tokens) to artifact
cat > "$ART_DIR/student_accounts.txt" <<EOF
Student A Email: $EMAIL_A
Student A Register HTTP: $REG_CODE_A
Student A Login HTTP: $CODE_LOGIN_A
Student B Email: $EMAIL_B
Student B Register HTTP: $REG_CODE_B
Student B Login HTTP: $CODE_LOGIN_B
EOF

# Store tokens temporarily for later use (not persisted as artifact)
printf "%s" "$TOKEN_A" > /tmp/token_A_phase6.txt
printf "%s" "$TOKEN_B" > /tmp/token_B_phase6.txt

echo "Students created; tokens stored in /tmp"
