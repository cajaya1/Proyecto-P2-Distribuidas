@echo off
REM LogiFlow - Script de construcción y despliegue con Docker (Batch)
echo ============================================
echo    LogiFlow - Docker Build and Deploy
echo ============================================
echo.

echo Seleccione una opcion:
echo 1. Construir y levantar todo
echo 2. Solo levantar servicios
echo 3. Detener servicios
echo 4. Ver logs
echo.
set /p option=Opcion: 

if "%option%"=="1" (
    echo.
    echo Construyendo y levantando todos los servicios...
    docker-compose up -d --build
    echo.
    echo Sistema desplegado!
    echo Frontend: http://localhost:80
    echo RabbitMQ: http://localhost:15672
)

if "%option%"=="2" (
    echo.
    echo Levantando servicios...
    docker-compose up -d
)

if "%option%"=="3" (
    echo.
    echo Deteniendo servicios...
    docker-compose down
)

if "%option%"=="4" (
    echo.
    echo Mostrando logs...
    docker-compose logs -f
)

pause
