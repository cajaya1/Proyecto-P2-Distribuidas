@echo off
echo Levantando servicios Fase 2...
echo.

cd /d "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2"

echo Levantando auth-service...
start "Auth Service" cmd /k "cd auth-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak

echo Levantando pedido-service...
start "Pedido Service" cmd /k "cd pedido-service && mvnw.cmd spring-boot:run"
timeout /t 30 /nobreak

echo Levantando tracking-service...
start "Tracking Service" cmd /k "cd tracking-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak

echo Levantando notification-service...
start "Notification Service" cmd /k "cd notification-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak

echo Levantando graphql-service...
start "GraphQL Service" cmd /k "cd graphql-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak

echo Levantando websocket-service...
start "WebSocket Service" cmd /k "cd websocket-service && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak

echo Levantando api-gateway...
start "API Gateway" cmd /k "cd api-gateway && mvnw.cmd spring-boot:run"

echo.
echo ✓ Todos los servicios estan levantandose
echo.
echo Espera 2-3 minutos y luego ejecuta: test-phase2.ps1
echo.
pause
