# Script para compilar o APK Android via Docker Container no Windows
Write-Host "🚀 Iniciando Build do APK Android no Docker..." -ForegroundColor Cyan

# 1. Constrói a imagem Linux do builder se ainda não existir
Write-Host "📦 Verificando/Criando imagem Docker 'mwe-android-builder'..." -ForegroundColor Yellow
docker build -t mwe-android-builder .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao criar a imagem Docker!" -ForegroundColor Red
    exit 1
}

# 2. Executa o container montando a pasta atual e gera o APK
Write-Host "🔨 Compilando o APK dentro do container Linux..." -ForegroundColor Yellow
docker run --rm -v "${PWD}:/app" mwe-android-builder

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK gerado com sucesso! Arquivo salvo em: mwe-treino.apk" -ForegroundColor Green
} else {
    Write-Host "❌ Falha ao compilar o APK via Docker." -ForegroundColor Red
}
