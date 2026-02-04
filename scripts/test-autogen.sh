#!/bin/bash

# Test script for /api/media/autogen endpoint
# Usage: ./scripts/test-autogen.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing /api/media/autogen endpoint...${NC}\n"

# Configuration
SERVER_URL="http://localhost:8787"
ADMIN_TOKEN="change-me-admin"

# Test payload
PAYLOAD='{
  "menu": "tasting",
  "stage": "published",
  "dishId": "snack-eggshell",
  "strategy": "auto",
  "seed": 1910
}'

echo "Endpoint: ${SERVER_URL}/api/media/autogen"
echo "Method: POST"
echo "Auth: Bearer ${ADMIN_TOKEN}"
echo -e "Payload:\n${PAYLOAD}\n"

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${SERVER_URL}/api/media/autogen" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "${PAYLOAD}")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${YELLOW}Response (HTTP ${HTTP_CODE}):${NC}"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# Check if successful
if [ "$HTTP_CODE" -eq 200 ]; then
  OK=$(echo "$BODY" | jq -r '.ok' 2>/dev/null)
  if [ "$OK" = "true" ]; then
    HOTSPOTS_COUNT=$(echo "$BODY" | jq -r '.hotspotsCount' 2>/dev/null)
    echo -e "\n${GREEN}✅ Success! Generated ${HOTSPOTS_COUNT} hotspots${NC}"
    echo -e "${GREEN}Hotspots persisted to server/data/dishMedia.json${NC}"
  else
    ERROR=$(echo "$BODY" | jq -r '.error' 2>/dev/null)
    echo -e "\n${RED}❌ Failed: ${ERROR}${NC}"
  fi
else
  echo -e "\n${RED}❌ HTTP Error: ${HTTP_CODE}${NC}"
fi

echo -e "\n${YELLOW}To verify persistence:${NC}"
echo "cat server/data/dishMedia.json | jq '.menus.tasting.stages.published[\"snack-eggshell\"]'"
