# Azure Deployment Guide - Environment Variables

## 📋 Overview
This document lists all environment variables that **Nadeesha Ayya** (DevOps Engineer) needs to configure in Azure App Service for the FMS SaaS Platform.

---

## 🔧 Backend (NestJS API) - Azure App Service Configuration

### Required Environment Variables

Configure these in: **Azure Portal** → **App Service** → **Configuration** → **Application Settings**

| Variable Name | Description | Example Value | Production Recommendation |
|--------------|-------------|---------------|---------------------------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma | `postgresql://user:password@host:5432/dbname?sslmode=require` | Use Azure Database for PostgreSQL connection string with SSL enabled |
| `JWT_SECRET` | Secret key for JWT token signing | `MY_SECRET_KEY_123` | **CRITICAL**: Generate a strong random key using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `1d` | Use `1d` for 1 day, `7d` for 7 days, or `24h` for 24 hours |
| `PORT` | Server port (Azure will override this) | `3000` | Azure App Service automatically sets this. You can omit it or set to `8080` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://your-frontend.azurestaticapps.net` | **IMPORTANT**: Set to your Azure Static Web App URL. For multiple origins: `https://frontend.com,https://www.frontend.com` |
| `SUPER_TENANT_ID` | System super tenant ID | `05642b69-8f04-44d0-b74c-27c9db4b4969` | Use the actual UUID from your seeded database |
| `SYSTEM_SUPER_USER_ID` | System super user ID | `2930b04c-4b14-4540-a6fc-002093679b8b` | Use the actual UUID from your seeded database |

### ⚠️ Security Best Practices

1. **Never commit production secrets to Git**
2. **Generate a strong JWT_SECRET**: Use a cryptographically secure random string (64+ characters)
3. **Restrict CORS_ORIGIN**: Only allow your actual frontend domain(s)
4. **Enable SSL/TLS**: Ensure `sslmode=require` in DATABASE_URL
5. **Use Azure Key Vault** (optional): For enhanced security, store secrets in Azure Key Vault and reference them in App Service

---

## 🎨 Frontend (React/Vite) - Azure Static Web Apps Configuration

### Build-Time Environment Variables

Configure these in: **Azure Portal** → **Static Web Apps** → **Configuration** → **Application Settings**

**Note**: Vite bakes environment variables into the build at build-time. These must be set **before** deployment or during the build pipeline.

| Variable Name | Description | Example Value | Production Value |
|--------------|-------------|---------------|------------------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` | `https://your-backend-api.azurewebsites.net` |
| `VITE_SUPER_TENANT_ID` | Super tenant ID (for UI logic) | `05642b69-8f04-44d0-b74c-27c9db4b4969` | Same as backend `SUPER_TENANT_ID` |
| `VITE_SYSTEM_SUPER_USER_ID` | System super user ID | `2930b04c-4b14-4540-a6fc-002093679b8b` | Same as backend `SYSTEM_SUPER_USER_ID` |

### 📝 Important Notes for Frontend

- **Vite Environment Variables Must Start with `VITE_`**: Any variable without this prefix will be ignored
- **No Secrets in Frontend**: Never store sensitive data (passwords, API keys) in frontend environment variables
- **Rebuild Required**: Changes to these variables require a rebuild and redeployment of the frontend

---

## 🚀 Deployment Checklist for Nadeesha Ayya

### Backend Deployment (Azure App Service)

- [ ] Create an Azure App Service (Linux container)
- [ ] Configure Container Registry (Azure Container Registry or Docker Hub)
- [ ] Build and push Docker image:
  ```bash
  cd backend
  docker build -t fms-backend:latest .
  docker tag fms-backend:latest <your-acr>.azurecr.io/fms-backend:latest
  docker push <your-acr>.azurecr.io/fms-backend:latest
  ```
- [ ] Set all environment variables in App Service Configuration
- [ ] Generate a strong `JWT_SECRET` and save it securely
- [ ] Update `CORS_ORIGIN` with the actual frontend URL
- [ ] Enable Application Insights for monitoring
- [ ] Configure custom domain and SSL certificate
- [ ] Run database migrations: `npx prisma migrate deploy` (via Azure CLI or SSH)

### Frontend Deployment (Azure Static Web Apps)

- [ ] Create an Azure Static Web App
- [ ] Connect to GitHub repository for CI/CD
- [ ] Configure build settings:
  - **App Location**: `frontend`
  - **Output Location**: `dist`
  - **Build Command**: `npm run build`
- [ ] Set `VITE_API_URL` to backend App Service URL
- [ ] Set `VITE_SUPER_TENANT_ID` and `VITE_SYSTEM_SUPER_USER_ID`
- [ ] Configure custom domain and SSL certificate
- [ ] Test the deployment

---

## 🗄️ Database Setup

### Azure Database for PostgreSQL

1. **Create a Flexible Server** in Azure Portal
2. **Enable SSL**: Required for Prisma connections
3. **Firewall Rules**: Allow Azure services and your IP
4. **Connection String Format**:
   ```
   postgresql://<username>:<password>@<server-name>.postgres.database.azure.com:5432/<database-name>?sslmode=require
   ```
5. **Run Prisma Migrations**:
   ```bash
   # From backend directory
   npx prisma migrate deploy
   npx prisma db seed  # To seed super admin
   ```

---

## 🔍 Testing Environment Variables

### Backend Testing
```bash
# SSH into App Service or use Azure Cloud Shell
echo $JWT_SECRET
echo $DATABASE_URL
echo $CORS_ORIGIN
```

### Frontend Testing
After deployment, open browser console:
```javascript
// These should NOT be undefined
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_SUPER_TENANT_ID)
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` matches the exact frontend URL (including `https://`)
2. **JWT Errors**: Verify `JWT_SECRET` is identical in all backend instances (if using multiple)
3. **Database Connection Errors**: Check firewall rules and SSL mode
4. **Frontend API Errors**: Verify `VITE_API_URL` points to the correct backend

### Monitoring

- **Application Insights**: Monitor backend performance and errors
- **Static Web Apps Diagnostics**: Check frontend deployment logs
- **Database Metrics**: Monitor PostgreSQL performance in Azure Portal

---

## 🔐 Production Security Hardening

1. **Enable Azure AD Authentication** for App Service
2. **Use Managed Identities** for database access (instead of passwords)
3. **Enable DDoS Protection** on Static Web Apps
4. **Implement Rate Limiting** in backend (e.g., using `@nestjs/throttler`)
5. **Regular Security Audits**: Run `npm audit` and update dependencies
6. **Backup Strategy**: Configure automated backups for PostgreSQL

---

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [NestJS Configuration Guide](https://docs.nestjs.com/techniques/configuration)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Last Updated**: January 22, 2026  
**Prepared For**: Nadeesha Ayya (DevOps Engineer)  
**Project**: FMS SaaS Platform - Facility Management System
