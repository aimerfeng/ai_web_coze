# 1. Build Backend
Write-Host "Building Backend Image..." -ForegroundColor Green
docker build -f Dockerfile.backend -t aimerfeng/web_coze_foraimer_hr:backend .

# 2. Build Frontend
Write-Host "Building Frontend Image..." -ForegroundColor Green
docker build -f Dockerfile.frontend -t aimerfeng/web_coze_foraimer_hr:frontend .

# 3. Push Backend
Write-Host "Pushing Backend Image..." -ForegroundColor Green
docker push aimerfeng/web_coze_foraimer_hr:backend

# 4. Push Frontend
Write-Host "Pushing Frontend Image..." -ForegroundColor Green
docker push aimerfeng/web_coze_foraimer_hr:frontend

Write-Host "Done! Images pushed to Docker Hub." -ForegroundColor Cyan
