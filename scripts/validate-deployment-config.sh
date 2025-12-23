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

# Check for production substitutions - 独自ドメイン
if grep -q "BACKEND_URL=\"https://api.nekoya.co.jp\"" .github/workflows/deploy-only.yml; then
    success "Production uses custom domain for backend (api.nekoya.co.jp)"
else
    failure "Production missing custom domain for backend"
fi

if grep -q "FRONTEND_URL=\"https://nekoya.co.jp\"" .github/workflows/deploy-only.yml; then
    success "Production uses custom domain for frontend (nekoya.co.jp)"
else
    failure "Production missing custom domain for frontend"
fi

# Check for RESEND_API_KEY configuration
if grep -q "_RESEND_API_KEY_SECRET_NAME=RESEND_API_KEY" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes RESEND_API_KEY secret configuration"
else
    failure "deploy-only.yml missing RESEND_API_KEY secret configuration"
fi

if grep -q "_RESEND_API_KEY_SECRET_VERSION=latest" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes RESEND_API_KEY version"
else
    failure "deploy-only.yml missing RESEND_API_KEY version"
fi

# Check for EMAIL configuration
if grep -q "_EMAIL_FROM=noreply@nekoya.co.jp" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes EMAIL_FROM configuration"
else
    failure "deploy-only.yml missing EMAIL_FROM configuration"
fi

if grep -q "_EMAIL_FROM_NAME=MyCats Pro" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes EMAIL_FROM_NAME configuration"
else
    failure "deploy-only.yml missing EMAIL_FROM_NAME configuration"
fi

# Check for database secrets
if grep -q "_DATABASE_URL_SECRET_NAME=DATABASE_URL" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes DATABASE_URL secret"
else
    failure "deploy-only.yml missing DATABASE_URL secret"
fi

# Check for JWT secrets
if grep -q "_JWT_SECRET_NAME=JWT_SECRET" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes JWT_SECRET"
else
    failure "deploy-only.yml missing JWT_SECRET"
fi

if grep -q "_JWT_REFRESH_SECRET_NAME=JWT_REFRESH_SECRET" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes JWT_REFRESH_SECRET"
else
    failure "deploy-only.yml missing JWT_REFRESH_SECRET"
fi

# Check for CSRF token secret
if grep -q "_CSRF_TOKEN_SECRET_NAME=CSRF_TOKEN_SECRET" .github/workflows/deploy-only.yml; then
    success "deploy-only.yml includes CSRF_TOKEN_SECRET"
else
    failure "deploy-only.yml missing CSRF_TOKEN_SECRET"
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

# Check for set-secrets syntax including RESEND_API_KEY
if grep -q 'RESEND_API_KEY=\${_RESEND_API_KEY_SECRET_NAME}:\${_RESEND_API_KEY_SECRET_VERSION}' cloudbuild.yaml; then
    success "cloudbuild.yaml includes RESEND_API_KEY secret mounting"
else
    failure "cloudbuild.yaml missing RESEND_API_KEY secret mounting"
fi

# Check for EMAIL_FROM env var
if grep -q 'EMAIL_FROM=\${_EMAIL_FROM}' cloudbuild.yaml; then
    success "cloudbuild.yaml includes EMAIL_FROM env var"
else
    failure "cloudbuild.yaml missing EMAIL_FROM env var"
fi

# Check for EMAIL_FROM_NAME env var
if grep -q 'EMAIL_FROM_NAME=\${_EMAIL_FROM_NAME}' cloudbuild.yaml; then
    success "cloudbuild.yaml includes EMAIL_FROM_NAME env var"
else
    failure "cloudbuild.yaml missing EMAIL_FROM_NAME env var"
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
echo "=== Checking GCP Secret Manager (requires gcloud auth) ==="
echo ""

# Check if gcloud is available
if command -v gcloud &> /dev/null; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -n "$PROJECT_ID" ]; then
        echo "Project: $PROJECT_ID"
        
        # Check for required secrets
        for secret in DATABASE_URL JWT_SECRET JWT_REFRESH_SECRET CSRF_TOKEN_SECRET RESEND_API_KEY; do
            if gcloud secrets describe "$secret" --project="$PROJECT_ID" &> /dev/null; then
                success "GCP Secret exists: $secret"
            else
                failure "GCP Secret missing: $secret"
            fi
        done
    else
        warning "No GCP project configured, skipping secret validation"
    fi
else
    warning "gcloud CLI not available, skipping GCP secret validation"
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
