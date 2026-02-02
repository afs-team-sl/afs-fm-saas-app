# ==============================================================================
# Azure App Service Configuration Script
# ==============================================================================
# This script configures all required environment variables for the FMS backend
# Run this script to fix the 500 error on login
# ==============================================================================

param(
    [string]$ResourceGroup = "your-resource-group-name",
    [string]$AppName = "be-fms-dev-h6fed7awcqd7cxb5"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Azure App Service Configuration Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Azure CLI is not installed!" -ForegroundColor Red
    Write-Host "Please install it from: https://aka.ms/installazurecli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure CLI found" -ForegroundColor Green

# Login to Azure (if not already logged in)
Write-Host ""
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
$loginStatus = az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Opening Azure login..." -ForegroundColor Yellow
    az login
}

Write-Host "✅ Logged in to Azure" -ForegroundColor Green

# Prompt for resource group if not provided
if ($ResourceGroup -eq "your-resource-group-name") {
    Write-Host ""
    Write-Host "Available Resource Groups:" -ForegroundColor Cyan
    az group list --query "[].name" -o table
    Write-Host ""
    $ResourceGroup = Read-Host "Enter your Resource Group name"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration Details" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "App Service: $AppName" -ForegroundColor White
Write-Host ""

# Environment variables to configure
$envVars = @{
    "JWT_SECRET" = "MY_SECRET_KEY_123"
    "JWT_EXPIRES_IN" = "1d"
    "DATABASE_URL" = "postgresql://admins:db-fms-dev6%25681367jHJDHQ(7@db-fms-dev.postgres.database.azure.com:5432/postgres?sslmode=require"
    "CORS_ORIGIN" = "http://localhost,http://localhost:5173,https://blue-tree-021d4c00f.1.azurestaticapps.net"
    "SUPER_TENANT_ID" = "05642b69-8f04-44d0-b74c-27c9db4b4969"
    "SYSTEM_SUPER_USER_ID" = "2930b04c-4b14-4540-a6fc-002093679b8b"
    "NODE_ENV" = "production"
}

Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    $displayValue = if ($key -eq "DATABASE_URL" -or $key -eq "JWT_SECRET") { 
        "$($value.Substring(0, [Math]::Min(20, $value.Length)))..." 
    } else { 
        $value 
    }
    
    Write-Host "  Setting $key = $displayValue" -ForegroundColor White
    
    az webapp config appsettings set `
        --resource-group $ResourceGroup `
        --name $AppName `
        --settings "$key=$value" `
        --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to set $key" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Disabling Azure Built-in CORS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Clearing CORS settings (NestJS will handle CORS)..." -ForegroundColor Yellow

# Remove all CORS origins
az webapp cors remove `
    --resource-group $ResourceGroup `
    --name $AppName `
    --allowed-origins "*" `
    --output none 2>$null

Write-Host "✅ Azure built-in CORS disabled" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Restarting App Service" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Restarting $AppName..." -ForegroundColor Yellow

az webapp restart `
    --resource-group $ResourceGroup `
    --name $AppName `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App Service restarted successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to restart App Service" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Verification" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting for app to restart (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
$healthUrl = "https://$AppName.azurewebsites.net/health"

try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -ErrorAction Stop
    Write-Host "✅ Health check successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    if ($response.warnings -and $response.warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  Warnings detected:" -ForegroundColor Yellow
        foreach ($warning in $response.warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the logs:" -ForegroundColor Yellow
    Write-Host "  az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test login at: https://$AppName.azurewebsites.net/auth/login" -ForegroundColor White
Write-Host "2. View logs: az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host "3. Check health: $healthUrl" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  SECURITY: Update JWT_SECRET to a secure random value for production!" -ForegroundColor Yellow
Write-Host "Generate with: node -e `"console.log(require('crypto').randomBytes(64).toString('hex'))`"" -ForegroundColor White
Write-Host ""
