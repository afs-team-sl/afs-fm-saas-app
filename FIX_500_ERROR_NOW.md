# 🚀 IMMEDIATE FIX FOR 500 LOGIN ERROR

## The Problem
Your Azure backend at `be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net` is returning **500 Internal Server Error** because **JWT_SECRET is missing**.

---

## ⚡ Quick Fix (2 Minutes)

### Option 1: Azure Portal (Easiest)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Find your App Service**: Search for `be-fms-dev-h6fed7awcqd7cxb5`
3. **Click**: Configuration → Application Settings → + New application setting
4. **Add this setting**:
   - Name: `JWT_SECRET`
   - Value: `MY_SECRET_KEY_123`
5. **Click**: Save (top of page)
6. **Click**: Restart (top toolbar)
7. **Wait**: 2 minutes for restart

### Option 2: Run the Auto-Config Script

I've created scripts to do this automatically. Run one of these:

#### PowerShell (Windows):
```powershell
cd "e:\AFS\FMS  Project\software\backend"
.\configure-azure.ps1 -ResourceGroup "YOUR_RESOURCE_GROUP"
```

#### Bash (Mac/Linux):
```bash
cd "e:/AFS/FMS  Project/software/backend"
chmod +x configure-azure.sh
./configure-azure.sh YOUR_RESOURCE_GROUP
```

---

## ✅ Verify the Fix

After restarting, check these URLs:

### 1. Health Check
```
https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "config": {
    "jwtConfigured": true,
    "databaseConfigured": true
  },
  "warnings": []
}
```

If you see warnings, the configuration is incomplete.

### 2. Test Login
Open your browser console and run:
```javascript
fetch('https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your@email.com', password: 'your-password' })
})
.then(r => r.json())
.then(console.log)
```

**Success = 200 with token** ✅  
**User not found = 401** (expected if user doesn't exist)  
**500 error = Still missing config** ❌

---

## 📋 Complete Required Settings

Make sure ALL these are in Azure App Service → Configuration:

```
JWT_SECRET=MY_SECRET_KEY_123
JWT_EXPIRES_IN=1d
DATABASE_URL=postgresql://admins:db-fms-dev6%25681367jHJDHQ(7@db-fms-dev.postgres.database.azure.com:5432/postgres?sslmode=require
CORS_ORIGIN=http://localhost,http://localhost:5173,https://blue-tree-021d4c00f.1.azurestaticapps.net
SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969
SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b
NODE_ENV=production
```

---

## 🔍 Still Not Working?

### View Real-Time Logs
```bash
az webapp log tail --name be-fms-dev-h6fed7awcqd7cxb5 --resource-group YOUR_RG
```

Look for these error messages:
- `JWT_SECRET is not defined` → Add JWT_SECRET setting
- `Cannot connect to database` → Check DATABASE_URL
- `CORS error` → Check CORS_ORIGIN

### Common Issues

**"Cannot find module"**
- Solution: Redeploy the backend code

**"Database connection failed"**
- Solution: Check DATABASE_URL is correct
- Verify firewall allows Azure services

**"Still getting 500"**
- Solution: Make sure you clicked SAVE after adding settings
- Make sure you RESTARTED the app
- Wait 2-3 minutes after restart

---

## 🔒 Production Security

After fixing, generate a secure JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then update in Azure Portal with the new secure value.

---

## 📞 Need Help?

1. **Check health endpoint**: Should show all configs as `true`
2. **View logs**: `az webapp log tail`
3. **Verify settings**: Azure Portal → Configuration → Application Settings
4. **Restart again**: Sometimes takes 2 restarts to pick up changes

---

## ⏱️ Expected Timeline

- Add JWT_SECRET: **30 seconds**
- Save & Restart: **30 seconds**
- Wait for restart: **1-2 minutes**
- Test login: **10 seconds**

**Total: 3-4 minutes** ⚡
