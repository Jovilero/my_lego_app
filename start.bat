@echo off
title Lego Parts Tracker - Servidor de Desarrollo
clear

echo ==========================================================
echo           LEGO PARTS TRACKER - SERVIDOR LOCAL
echo ==========================================================
echo.
echo [1] Buscando direccion IP local del PC...

:: Obtener la IP local de forma simple
for /f "tokens=4 del tap" %%i in ('route print ^| findstr 0.0.0.0 ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%i
)

if "%LOCAL_IP%"=="" (
    for /f "tokens=2 delims=:" %%f in ('ipconfig ^| findstr /i "IPv4"') do (
        set LOCAL_IP=%%f
    )
)

:: Limpiar espacios
set LOCAL_IP=%LOCAL_IP: =%

echo.
echo ==========================================================
echo  INSTRUCCIONES PARA CONECTAR EL MOVIL (SAMSUNG A54)
echo ==========================================================
echo  1. Conecta tu Samsung A54 a la misma red WiFi que este PC.
echo  2. Abre Chrome o tu navegador en el movil.
echo  3. Introduce la siguiente direccion:
echo.
echo     http://%LOCAL_IP%:8000
echo.
echo  4. Pulsa en el menu del navegador (tres puntos) y selecciona:
echo     "Instalar aplicacion" o "Añadir a pantalla de inicio".
echo ==========================================================
echo.
echo [2] Iniciando servidor web de Python en el puerto 8000...
echo Presiona Ctrl+C para detener el servidor.
echo.

python -m http.server 8000
pause
