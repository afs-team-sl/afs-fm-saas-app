# 🎯 Quick Start: Azure Deployment

## For Nadeesha Ayya (DevOps Engineer)

This is your quick reference guide. For detailed information, see:
- `AZURE_DEPLOYMENT_GUIDE.md` - Full environment variable documentation
- `DOCKER_GUIDE.md` - Docker build and run commands
- `DEPLOYMENT_CHANGES.md` - Summary of all code changes

---

## ⚡ Quick Deployment Steps

### Step 1: Generate JWT Secret (CRITICAL!)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
**Save this output - you'll need it for Azure configuration!**

---

### Step 2: Build & Push Backend Docker Image

```bash
# Navigate to backend
cd backend

# Build the image
docker build -t fms-backend:latest .

# Login to Azure Container Registry
az acr login --name <your-acr-name>

# Tag the image
docker tag fms-backend:latest <your-acr-name>.azurecr.io/fms-backend:v1.0.0

# Push to ACR
docker push <your-acr-name>.azurecr.io/fms-backend:v1.0.0
```

---

### Step 3: Configure Backend in Azure App Service

**Azure Portal → App Service → Configuration → Application Settings**

Add these 7 environment variables:

```plaintext
DATABASE_URL=postgresql://user:pass@server.postgres.database.azure.com:5432/dbname?sslmode=require
JWT_SECRET=<paste-the-generated-secret-from-step-1>
JWT_EXPIRES_IN=1d
PORT=8080
CORS_ORIGIN=https://your-frontend.azurestaticapps.net
SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969
SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b
```

**⚠️ IMPORTANT**: Replace `https://your-frontend.azurestaticapps.net` with your actual Static Web App URL!

---

### Step 4: Run Database Migration

```bash
# SSH into App Service or use Cloud Shell
cd /home/site/wwwroot
npx prisma migrate deploy
npx prisma db seed
```

---

### Step 5: Build & Push Frontend Docker Image (Optional)

**Note**: For Azure Static Web Apps, you typically use GitHub Actions instead of Docker. But if using containers:

```bash
# Navigate to frontend
cd frontend

# Build with production environment variables
docker build \
  --build-arg VITE_API_URL=https://your-backend.azurewebsites.net \
  --build-arg VITE_SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969 \
  --build-arg VITE_SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b \
  -t fms-frontend:latest .

# Tag and push
docker tag fms-frontend:latest <your-acr-name>.azurecr.io/fms-frontend:v1.0.0
docker push <your-acr-name>.azurecr.io/fms-frontend:v1.0.0
```

---

### Step 6: Configure Frontend (Azure Static Web Apps)

**Azure Portal → Static Web Apps → Configuration → Application Settings**

Add these 3 build-time variables:

```plaintext
VITE_API_URL=https://your-backend.azurewebsites.net
VITE_SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969
VITE_SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b
```

**Then trigger a rebuild/redeploy** of the Static Web App.

---

## ✅ Verification Checklist

### Backend Health Check
```bash
curl https://your-backend.azurewebsites.net/api
# Should return Swagger UI HTML
```

### Frontend Health Check
```bash
curl https://your-frontend.azurestaticapps.net/health
# Should return "healthy"
```

### Test Login Flow
1. Open frontend URL in browser
2. Try to register a new organization
3. Try to login
4. Check browser console for CORS errors

---

## 🚨 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| **CORS error in browser** | Verify `CORS_ORIGIN` in backend matches frontend URL exactly |
| **JWT authentication fails** | Ensure `JWT_SECRET` is set and matches across all backend instances |
| **Frontend shows "Network Error"** | Check `VITE_API_URL` and rebuild frontend |
| **Database connection error** | Verify `DATABASE_URL` and firewall rules |
| **Container won't start** | Check Application Insights logs for errors |

---

## 📋 Environment Variables Summary

### Backend (7 Required)
1. `DATABASE_URL` - PostgreSQL connection string
2. `JWT_SECRET` - **Generate using command in Step 1**
3. `JWT_EXPIRES_IN` - Token lifetime (e.g., `1d`)
4. `PORT` - Server port (Azure sets automatically)
5. `CORS_ORIGIN` - Frontend URL(s), comma-separated
6. `SUPER_TENANT_ID` - System tenant UUID
7. `SYSTEM_SUPER_USER_ID` - System user UUID

### Frontend (3 Required - Build Time)
1. `VITE_API_URL` - Backend URL
2. `VITE_SUPER_TENANT_ID` - System tenant UUID
3. `VITE_SYSTEM_SUPER_USER_ID` - System user UUID

---

## 🔒 Security Reminders

- ✅ Never commit `.env` files to Git
- ✅ Use strong, random `JWT_SECRET` (64+ characters)
- ✅ Restrict `CORS_ORIGIN` to specific domains
- ✅ Enable SSL/TLS (`sslmode=require` in DATABASE_URL)
- ✅ Use Azure Key Vault for production secrets (recommended)

---

## 📞 Need Help?

1. Check `AZURE_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
2. Review Application Insights logs in Azure Portal
3. Verify all environment variables are set correctly
4. Test locally with Docker first using `DOCKER_GUIDE.md`

---

**Created**: January 22, 2026  
**Status**: ✅ Ready for Production Deployment  
**Estimated Deployment Time**: 30-45 minutes
