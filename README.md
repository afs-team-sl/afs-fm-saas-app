# FMS Platform - Facility Management System

A modern, cloud-native SaaS platform for facility management built with NestJS, React, and PostgreSQL, deployed on Azure Kubernetes Service (AKS).

---

## 🚀 Quick Start

### Local Development with Docker Compose

```powershell
# 1. Clone the repository
git clone <your-repo-url>
cd software

# 2. Setup environment
Copy-Item .env.example .env
# Edit .env with your configuration

# 3. Start all services
docker-compose up -d

# 4. Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:3000
```

📖 **Detailed Guide**: [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

---

## 📁 Project Structure

```
software/
├── backend/                    # NestJS Backend API
│   ├── src/                   # Source code
│   ├── prisma/                # Database schema & migrations
│   ├── Dockerfile             # Production Docker image
│   └── package.json
│
├── frontend/                   # React Frontend (Vite)
│   ├── src/                   # Source code
│   ├── nginx.conf             # Production Nginx config
│   ├── Dockerfile             # Production Docker image
│   └── package.json
│
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml         # K8s namespace
│   ├── secrets.yaml           # Secrets & ConfigMaps
│   ├── backend-deployment.yaml # Backend deployment
│   ├── frontend-deployment.yaml # Frontend deployment
│   ├── ingress.yaml           # Ingress (optional)
│   └── deploy.ps1             # Deployment automation script
│
├── docker-compose.yml         # Local development orchestration
├── build-docker.ps1           # Build & test automation script
└── Documentation...
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Runtime**: Node.js 20.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL
- **Authentication**: JWT (Passport)
- **Validation**: class-validator

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router 7.x
- **Styling**: Tailwind CSS 3.x
- **HTTP Client**: Axios
- **UI Components**: Lucide React, Recharts

### Infrastructure
- **Container Runtime**: Docker
- **Orchestration**: Kubernetes (AKS)
- **Container Registry**: Azure Container Registry (ACR)
- **Database**: Azure Database for PostgreSQL
- **Reverse Proxy**: Nginx (for frontend)

---

## 📚 Documentation

### Getting Started
- [**DOCKER_QUICK_START.md**](DOCKER_QUICK_START.md) - Quick start guide for local development
- [**DOCKER_DEPLOYMENT_GUIDE.md**](DOCKER_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [**MIGRATION_CHECKLIST.md**](MIGRATION_CHECKLIST.md) - Complete migration checklist

### Architecture & Design
- [**ARCHITECTURE.md**](ARCHITECTURE.md) - System architecture and design decisions

### Existing Documentation
- [**QUICK_START.md**](QUICK_START.md) - Original quick start guide
- [**AZURE_DEPLOYMENT_GUIDE.md**](AZURE_DEPLOYMENT_GUIDE.md) - Azure App Service deployment
- [**DOCKER_GUIDE.md**](DOCKER_GUIDE.md) - Docker basics

---

## 🔧 Development

### Prerequisites
- Docker Desktop 24.0+
- Node.js 20.x
- PostgreSQL (or use Docker)

### Backend Development

```powershell
cd backend

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

### Frontend Development

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🐳 Docker

### Build Images

```powershell
# Using automation script (recommended)
.\build-docker.ps1 -Action build -Version v1.0.0

# Or manually
cd backend
docker build -t fms-backend:latest .

cd ../frontend
docker build -t fms-frontend:latest .
```

### Test Images

```powershell
# Using automation script
.\build-docker.ps1 -Action test

# Or manually with docker-compose
docker-compose up -d
docker-compose logs -f
```

### Push to Azure Container Registry

```powershell
# Using automation script
.\build-docker.ps1 -Action push -ACRName your-acr-name -Version v1.0.0
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Azure subscription
- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS)
- kubectl configured
- Azure CLI installed

### Deploy to AKS

```powershell
# Update secrets in k8s/secrets.yaml first!

# Deploy using automation script
cd k8s
.\deploy.ps1 `
  -ResourceGroup your-resource-group `
  -AKSCluster your-aks-cluster `
  -ACRName your-acr-name `
  -Action deploy

# Or manually
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Check status
kubectl get all -n fms-production
```

### Update Deployment

```powershell
# Update image version
kubectl set image deployment/fms-backend \
  fms-api=yourregistry.azurecr.io/fms-backend:v1.0.1 \
  -n fms-production

# Or redeploy
kubectl apply -f backend-deployment.yaml
kubectl rollout status deployment/fms-backend -n fms-production
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/fms_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"
NODE_ENV="production"
CORS_ORIGIN="http://localhost:80"
```

### Frontend (.env)
```env
VITE_API_BASE_URL="http://localhost:3000"
```

📝 **Note**: See [.env.example](.env.example) for complete list

---

## 🧪 Testing

### Backend Tests
```powershell
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```powershell
cd frontend

# Run tests
npm test
```

---

## 📊 Monitoring & Observability

### Health Checks
- **Backend**: `GET /health`
- **Frontend**: `GET /health`

### Kubernetes Monitoring
```powershell
# View logs
kubectl logs -f deployment/fms-backend -n fms-production
kubectl logs -f deployment/fms-frontend -n fms-production

# View metrics
kubectl top pods -n fms-production
kubectl top nodes

# Describe resources
kubectl describe pod <pod-name> -n fms-production
```

### Azure Monitor
- Enable Container Insights on AKS
- Configure Application Insights for detailed telemetry
- Set up alerts for critical metrics

---

## 🔒 Security

### Container Security
- ✅ Non-root users (UID 1001)
- ✅ Multi-stage builds
- ✅ Minimal base images (Alpine)
- ✅ No secrets in images
- ✅ Security headers configured

### Kubernetes Security
- ✅ RBAC enabled
- ✅ Network policies (optional)
- ✅ Pod security contexts
- ✅ Secrets management
- ✅ Image scanning (ACR)

### Application Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma)

---

## 🚀 Deployment Strategies

### Rolling Update (Default)
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

### Blue-Green Deployment
```powershell
# Deploy new version as separate deployment
kubectl apply -f backend-deployment-green.yaml

# Switch traffic
kubectl patch service fms-backend-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### Canary Deployment
```powershell
# Deploy canary with fewer replicas
kubectl scale deployment/fms-backend-canary --replicas=1

# Monitor metrics and gradually increase
kubectl scale deployment/fms-backend-canary --replicas=3
```

---

## 🔄 CI/CD Pipeline (Recommended)

### GitHub Actions Example
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: |
          docker build -t $ACR_NAME.azurecr.io/fms-backend:${{ github.sha }} ./backend
          docker build -t $ACR_NAME.azurecr.io/fms-frontend:${{ github.sha }} ./frontend
      
      - name: Push to ACR
        run: |
          az acr login --name $ACR_NAME
          docker push $ACR_NAME.azurecr.io/fms-backend:${{ github.sha }}
          docker push $ACR_NAME.azurecr.io/fms-frontend:${{ github.sha }}
      
      - name: Deploy to AKS
        run: |
          kubectl set image deployment/fms-backend fms-api=$ACR_NAME.azurecr.io/fms-backend:${{ github.sha }}
          kubectl set image deployment/fms-frontend fms-web=$ACR_NAME.azurecr.io/fms-frontend:${{ github.sha }}
```

---

## 🐛 Troubleshooting

### Common Issues

**Container won't start**:
```powershell
docker logs <container-name>
kubectl logs <pod-name> -n fms-production
kubectl describe pod <pod-name> -n fms-production
```

**Database connection failed**:
```powershell
# Test from container
docker exec -it fms-api sh
node -e "console.log(process.env.DATABASE_URL)"
```

**Image pull errors**:
```powershell
# Verify ACR integration
az aks check-acr --name <aks-name> --resource-group <rg> --acr <acr-name>
```

📖 See [DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md) for detailed troubleshooting

---

## 📈 Performance Optimization

### Backend
- Connection pooling configured in DATABASE_URL
- Prisma query optimization
- Caching strategy (Redis recommended)

### Frontend
- Code splitting (Vite)
- Lazy loading
- Asset caching (1 year)
- Gzip compression

### Kubernetes
- Horizontal Pod Autoscaling (HPA)
- Resource requests/limits optimized
- Pod anti-affinity rules

---

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Build and test locally with Docker
4. Submit pull request

---

## 📄 License

[Your License Here]

---

## 👥 Team

- **Development**: [Your Team]
- **DevOps**: [Your Team]
- **Support**: [Your Email]

---

## 🔗 Links

- [Production App](https://your-domain.com)
- [API Documentation](https://api.your-domain.com/docs)
- [Azure Portal](https://portal.azure.com)
- [Project Board](https://your-project-board)

---

## 📌 Important Notes

### Before Production Deployment
1. ⚠️ Update all secrets in `k8s/secrets.yaml`
2. ⚠️ Configure SSL/TLS certificates
3. ⚠️ Set up monitoring and alerts
4. ⚠️ Configure backups
5. ⚠️ Review security settings

### Maintenance
- Regular security updates
- Database maintenance windows
- Resource optimization reviews
- Cost analysis (monthly)

---

**Version**: 1.0.0  
**Last Updated**: January 25, 2026  
**Status**: ✅ Production Ready
