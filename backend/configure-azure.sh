#!/bin/bash

# ==============================================================================
# Azure App Service Configuration Script (Bash)
# ==============================================================================
# This script configures all required environment variables for the FMS backend
# Run this script to fix the 500 error on login
# ==============================================================================

set -e

RESOURCE_GROUP="${1:-your-resource-group-name}"
APP_NAME="${2:-be-fms-dev-h6fed7awcqd7cxb5}"

echo "============================================"
echo "  Azure App Service Configuration Script"
echo "============================================"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed!"
    echo "Please install it from: https://aka.ms/installazurecli"
    exit 1
fi

echo "✅ Azure CLI found"

# Login to Azure (if not already logged in)
echo ""
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Not logged in. Opening Azure login..."
    az login
fi

echo "✅ Logged in to Azure"

# Prompt for resource group if not provided
if [ "$RESOURCE_GROUP" == "your-resource-group-name" ]; then
    echo ""
    echo "Available Resource Groups:"
    az group list --query "[].name" -o table
    echo ""
    read -p "Enter your Resource Group name: " RESOURCE_GROUP
fi

echo ""
echo "============================================"
echo "  Configuration Details"
echo "============================================"
echo "Resource Group: $RESOURCE_GROUP"
echo "App Service: $APP_NAME"
echo ""

# Environment variables to configure
echo "Setting environment variables..."
echo ""

az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --settings \
        JWT_SECRET="MY_SECRET_KEY_123" \
        JWT_EXPIRES_IN="1d" \
        DATABASE_URL="postgresql://admins:db-fms-dev6%25681367jHJDHQ(7@db-fms-dev.postgres.database.azure.com:5432/postgres?sslmode=require" \
        CORS_ORIGIN="http://localhost,http://localhost:5173,https://blue-tree-021d4c00f.1.azurestaticapps.net" \
        SUPER_TENANT_ID="05642b69-8f04-44d0-b74c-27c9db4b4969" \
        SYSTEM_SUPER_USER_ID="2930b04c-4b14-4540-a6fc-002093679b8b" \
        NODE_ENV="production" \
    --output none

echo "✅ Environment variables configured"

echo ""
echo "============================================"
echo "  Disabling Azure Built-in CORS"
echo "============================================"
echo ""
echo "Clearing CORS settings (NestJS will handle CORS)..."

# Remove all CORS origins
az webapp cors remove \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --allowed-origins "*" \
    --output none 2>/dev/null || true

echo "✅ Azure built-in CORS disabled"

echo ""
echo "============================================"
echo "  Restarting App Service"
echo "============================================"
echo ""
echo "Restarting $APP_NAME..."

az webapp restart \
    --resource-group "$RESOURCE_GROUP" \
    --name "$APP_NAME" \
    --output none

echo "✅ App Service restarted successfully"

echo ""
echo "============================================"
echo "  Verification"
echo "============================================"
echo ""
echo "Waiting for app to restart (30 seconds)..."
sleep 30

echo ""
echo "Testing health endpoint..."
HEALTH_URL="https://$APP_NAME.azurewebsites.net/health"

if curl -s -f "$HEALTH_URL" | jq . ; then
    echo "✅ Health check successful!"
else
    echo "❌ Health check failed"
    echo "Please check the logs:"
    echo "  az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
fi

echo ""
echo "============================================"
echo "  Configuration Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Test login at: https://$APP_NAME.azurewebsites.net/auth/login"
echo "2. View logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "3. Check health: $HEALTH_URL"
echo ""
echo "⚠️  SECURITY: Update JWT_SECRET to a secure random value for production!"
echo "Generate with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
echo ""
