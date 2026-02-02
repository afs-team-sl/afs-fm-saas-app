# 🎯 Azure App Service - Quick Configuration Reference

## App Service Name
**be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net**

---

## ⚙️ Required Application Settings

Copy these settings to: **Azure Portal → App Services → be-fms-dev-h6fed7awcqd7cxb5 → Configuration → Application Settings**

### Authentication & Security
```
JWT_SECRET=MY_SECRET_KEY_123
JWT_EXPIRES_IN=1d
```
⚠️ **IMPORTANT:** Replace `MY_SECRET_KEY_123` with a secure random value for production!

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Database Connection
```
DATABASE_URL=postgresql://admins:db-fms-dev6%25681367jHJDHQ(7@db-fms-dev.postgres.database.azure.com:5432/postgres?sslmode=require
```

---

### CORS Configuration
```
CORS_ORIGIN=http://localhost,http://localhost:5173,https://blue-tree-021d4c00f.1.azurestaticapps.net
```

Update with your actual frontend URLs (comma-separated, no spaces).

---

### Super Admin Configuration
```
SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969
SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b
```

---

### Azure Storage (File Uploads)
```
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=blobfmsdev;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net
```

Get from: **Azure Portal → Storage Account (blobfmsdev) → Access Keys**

---

### Environment
```
NODE_ENV=production
```

---

## 🚫 CORS Settings in Azure Portal

**CRITICAL:** Disable Azure's built-in CORS!

1. Navigate to: **App Services → be-fms-dev-h6fed7awcqd7cxb5 → CORS**
2. **Clear all entries** from "Allowed Origins"
3. Click **Save**

Why? Our NestJS app handles CORS correctly with credentials support.

---

## 🔄 After Making Changes

1. Click **Save** in Configuration
2. Click **Restart** (top toolbar)
3. Wait 1-2 minutes for restart
4. Test: https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/health

---

## 📋 Verification Checklist

- [ ] All environment variables listed above are configured
- [ ] `JWT_SECRET` is set (not default value)
- [ ] Azure built-in CORS is disabled (empty list)
- [ ] App Service restarted after configuration
- [ ] Health endpoint returns success
- [ ] Login endpoint works without 500 error

---

## 🧪 Quick Tests

### Test Health Endpoint
```bash
curl https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/health
```
Expected: `{"status":"ok"}`

### Test Login Endpoint
```bash
curl -X POST https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: `{"access_token":"...","user":{...}}` or `401 Unauthorized` (not 500!)

---

## 📞 Troubleshooting

### View Logs
**Portal:** App Services → be-fms-dev-h6fed7awcqd7cxb5 → Log stream

**CLI:**
```bash
az webapp log tail --name be-fms-dev-h6fed7awcqd7cxb5 --resource-group <your-rg>
```

### Check Environment Variables
**Portal:** Configuration → Application Settings → Look for "Hidden value"

**CLI:**
```bash
az webapp config appsettings list --name be-fms-dev-h6fed7awcqd7cxb5 --resource-group <your-rg>
```

---

## ⏱️ Deployment Timeline

1. **Update Configuration:** 2 minutes
2. **Restart App Service:** 1-2 minutes
3. **App Initialization:** 30 seconds
4. **Total:** ~3-4 minutes

---

## 🎯 Current Issue Resolution

**Problem:** Login returns 500 Internal Server Error

**Root Cause:** Missing `JWT_SECRET` environment variable

**Solution:** Add `JWT_SECRET` to Application Settings and restart

**ETA:** 5 minutes

---

## 📚 Related Documentation

- [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [LOGIN_500_ERROR_FIX.md](./LOGIN_500_ERROR_FIX.md) - Detailed fix steps
