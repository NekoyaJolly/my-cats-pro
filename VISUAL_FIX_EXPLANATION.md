# Visual Explanation of the Fix

## Problem: NODE_ENV Receiving Multiple Values

### Before Fix ❌

```
GitHub Actions
    ↓
    --substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend-staging,
                    _FRONTEND_SERVICE_NAME=mycats-pro-frontend-staging,
                    _ENVIRONMENT=staging,
                    _DATABASE_URL_SECRET_NAME=DATABASE_URL_staging  ← lowercase!
                                                                     ← missing versions!
    ↓
Cloud Build (cloudbuild.yaml)
    ↓
    --set-env-vars "NODE_ENV=${_ENVIRONMENT},..."
    --set-secrets "DATABASE_URL=${_DATABASE_URL_SECRET_NAME}:${_DATABASE_URL_SECRET_VERSION},..."
                                                              ↑
                                                              undefined!
    ↓
Cloud Run Container
    ↓
    NODE_ENV = "staging" (correct)
    DATABASE_URL = ??? (secret not found: "DATABASE_URL_staging" doesn't exist)
    ↓
NestJS Bootstrap
    ↓
    ❌ ERROR: Secret "DATABASE_URL_staging" not found
    ❌ ERROR: NODE_ENV validation failed (container crash)
```

**Error Message:**
```
NODE_ENV: Invalid enum value. Expected 'development' | 'staging' | 'production' | 'test',
received 'staging _BACKEND_SERVICE_NAME=mycats-pro-backend-staging _FRONTEND_SERVICE_NAME=...'
```

**Why this happened:**
If `gcloud builds submit --substitutions` is malformed (spaces instead of commas),
all parameters get concatenated into `_ENVIRONMENT`, making `NODE_ENV` receive the
entire string instead of just "staging".

---

## Solution: Correct Format and Names

### After Fix ✅

```
GitHub Actions
    ↓
    --substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend-staging,
                    _FRONTEND_SERVICE_NAME=mycats-pro-frontend-staging,
                    _ENVIRONMENT=staging,                              ← clean value
                    _DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING,    ← UPPERCASE!
                    _DATABASE_URL_SECRET_VERSION=3,                    ← added version!
                    _JWT_SECRET_NAME=JWT_SECRET_STAGING,               ← UPPERCASE!
                    _JWT_SECRET_VERSION=1,                             ← added version!
                    ...
    ↓
Cloud Build (cloudbuild.yaml)
    ↓
    --set-env-vars "NODE_ENV=${_ENVIRONMENT},CORS_ORIGIN=${_CORS_ORIGIN},..."
                            ↑
                            expands to "staging" only
    ↓
    --set-secrets "DATABASE_URL=${_DATABASE_URL_SECRET_NAME}:${_DATABASE_URL_SECRET_VERSION},..."
                               ↑                             ↑
                               DATABASE_URL_STAGING          3
    ↓
Cloud Run Container
    ↓
    NODE_ENV = "staging" ✓
    DATABASE_URL = <value from secret "DATABASE_URL_STAGING" version 3> ✓
    JWT_SECRET = <value from secret "JWT_SECRET_STAGING" version 1> ✓
    CORS_ORIGIN = "https://mycats-pro-frontend-staging-..." ✓
    ↓
NestJS Bootstrap
    ↓
    ✅ Environment validation passed
    ✅ NODE_ENV: staging
    ✅ Database connection successful
    ✅ Application started on port 8080
    ↓
Health Check
    ↓
    GET /health → HTTP 200 ✅
```

---

## Key Changes

### 1. Secret Name Format

**Before:**
```yaml
_DATABASE_URL_SECRET_NAME=DATABASE_URL_staging  # lowercase suffix
```

**After:**
```yaml
_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING  # UPPERCASE suffix
```

**Reason:** Cloud Secret Manager uses `DATABASE_URL_STAGING` (uppercase).

---

### 2. Secret Versions Added

**Before:**
```yaml
--substitutions=...,_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING
# No version specified, causing undefined in cloudbuild.yaml
```

**After:**
```yaml
--substitutions=...,_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING,_DATABASE_URL_SECRET_VERSION=3
```

**Reason:** `cloudbuild.yaml` uses `${_DATABASE_URL_SECRET_VERSION}` which needs a value.

---

### 3. Production Substitutions Completed

**Before:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,
                _FRONTEND_SERVICE_NAME=mycats-pro-frontend,
                _ENVIRONMENT=production
