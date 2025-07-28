# run-migration.ps1
# PowerShell script to run the image migration

Write-Host "🚀 Starting NutriWise AI Image Migration" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if firebase-admin is installed
if (-not (Test-Path "node_modules\firebase-admin")) {
    Write-Host "📦 Installing firebase-admin..." -ForegroundColor Yellow
    npm install firebase-admin
}

Write-Host ""
Write-Host "📊 Step 1: Analyzing current database structure..." -ForegroundColor Cyan
node analyze-firestore-structure.js

Write-Host ""
Write-Host "🔄 Step 2: Running image migration..." -ForegroundColor Cyan
node migrate-to-firebase-images.js

Write-Host ""
Write-Host "🌙 Step 3: Running initial sync..." -ForegroundColor Cyan
node nightly-sync-service.js

Write-Host ""
Write-Host "✅ Migration completed!" -ForegroundColor Green
Write-Host "📁 Check the following files for detailed results:" -ForegroundColor Yellow
Write-Host "  - firestore-analysis.json" -ForegroundColor Gray
Write-Host "  - migration-report.json" -ForegroundColor Gray
Write-Host "  - sync-log-$(Get-Date -Format 'yyyy-MM-dd').json" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "2. Check AI Advisor page for working images" -ForegroundColor White
Write-Host "3. Schedule nightly-sync-service.js to run daily" -ForegroundColor White
