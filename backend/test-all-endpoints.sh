#!/bin/bash

# API Test Script - Hệ thống Tuyển sinh
BASE_URL="http://localhost:5000"
RESULTS_FILE="test-results.json"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize results
echo "[]" > $RESULTS_FILE

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    echo "---"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC}\n"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}\n"
        return 1
    fi
}

# Start testing
echo "=========================================="
echo "API Testing - Hệ thống Tuyển sinh"
echo "=========================================="
echo ""

# Test 1: Health Check
test_endpoint "GET" "/health" "" "Health Check"

# Test 2: Register
register_data='{
    "citizen_id": "001306651354",
    "full_name": "Nguyễn Văn A",
    "email": "test1@example.com",
    "password": "password123"
}'
test_endpoint "POST" "/api/auth/register" "$register_data" "Register New User"

# Test 3: Login
login_data='{
    "email": "test1@example.com",
    "password": "password123"
}'
test_endpoint "POST" "/api/auth/login" "$login_data" "Login User"

# Test 4: Get Universities
test_endpoint "GET" "/api/universities?page=1&limit=10" "" "Get Universities List"

# Test 5: Create University (requires auth)
uni_data='{
    "code": "TST",
    "name": "Test University",
    "address": "Test Address",
    "phone": "0123456789",
    "email": "test@uni.edu.vn",
    "website": "https://test.edu.vn",
    "description": "Test Description"
}'
test_endpoint "POST" "/api/universities" "$uni_data" "Create University (No Auth)"

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
