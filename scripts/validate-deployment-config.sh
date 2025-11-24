#!/bin/bash
# Deployment Configuration Validation Script
# This script validates that the deployment configuration is correct before actual deployment

# Don't exit on first error - we want to see all validation results
set +e

echo "🔍 Validating Cloud Run Deployment Configuration..."
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Function to print success
success() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

# Function to print failure
failure() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARN++))
}

echo "=== Checking GitHub Actions Workflow Configuration ==="
echo ""

# Check if deploy-only.yml exists
if [ -f ".github/workflows/deploy-only.yml" ]; then
    success "deploy-only.yml exists"
else
    failure "deploy-only.yml not found"
fi

# Check for staging substitutions
if grep -q "_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING" .github/workflows/deploy-only.yml; then
    success "Staging uses correct secret name: DATABASE_URL_STAGING (uppercase)"
else
    failure "Staging secret name should be DATABASE_URL_STAGING (uppercase)"
fi

if grep -q "_DATABASE_URL_SECRET_VERSION=3" .github/workflows/deploy-only.yml; then
    success "Staging includes DATABASE_URL_SECRET_VERSION=3"
else
    failure "Staging missing DATABASE_URL_SECRET_VERSION"
fi

if grep -q "_JWT_SECRET_NAME=JWT_SECRET_STAGING" .github/workflows/deploy-only.yml; then
    success "Staging uses correct JWT_SECRET_STAGING"
else
    failure "Staging should use JWT_SECRET_STAGING"
fi

if grep -q "_JWT_SECRET_VERSION=1" .github/workflows/deploy-only.yml; then
    success "Staging includes JWT_SECRET_VERSION"
else
    failure "Staging missing JWT_SECRET_VERSION"
fi

# Check for production substitutions
if grep -q "_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-prod-db" .github/workflows/deploy-only.yml; then
    success "Production includes Cloud SQL connection name"
else
    failure "Production missing Cloud SQL connection name"
fi

if grep -q "_CORS_ORIGIN=https://mycats-pro-frontend-518939509282.asia-northeast1.run.app" .github/workflows/deploy-only.yml; then
    success "Production includes CORS origin"
else
    failure "Production missing CORS origin"
fi

if grep -q "_DATABASE_URL_SECRET_NAME=DATABASE_URL,_DATABASE_URL_SECRET_VERSION=1" .github/workflows/deploy-only.yml; then
    success "Production includes DATABASE_URL secret with version"
else
    failure "Production missing DATABASE_URL secret configuration"
fi

echo ""
echo "=== Checking cloudbuild.yaml Configuration ==="
echo ""

# Check if cloudbuild.yaml exists
if [ -f "cloudbuild.yaml" ]; then
    success "cloudbuild.yaml exists"
else
    failure "cloudbuild.yaml not found"
fi

# Check for correct env vars syntax
if grep -q 'NODE_ENV=\${_ENVIRONMENT}' cloudbuild.yaml; then
    success "cloudbuild.yaml uses NODE_ENV=\${_ENVIRONMENT}"
else
    failure "cloudbuild.yaml NODE_ENV syntax incorrect"
fi

# Check for set-secrets syntax
if grep -q 'DATABASE_URL=\${_DATABASE_URL_SECRET_NAME}:\${_DATABASE_URL_SECRET_VERSION}' cloudbuild.yaml; then
    success "cloudbuild.yaml uses correct secret mounting syntax"
else
    failure "cloudbuild.yaml secret syntax incorrect"
fi

echo ""
echo "=== Checking Backend Environment Validation ==="
echo ""

# Check if env.validation.ts exists and includes 'staging'
if [ -f "backend/src/common/config/env.validation.ts" ]; then
    success "env.validation.ts exists"
    
    if grep -q "z.enum(\['development', 'staging', 'production', 'test'\])" backend/src/common/config/env.validation.ts; then
        success "env.validation.ts includes 'staging' in NODE_ENV enum"
    else
        failure "env.validation.ts missing 'staging' in NODE_ENV enum"
    fi
else
    failure "env.validation.ts not found"
fi

# Check old validation file
if [ -f "backend/src/common/environment.validation.ts" ]; then
    if grep -q '"development", "staging", "production", "test"' backend/src/common/environment.validation.ts; then
        success "environment.validation.ts includes 'staging'"
    else
        warning "environment.validation.ts may need 'staging' update"
    fi
fi

echo ""
echo "=== Checking YAML Syntax ==="
echo ""

# Check if yamllint is available
if command -v yamllint &> /dev/null; then
    if yamllint -d "{extends: relaxed, rules: {line-length: disable}}" .github/workflows/deploy-only.yml > /dev/null 2>&1; then
        success "deploy-only.yml YAML syntax is valid"
    else
        failure "deploy-only.yml has YAML syntax errors"
    fi
    
    if yamllint -d "{extends: relaxed, rules: {line-length: disable}}" cloudbuild.yaml > /dev/null 2>&1; then
        success "cloudbuild.yaml YAML syntax is valid"
    else
        failure "cloudbuild.yaml has YAML syntax errors"
    fi
else
    warning "yamllint not available, skipping YAML validation"
fi

echo ""
echo "=== Summary ==="
echo ""
echo -e "${GREEN}Passed: $PASS${NC}"
if [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $WARN${NC}"
fi
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL${NC}"
fi

echo ""
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed! Configuration looks good.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review and fix the issues above.${NC}"
    exit 1
fi
