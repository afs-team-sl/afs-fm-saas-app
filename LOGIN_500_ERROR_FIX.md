# 🔧 Login 500 Error - Fix Guide

## Problem
The login endpoint returns **HTTP 500 Internal Server Error** on Azure deployment:
```
POST https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/auth/login
[HTTP/1.1 500 Internal Server Error]
```

## Root Cause
The Azure App Service is **missing the `JWT_SECRET` environment variable**, which causes the JWT module to fail during initialization. This results in a 500 error when trying to authenticate users.

## ✅ Quick Fix - Azure Portal

### Step 1: Add Missing Environment Variables
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **App Services → be-fms-dev-h6fed7awcqd7cxb5**
3. Click: **Configuration → Application Settings**
4. Add these **required** variables:

| Name | Value | Notes |
|------|-------|-------|
| `JWT_SECRET` | `MY_SECRET_KEY_123` | ⚠️ Use a strong secret in production! |
| `JWT_EXPIRES_IN` | `1d` | Token expiration (1 day) |
| `DATABASE_URL` | `postgresql://admins:db-fms-dev6%25681367jHJDHQ(7@db-fms-dev.postgres.database.azure.com:5432/postgres?sslmode=require` | Already should exist |
| `CORS_ORIGIN` | `http://localhost,http://localhost:5173,https://blue-tree-021d4c00f.1.azurestaticapps.net` | Frontend URLs |
| `SUPER_TENANT_ID` | `05642b69-8f04-44d0-b74c-27c9db4b4969` | System admin tenant |
| `SYSTEM_SUPER_USER_ID` | `2930b04c-4b14-4540-a6fc-002093679b8b` | System admin user |

5. Click **Save**
6. Click **Restart** (top toolbar)

### Step 2: Verify Fix
After restarting, test the login:
```bash
curl -X POST https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "ADMIN",
    "tenantId": "..."
  }
}
```

---

## 🔒 Production Security Recommendations

### Generate a Secure JWT_SECRET
For production, **DO NOT** use `MY_SECRET_KEY_123`. Generate a cryptographically secure secret:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Using PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output and update `JWT_SECRET` in Azure App Service configuration.

---

## 🛠️ Alternative Fix - Azure CLI

If you prefer using Azure CLI:

```bash
# Set your resource group and app service name
RESOURCE_GROUP="your-resource-group"
APP_NAME="be-fms-dev-h6fed7awcqd7cxb5"

# Add JWT_SECRET
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings JWT_SECRET="MY_SECRET_KEY_123"

# Add JWT_EXPIRES_IN
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings JWT_EXPIRES_IN="1d"

# Restart the app
az webapp restart \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME
```

---

## 📋 Complete Environment Variables Checklist

Verify all these variables are set in Azure App Service:

### Required Variables ✅
- [x] `JWT_SECRET` - JWT signing secret
- [x] `JWT_EXPIRES_IN` - Token expiration time
- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `CORS_ORIGIN` - Allowed frontend origins

### Optional but Recommended ✅
- [x] `SUPER_TENANT_ID` - Super admin tenant ID
- [x] `SYSTEM_SUPER_USER_ID` - System admin user ID
- [x] `NODE_ENV` - Set to `production`
- [x] `AZURE_STORAGE_CONNECTION_STRING` - For file uploads

---

## 🔍 How to Verify Current Settings

### Azure Portal
1. **App Services → be-fms-dev-h6fed7awcqd7cxb5 → Configuration**
2. Look for `JWT_SECRET` in the list
3. If missing or shows `Hidden value`, it needs to be set

### Azure CLI
```bash
az webapp config appsettings list \
  --resource-group your-resource-group \
  --name be-fms-dev-h6fed7awcqd7cxb5 \
  --query "[?name=='JWT_SECRET']"
```

---

## 🧪 Testing After Fix

### 1. Check Application Logs
```bash
az webapp log tail \
  --resource-group your-resource-group \
  --name be-fms-dev-h6fed7awcqd7cxb5
```

Look for successful startup:
```
[Nest] Starting Nest application...
[Nest] JwtModule dependencies initialized
🔒 CORS: Enabled for specific origins
```

### 2. Test Login from Frontend
1. Open: https://blue-tree-021d4c00f.1.azurestaticapps.net
2. Go to login page
3. Enter credentials
4. Should successfully authenticate

### 3. Test Health Endpoint
```bash
curl https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net/health
```

Expected: `{"status":"ok","timestamp":"..."}`

---

## ❓ Still Having Issues?

### Check Logs for Detailed Error
```bash
# Stream application logs
az webapp log tail \
  --resource-group your-resource-group \
  --name be-fms-dev-h6fed7awcqd7cxb5

# Download logs for analysis
az webapp log download \
  --resource-group your-resource-group \
  --name be-fms-dev-h6fed7awcqd7cxb5 \
  --log-file app-logs.zip
```

### Common Error Messages

**"Cannot read property 'secret' of undefined"**
- Solution: `JWT_SECRET` is not set or empty

**"Invalid algorithm"**
- Solution: Check `JWT_SECRET` doesn't contain special characters that need escaping

**"Database connection failed"**
- Solution: Verify `DATABASE_URL` is correct and password special characters are URL-encoded

---

## 📝 Summary

The 500 error on login was caused by a missing `JWT_SECRET` environment variable in Azure App Service. Adding this variable and restarting the service will resolve the issue immediately.

**Next Steps:**
1. ✅ Add `JWT_SECRET` to Azure App Service Configuration
2. ✅ Restart the App Service
3. ✅ Test login endpoint
4. ✅ Update to a secure random secret for production
