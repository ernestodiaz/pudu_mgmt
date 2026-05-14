# PUDU Service Management - Script de inicio en desarrollo
Write-Host "Iniciando entorno de desarrollo PUDU Service..." -ForegroundColor Cyan

# Iniciar servicios de infraestructura
Write-Host "Iniciando PostgreSQL y Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Esperar a que estén listos
Write-Host "Esperando servicios..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Instalar dependencias backend
Write-Host "Instalando dependencias backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) { npm install }

# Copiar .env si no existe
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Archivo .env creado desde .env.example" -ForegroundColor Green
}

# Ejecutar seed
Write-Host "Ejecutando seed de datos iniciales..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgres://pudu:pudu_secret@localhost:5432/pudu_db"
npx ts-node src/database/seeds/index.ts

Set-Location ..

# Instalar dependencias frontend
Write-Host "Instalando dependencias frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) { npm install }
if (-not (Test-Path ".env.local")) {
    Set-Content ".env.local" "NEXT_PUBLIC_API_URL=http://localhost:3001"
    Write-Host "Archivo .env.local creado" -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "LISTO. Para iniciar el desarrollo:" -ForegroundColor Green
Write-Host "  Backend:  cd backend && npm run start:dev" -ForegroundColor White
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001/api/v1" -ForegroundColor White
Write-Host "  Swagger:   http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Brand Admin:      admin@puduservice.com / Admin1234!" -ForegroundColor White
Write-Host "  Distribuidor:     admin@robotec.cl / Admin1234!" -ForegroundColor White
Write-Host "  Usuario Final:    admin@hyatt-stgo.cl / Admin1234!" -ForegroundColor White
Write-Host "  Tecnico:          tech1@puduservice.com / Admin1234!" -ForegroundColor White
