Write-Host 'Verificando preparacion para Render...' -ForegroundColor Cyan
Write-Host ''

$errors = 0
$warnings = 0

Write-Host 'Verificando archivos necesarios...' -ForegroundColor Yellow
$requiredFiles = @('Dockerfile', 'package.json', 'server/prisma/schema.prisma', 'server/entrypoint.sh')

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host '  OK: ' $file -ForegroundColor Green
    } else {
        Write-Host '  FALTA: ' $file -ForegroundColor Red
        $errors++
    }
}

Write-Host ''
Write-Host 'Verificando Git...' -ForegroundColor Yellow
try {
    $gitStatus = git status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host '  OK: Repositorio Git inicializado' -ForegroundColor Green
    }
} catch {
    Write-Host '  ERROR: Git no inicializado' -ForegroundColor Red
    $errors++
}

Write-Host ''
Write-Host '===================================================' -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host 'TODO LISTO PARA DESPLEGAR EN RENDER' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Lee RENDER_DEPLOYMENT.md para instrucciones completas' -ForegroundColor Cyan
} else {
    Write-Host 'HAY ERRORES QUE DEBES CORREGIR' -ForegroundColor Red
    Write-Host 'Errores: ' $errors -ForegroundColor Red
}

Write-Host '===================================================' -ForegroundColor Cyan