# Missing: Cloud SQL, CORS, API URL, secrets!
```

**After:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,
                _FRONTEND_SERVICE_NAME=mycats-pro-frontend,
                _ENVIRONMENT=production,
                _CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-prod-db,
                _CORS_ORIGIN=https://mycats-pro-frontend-518939509282.asia-northeast1.run.app,
                _NEXT_PUBLIC_API_URL=https://mycats-pro-backend-518939509282.asia-northeast1.run.app/api/v1,
                _DATABASE_URL_SECRET_NAME=DATABASE_URL,
                _DATABASE_URL_SECRET_VERSION=1,
                _JWT_SECRET_NAME=JWT_SECRET,
                _JWT_SECRET_VERSION=1,
                ...
```

**Reason:** Production needs the same complete set of parameters as staging.

---

## Environment Variable Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Actions Workflow (.github/workflows/deploy-only.yml)    │
│                                                                 │
│  gcloud builds submit --substitutions=_ENVIRONMENT=staging,... │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓ (substitution variables passed)
┌─────────────────────────────────────────────────────────────────┐
│ Cloud Build (cloudbuild.yaml)                                   │
│                                                                 │
│  gcloud run deploy "${_BACKEND_SERVICE_NAME}" \                │
│    --set-env-vars "NODE_ENV=${_ENVIRONMENT},..." \             │
│                            ↓                                    │
│                    Expands to: NODE_ENV=staging                 │
│                                                                 │
│    --set-secrets "DATABASE_URL=${_DATABASE_URL_SECRET_NAME}:${_DATABASE_URL_SECRET_VERSION}" │
│                                ↓                                │
│                    Expands to: DATABASE_URL=DATABASE_URL_STAGING:3 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓ (deploys with correct env vars)
┌─────────────────────────────────────────────────────────────────┐
│ Cloud Run Container                                             │
│                                                                 │
│  Environment Variables:                                         │
│    NODE_ENV=staging                      ← Clean value ✓       │
│    CORS_ORIGIN=https://...               ← Correct URL ✓       │
│    DATABASE_URL=<from secret>            ← Mounted secret ✓    │
│    JWT_SECRET=<from secret>              ← Mounted secret ✓    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ↓ (application reads env vars)
┌─────────────────────────────────────────────────────────────────┐
│ NestJS Application (backend/src/main.ts)                       │
│                                                                 │
│  validateProductionEnvironment() {                             │
│    const env = envSchema.parse(process.env);                   │
│    // NODE_ENV: z.enum(['development', 'staging', 'production', 'test']) │
│    //         ↓                                                │
│    // process.env.NODE_ENV = "staging" ✅ VALID               │
│  }                                                              │
│                                                                 │
│  ✅ Validation passes                                           │
│  ✅ Application starts successfully                             │
│  ✅ Health check returns 200                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comparison Table

| Aspect | Before Fix ❌ | After Fix ✅ |
|--------|--------------|-------------|
| **Staging Secret Names** | `DATABASE_URL_staging` (lowercase) | `DATABASE_URL_STAGING` (uppercase) |
| **Secret Versions** | Missing | Added (e.g., `=3`) |
| **Production Substitutions** | Only `_ENVIRONMENT` | Complete set (SQL, CORS, secrets) |
| **NODE_ENV Value** | Could receive malformed string | Clean: `"staging"` or `"production"` |
| **Secret Mounting** | Failed (wrong name) | Success (correct name + version) |
| **Validation** | ❌ Failed | ✅ Passes |
| **Deployment** | ❌ Container crashes | ✅ Deploys successfully |
| **Health Check** | ❌ 503 error | ✅ 200 OK |

---

## Testing the Fix

### Before Deployment
```bash
./scripts/validate-deployment-config.sh
# All 16 checks should PASS ✅
```

### After Deployment
```bash
# Check Cloud Run status
gcloud run services describe mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --format="value(status.conditions[0].status)"
# Expected: True

# Test health endpoint
curl https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/health
# Expected: HTTP 200 with { "success": true, "data": { "status": "ok", "environment": "staging" } }

# Check logs for validation success
gcloud logs read \
  --resource-type=cloud_run_revision \
  --log-filter='resource.labels.service_name="mycats-pro-backend-staging"' \
  --limit=50 | grep "NODE_ENV"
# Expected: "NODE_ENV: staging" (not "NODE_ENV: staging _BACKEND_SERVICE_NAME=...")
```

---

## Summary

The fix ensures that:
1. ✅ `NODE_ENV` receives a clean, valid enum value (`"staging"` or `"production"`)
2. ✅ Secret names match Cloud Secret Manager (uppercase `_STAGING` suffix)
3. ✅ Secret versions are specified (preventing undefined errors)
4. ✅ All required substitutions are provided for both staging and production
5. ✅ `cloudbuild.yaml` correctly expands variables without concatenation issues

**Result:** Clean deployment, successful validation, healthy service! 🎉
