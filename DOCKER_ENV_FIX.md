# Docker Compose Environment Variables - Quick Fix Guide

## 🔴 Problem Diagnosed

Your `docker-compose.yml` was using this pattern:

```yaml
environment:
  - DATABASE_URL=${DATABASE_URL}  # ❌ Looking for root .env file (doesn't exist!)
  - JWT_SECRET=${JWT_SECRET}      # ❌ Evaluates to empty string
```

**Root Cause:** Docker Compose looks for `.env` in the same directory as `docker-compose.yml`, but your `.env` file is in `backend/.env`, so all variables were empty!

---

## ✅ Solution Applied

### 1. Updated `docker-compose.yml`

**Before (WRONG):**
```yaml
version: '3.8'  # ❌ Obsolete
services:
  fms-api:
    environment:
      - DATABASE_URL=${DATABASE_URL}  # ❌ Empty!
      - JWT_SECRET=${JWT_SECRET}      # ❌ Empty!
    env_file:
      - ./backend/.env
```

**After (CORRECT):**
```yaml
# No version needed (modern Docker Compose)
services:
  fms-api:
    # Load ALL variables from backend/.env FIRST
    env_file:
      - ./backend/.env
    # Only override specific variables if needed
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - PORT=3000
    healthcheck:
      start_period: 90s  # ✅ Increased for Prisma initialization
      retries: 5         # ✅ More tolerant
```

**Key Changes:**
- ✅ Removed obsolete `version: '3.8'`
- ✅ `env_file` loads ALL variables from `backend/.env`
- ✅ Removed redundant environment variable declarations
- ✅ Increased `start_period` to 90s for Prisma
- ✅ Increased `retries` to 5 for better reliability

---

## 📁 Folder Structure

```
software/
├── docker-compose.yml          # ← Your main compose file
├── .env.example                # ← Template (created for you)
├── .env                        # ← OPTIONAL root .env (you don't need this)
│
├── backend/
│   ├── .env                    # ← ✅ MAIN backend config (DATABASE_URL, JWT_SECRET)
│   ├── Dockerfile
│   └── src/
│
└── frontend/
    ├── .env                    # ← ✅ Frontend config (VITE_API_URL)
    └── Dockerfile
```

**Important:**
- ✅ Keep your secrets in `backend/.env`
- ✅ Keep frontend config in `frontend/.env`
- ❌ You DON'T need a root `.env` file (unless you want shared defaults)

---

## 🔧 How Environment Variables Work in Docker Compose

### Order of Precedence (Highest to Lowest):

1. **`environment:` section in docker-compose.yml** (highest priority)
2. **`env_file:` files** (loaded in order listed)
3. **`.env` file in same directory as docker-compose.yml** (auto-loaded)
4. **Shell environment variables** (from your terminal)

### Example:

```yaml
# docker-compose.yml
services:
  fms-api:
    env_file:
      - ./backend/.env      # Loads: DATABASE_URL, JWT_SECRET, etc.
    environment:
      - PORT=3000           # Overrides PORT from .env file
      - NODE_ENV=production # Overrides NODE_ENV from .env file
```

**What happens:**
1. Docker loads `backend/.env` (gets DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc.)
2. Docker applies `environment` section (overrides PORT and NODE_ENV)
3. Final result: All variables from .env PLUS the overrides

---

## 🐛 Debugging Commands

### 1. **Check if environment variables are loaded:**
```powershell
# Method 1: Check from running container
docker exec fms-api env | Select-String "DATABASE_URL|JWT_SECRET|PORT"

# Method 2: Inspect container configuration
docker inspect fms-api --format='{{range .Config.Env}}{{println .}}{{end}}' | Select-String "DATABASE_URL|JWT_SECRET"

# Method 3: View what docker-compose will use
docker-compose config
```

**Expected output:**
```
DATABASE_URL=postgresql://admins:...
JWT_SECRET=MY_SECRET_KEY_123
PORT=3000
```

---

### 2. **View container logs to see why it's crashing:**
```powershell
# Real-time logs
docker logs -f fms-api

# Last 50 lines
docker logs --tail 50 fms-api

# With timestamps
docker logs -f --timestamps fms-api

# All logs since container started
docker logs fms-api
```

**Look for:**
- ✅ "🚀 Server is running on: http://localhost:3000"
- ❌ "Environment variable not found: DATABASE_URL"
- ❌ "Cannot connect to database"
- ❌ "JWT secret is required"

---

### 3. **Check container health status:**
```powershell
# Quick status check
docker ps | Select-String fms-api

# Detailed health status
docker inspect fms-api --format='{{.State.Health.Status}}'

# View health check logs
docker inspect fms-api --format='{{range .State.Health.Log}}{{println .Output}}{{end}}'
```

**Expected:** `healthy` (after ~90 seconds)

---

### 4. **Test health endpoint manually:**
```powershell
# Wait 90 seconds after container starts
Start-Sleep -Seconds 90

# Test from inside container
docker exec fms-api curl -f http://localhost:3000/health

# Test from host machine
curl http://localhost:3000/health
# Or
Invoke-WebRequest http://localhost:3000/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-01-26T..."}
```

---

