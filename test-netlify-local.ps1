# Quick Netlify Local Test Script
# Tests build and runtime in production mode

Write-Host "🚀 Testing Netlify Build Locally..." -ForegroundColor Cyan
Write-Host ""

# Check required environment variables
$requiredVars = @("DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Get-Content "env:${var}" -ErrorAction SilentlyContinue)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Set them in .env.local or as environment variables" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables check passed" -ForegroundColor Green
Write-Host ""

# Set Netlify environment
$env:NETLIFY = "true"
$env:NODE_ENV = "production"

# Test build
Write-Host "🔨 Testing build..." -ForegroundColor Cyan
npm run build:netlify-local

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed! Fix errors above before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build test passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start production server: npm run start" -ForegroundColor White
Write-Host "   2. Test login at http://localhost:3000/login" -ForegroundColor White
Write-Host "   3. Test upload functionality" -ForegroundColor White
Write-Host "   4. Check health: http://localhost:3000/api/health/database" -ForegroundColor White
Write-Host ""
Write-Host "✅ If all tests pass, you're ready to deploy to Netlify!" -ForegroundColor Green

