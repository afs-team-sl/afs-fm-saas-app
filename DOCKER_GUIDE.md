# Docker Build & Run Guide

## 🐳 Docker Commands Reference

### Backend (NestJS API)

#### Build the Docker Image
```bash
cd backend
docker build -t fms-backend:latest .
```

#### Run Locally for Testing
```bash
docker run -d \
  -p 3000:3000 \
  --name fms-backend \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require" \
  -e JWT_SECRET="your-super-secret-jwt-key-here" \
  -e JWT_EXPIRES_IN="1d" \
  -e PORT="3000" \
  -e CORS_ORIGIN="http://localhost:5173" \
  -e SUPER_TENANT_ID="05642b69-8f04-44d0-b74c-27c9db4b4969" \
  -e SYSTEM_SUPER_USER_ID="2930b04c-4b14-4540-a6fc-002093679b8b" \
  fms-backend:latest
```

#### Using .env File (Recommended)
```bash
docker run -d \
  -p 3000:3000 \
  --name fms-backend \
  --env-file .env \
  fms-backend:latest
```

#### Check Logs
```bash
docker logs -f fms-backend
```

#### Stop and Remove
```bash
docker stop fms-backend
docker rm fms-backend
```

---

### Frontend (React/Vite)

#### Build the Docker Image
```bash
cd frontend

# Build with environment variables
docker build \
  --build-arg VITE_API_URL=https://your-backend.azurewebsites.net \
  --build-arg VITE_SUPER_TENANT_ID=05642b69-8f04-44d0-b74c-27c9db4b4969 \
  --build-arg VITE_SYSTEM_SUPER_USER_ID=2930b04c-4b14-4540-a6fc-002093679b8b \
  -t fms-frontend:latest .
```

#### Run Locally for Testing
```bash
docker run -d \
  -p 80:80 \
  --name fms-frontend \
  fms-frontend:latest
```

Access at: `http://localhost`

#### Check Logs
```bash
docker logs -f fms-frontend
```

#### Stop and Remove
```bash
docker stop fms-frontend
docker rm fms-frontend
```

---

## 🚀 Azure Container Registry Deployment

### Push to Azure Container Registry

#### 1. Login to ACR
```bash
az acr login --name <your-acr-name>
```

#### 2. Tag Images
```bash
# Backend
docker tag fms-backend:latest <your-acr-name>.azurecr.io/fms-backend:latest
docker tag fms-backend:latest <your-acr-name>.azurecr.io/fms-backend:v1.0.0

# Frontend
docker tag fms-frontend:latest <your-acr-name>.azurecr.io/fms-frontend:latest
docker tag fms-frontend:latest <your-acr-name>.azurecr.io/fms-frontend:v1.0.0
```

#### 3. Push to ACR
```bash
# Backend
docker push <your-acr-name>.azurecr.io/fms-backend:latest
docker push <your-acr-name>.azurecr.io/fms-backend:v1.0.0

# Frontend
docker push <your-acr-name>.azurecr.io/fms-frontend:latest
docker push <your-acr-name>.azurecr.io/fms-frontend:v1.0.0
```

---

## 🔄 Docker Compose (Local Development)

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=1d
      - PORT=3000
      - CORS_ORIGIN=http://localhost
      - SUPER_TENANT_ID=${SUPER_TENANT_ID}
      - SYSTEM_SUPER_USER_ID=${SYSTEM_SUPER_USER_ID}
    env_file:
      - ./backend/.env
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:3000
        - VITE_SUPER_TENANT_ID=${SUPER_TENANT_ID}
        - VITE_SYSTEM_SUPER_USER_ID=${SYSTEM_SUPER_USER_ID}
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=fms
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Run with Docker Compose
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 🧪 Testing Docker Images

### Backend Health Check
```bash
curl http://localhost:3000/api
# Should return Swagger API documentation
```

### Frontend Health Check
```bash
curl http://localhost/health
# Should return "healthy"
```

### Check Environment Variables Inside Container
```bash
# Backend
docker exec fms-backend printenv | grep -E 'JWT_SECRET|DATABASE_URL|CORS_ORIGIN'

# Frontend (build-time only, won't show VITE_ vars at runtime)
docker exec fms-frontend cat /usr/share/nginx/html/index.html | grep -o 'VITE_API_URL'
```

---

## 📦 Image Size Optimization

### Check Image Sizes
```bash
docker images | grep fms
```

### Expected Sizes
- **Backend**: ~150-200 MB (Alpine-based)
- **Frontend**: ~50-80 MB (Nginx Alpine)

### Further Optimization
- Use multi-stage builds (already implemented)
- Remove unnecessary dependencies
- Use `.dockerignore` files (already created)
- Consider using distroless images for production

---

## 🔐 Security Best Practices

1. **Never hardcode secrets** in Dockerfiles
2. **Use environment variables** for all configuration
3. **Scan images** for vulnerabilities:
   ```bash
   docker scan fms-backend:latest
   docker scan fms-frontend:latest
   ```
4. **Run as non-root user** (already implemented in Dockerfiles)
5. **Keep base images updated**
6. **Use specific image tags** instead of `latest` in production

---

## 📝 Notes

- Backend Dockerfile includes **OpenSSL** for Prisma on Alpine Linux
- Frontend is served by **Nginx** for production performance
- Both images use **multi-stage builds** for smaller final images
- Health check endpoints are configured for monitoring
- **dumb-init** is used in backend for proper signal handling

---

**Last Updated**: January 22, 2026
