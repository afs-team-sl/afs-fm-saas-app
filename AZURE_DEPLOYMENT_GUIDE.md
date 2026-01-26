# Azure Production Deployment Guide

## ✅ Completed Changes

### 1. Backend CORS Configuration (src/main.ts)
- ✅ Updated to **production-ready CORS** with environment-based origins
- ✅ Uses `CORS_ORIGIN` environment variable for allowed origins
- ✅ Implements function-based origin validation (required when `credentials: true`)
- ✅ Logs blocked requests for security monitoring
- ✅ Caches preflight requests for 24 hours (performance optimization)

### 2. Backend Server Startup (src/main.ts)
- ✅ Binds to `0.0.0.0` for Azure App Service compatibility
- ✅ Uses `PORT` from ConfigService (Azure sets this dynamically)
- ✅ Enhanced logging for environment, CORS origins, and server status

### 3. Frontend Lucide Icons
- ✅ Verified: No deprecated icon imports found
- ✅ All files use standard named imports: `import { Box, User, Settings } from 'lucide-react'`
- ✅ No action required

---

## 🚀 Azure DevOps Configuration

### Backend (Azure App Service) - Environment Variables

Navigate to: **Azure Portal → Your App Service → Configuration → Application Settings**

Add the following environment variable:

| Name | Value | Example |
|------|-------|---------|
| `CORS_ORIGIN` | Comma-separated list of allowed origins | `https://blue-tree-021d4c00f.azurestaticapps.net,http://localhost:5173` |
| `NODE_ENV` | production | `production` |
| `PORT` | (Auto-set by Azure) | `8080` or `80` |
| `DATABASE_URL` | Your Azure PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Your secure JWT secret | `your-256-bit-secret` |

**Important:** Replace `https://blue-tree-021d4c00f.azurestaticapps.net` with your actual Azure Static Web App URL.

---

### Backend (Azure App Service) - CORS Settings

**⚠️ CRITICAL: Disable Built-in CORS in Azure Portal**

Azure App Service has a built-in CORS feature that **conflicts** with NestJS CORS middleware. Follow these steps:

#### Option 1: Azure Portal (Recommended)
1. Navigate to: **Azure Portal → Your App Service → CORS**
2. **Clear all entries** from the "Allowed Origins" list
3. Click **Save**
4. Restart the App Service

#### Option 2: Azure CLI
```bash
# Disable Azure built-in CORS
az webapp cors remove \
  --resource-group <your-resource-group> \
  --name <your-app-service-name> \
  --allowed-origins "*"

# Verify CORS is disabled
az webapp cors show \
  --resource-group <your-resource-group> \
  --name <your-app-service-name>

# Expected output: {"allowedOrigins": []}
```

**Why?** 
- Azure's built-in CORS runs **before** your NestJS app
- It can block requests even if your NestJS CORS allows them
- Our `main.ts` handles CORS correctly with `credentials: true`

---

### Frontend (Azure Static Web App) - API Configuration

Update your Static Web App configuration to point to the backend:

**File:** `frontend/staticwebapp.config.json`

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "/api/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

**Environment Variables for Frontend:**

Navigate to: **Azure Portal → Your Static Web App → Configuration**

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.azurewebsites.net` |
| `VITE_SUPER_TENANT_ID` | Your super tenant ID |

---

## 🧪 Testing the Deployment

### 1. Test CORS Locally
```bash
# Set environment variable
export CORS_ORIGIN="http://localhost:5173,https://blue-tree-021d4c00f.azurestaticapps.net"

# Start backend
cd backend
npm run start:dev

# Expected console output:
# 🔒 CORS: Enabled for specific origins: [ 'http://localhost:5173', 'https://...' ]
```

### 2. Test CORS in Production

Open browser console on your Static Web App and run:

```javascript
// Test API call from browser
fetch('https://your-backend.azurewebsites.net/api', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(res => res.json())
.then(data => console.log('✅ CORS working:', data))
.catch(err => console.error('❌ CORS error:', err));
```

**Expected Result:** No CORS errors, successful API response

---

## 🔍 Troubleshooting

### Issue: "Access-Control-Allow-Origin" header missing
**Solution:** 
1. Verify `CORS_ORIGIN` includes your Static Web App URL
2. Check Azure App Service built-in CORS is disabled
3. Restart the App Service

### Issue: "Credentials mode is 'include' but Access-Control-Allow-Credentials is missing"
**Solution:** 
- Our `main.ts` sets `credentials: true` ✅
- Ensure Azure built-in CORS is **disabled** (it doesn't support credentials)

### Issue: Backend logs show "CORS blocked request from origin: ..."
**Solution:** 
- Add the blocked origin to `CORS_ORIGIN` environment variable
- Format: `https://blue-tree-xxx.azurestaticapps.net` (no trailing slash)

### Issue: Preflight (OPTIONS) requests failing
**Solution:** 
- Our `main.ts` handles OPTIONS with `optionsSuccessStatus: 204` ✅
- Verify Azure built-in CORS is disabled

---

## 📋 Deployment Checklist

### Backend Deployment
- [ ] Set `CORS_ORIGIN` environment variable in Azure App Service
- [ ] Disable built-in CORS in Azure Portal (CORS settings)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` for Azure PostgreSQL
- [ ] Set `JWT_SECRET` securely
- [ ] Deploy latest code with updated `main.ts`
- [ ] Restart App Service
- [ ] Verify startup logs show correct CORS origins

### Frontend Deployment
- [ ] Update `VITE_API_BASE_URL` to production backend URL
- [ ] Deploy to Azure Static Web App
- [ ] Test login flow (CORS with credentials)
- [ ] Test API calls from browser console
- [ ] Verify no CORS errors in browser DevTools

---

## 🎯 Final Verification

After deployment, verify these key points:

1. ✅ Backend logs show: `🔒 CORS: Enabled for specific origins: [...]`
2. ✅ Frontend can make authenticated requests (login works)
3. ✅ No CORS errors in browser console
4. ✅ API calls include credentials (cookies/tokens)
5. ✅ Preflight requests return 204 status

---

## 📞 Support

If you encounter issues:
1. Check backend logs in Azure Portal → App Service → Log Stream
2. Check browser DevTools → Network tab → Failed requests
3. Verify environment variables are correctly set
4. Ensure Azure built-in CORS is disabled

---

**Last Updated:** January 26, 2026  
**Version:** 1.0.0
