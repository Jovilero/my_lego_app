#!/bin/bash

# Lego Parts Tracker - Servidor de Desarrollo para Linux/WSL/SteamDeck

clear
echo "=========================================================="
echo "          LEGO PARTS TRACKER - SERVIDOR LOCAL"
echo "=========================================================="
echo ""
echo "[1] Buscando dirección IP local..."

# Intentar obtener la IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+')
fi

if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP="localhost"
fi

echo ""
echo "=========================================================="
echo " INSTRUCCIONES PARA CONECTAR EL MÓVIL (SAMSUNG A54)"
echo "=========================================================="
echo " 1. Conecta tu Samsung A54 a la misma red WiFi que este PC."
echo " 2. Abre Chrome o tu navegador en el móvil."
echo " 3. Introduce la siguiente dirección:"
echo ""
echo "    http://${LOCAL_IP}:8000"
echo ""
echo " 4. Pulsa en el menú del navegador y selecciona:"
echo "    \"Instalar aplicación\" o \"Añadir a pantalla de inicio\"."
echo "=========================================================="
echo ""
echo "[2] Iniciando servidor web de Python en el puerto 8000..."
echo "Presiona Ctrl+C para detener el servidor."
echo ""

python3 -m http.server 8000