### 5. **Full diagnostic:**
```powershell
# Run the diagnostic script (if you have it)
.\diagnose-backend.ps1

# Or manually:
Write-Host "=== Container Status ===" -ForegroundColor Cyan
docker ps -a | Select-String fms-api

Write-Host "`n=== Environment Variables ===" -ForegroundColor Cyan
docker exec fms-api env | Select-String "DATABASE_URL|JWT_SECRET|PORT|NODE_ENV"

Write-Host "`n=== Recent Logs ===" -ForegroundColor Cyan
docker logs --tail 30 fms-api

Write-Host "`n=== Health Check ===" -ForegroundColor Cyan
docker inspect fms-api --format='{{.State.Health.Status}}'
```

---

## 🚀 Step-by-Step Startup Guide

### Step 1: Stop and clean up
```powershell
docker-compose down -v
```

### Step 2: Verify environment files exist
```powershell
# Check backend .env
Get-Content backend\.env | Select-String "DATABASE_URL|JWT_SECRET"

# Should show:
# DATABASE_URL=postgresql://...
# JWT_SECRET=MY_SECRET_KEY_123
```

### Step 3: Rebuild with no cache
```powershell
docker-compose build --no-cache fms-api
```

### Step 4: Start and watch logs
```powershell
# Option A: Foreground (recommended for debugging)
docker-compose up

# Option B: Background
docker-compose up -d
docker-compose logs -f fms-api
```

### Step 5: Wait for health check
```powershell
# Wait 90 seconds for initialization
Start-Sleep -Seconds 90

# Check status
docker ps | Select-String fms-api
# Should show: Up X minutes (healthy)
```

### Step 6: Verify it works
```powershell
# Test health endpoint
curl http://localhost:3000/health

# Test API docs
curl http://localhost:3000/api
```

---

## 🔍 Common Issues and Fixes

### Issue 1: "Environment variable not found: DATABASE_URL"

**Cause:** backend/.env doesn't exist or is not properly formatted

**Fix:**
```powershell
# Verify file exists
Test-Path backend\.env

# View contents
Get-Content backend\.env

# Ensure it has:
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

---

### Issue 2: "Container keeps restarting"

**Cause:** 
- Database connection failed
- Missing JWT_SECRET
- Port already in use

**Debug:**
```powershell
# Check why it's failing
docker logs fms-api

# Check if port 3000 is already in use
netstat -ano | findstr :3000

# Test database connectivity
docker exec fms-api node -e "console.log(process.env.DATABASE_URL)"
```

---

### Issue 3: "Health check failing"

**Cause:**
- Server not listening on 0.0.0.0
- Health endpoint not responding
- Too short start_period

**Fix:**
Already applied in `main.ts`:
```typescript
await app.listen(port, '0.0.0.0');  // ✅ Correct
```

And in `docker-compose.yml`:
```yaml
healthcheck:
  start_period: 90s  # ✅ Long enough for Prisma
  retries: 5         # ✅ More tolerant
```

---

### Issue 4: "curl: command not found"

**Cause:** curl not installed in Docker image

**Fix:**
Already added to `Dockerfile`:
```dockerfile
RUN apk add --no-cache curl
```

**Verify:**
```powershell
docker exec fms-api which curl
# Should output: /usr/bin/curl
```

---

## ✅ Success Checklist

After starting containers, verify:

- [ ] Container is running: `docker ps | Select-String fms-api`
- [ ] Health status is healthy: `docker inspect fms-api --format='{{.State.Health.Status}}'`
- [ ] Logs show success: `docker logs fms-api | Select-String "Server is running"`
- [ ] Environment variables loaded: `docker exec fms-api env | Select-String DATABASE_URL`
- [ ] Health endpoint works: `curl http://localhost:3000/health`
- [ ] API docs accessible: `curl http://localhost:3000/api`
- [ ] Database connected: No Prisma errors in logs

---

## 📝 Best Practices

### 1. **Environment Variables Organization:**

```
backend/.env          ← Backend secrets (DATABASE_URL, JWT_SECRET)
frontend/.env         ← Frontend config (VITE_API_URL)
.env.example          ← Template for documentation
```

### 2. **Never commit .env files:**

```gitignore
# .gitignore
.env
backend/.env
frontend/.env
*.env.local
```

### 3. **Use .env.example for documentation:**

```bash
# Create your .env from example
cp .env.example .env
cp backend/.env.example backend/.env
```

---

## 🔗 Related Files

Your fixes have been applied to:
- ✅ `docker-compose.yml` - Removed version, fixed env_file order
- ✅ `backend/Dockerfile` - Added curl, fixed health check
- ✅ `backend/src/main.ts` - Listen on 0.0.0.0
- ✅ `.env.example` - Created template

---

## 📞 Still Having Issues?

Run this comprehensive check:

```powershell
# 1. Check files exist
Write-Host "Checking .env files..." -ForegroundColor Yellow
Test-Path backend\.env
Test-Path frontend\.env

# 2. View docker-compose config (what Docker sees)
Write-Host "`nDocker Compose Configuration:" -ForegroundColor Yellow
docker-compose config

# 3. Test with docker-compose run
Write-Host "`nTesting with run command:" -ForegroundColor Yellow
docker-compose run --rm fms-api env | Select-String "DATABASE_URL|JWT_SECRET"

# 4. Check container logs
Write-Host "`nContainer Logs:" -ForegroundColor Yellow
docker logs fms-api --tail 50
```

---

**Last Updated:** January 26, 2026
