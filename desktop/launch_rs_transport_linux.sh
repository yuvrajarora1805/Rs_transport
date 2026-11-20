#!/usr/bin/env bash

# RS Transport ERP - Dedicated Linux Desktop Launcher
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$DIR")"

echo "==================================================="
echo "         RS TRANSPORT ERP - LINUX DESKTOP"
echo "         Offline-First Weighbridge Edition"
echo "==================================================="

# 1. Check local MySQL
if ! ss -tuln | grep -q ':3306 '; then
    echo "[!] MySQL not running on port 3306. Attempting system service check..."
    systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb || {
        echo "[WARN] Please start MySQL/MariaDB service (e.g. sudo systemctl start mysql)."
    }
else
    echo "[OK] MySQL is active on port 3306."
fi

# 2. Start Backend
echo "[*] Starting Backend service on port 4000..."
cd "$ROOT_DIR/backend" && npm run start:prod >/dev/null 2>&1 &
BACKEND_PID=$!

# 3. Start Frontend
echo "[*] Starting Frontend service on port 3000..."
cd "$ROOT_DIR/frontend" && npm run start >/dev/null 2>&1 &
FRONTEND_PID=$!

cleanup() {
    echo -e "\n[*] Stopping RS Transport ERP services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[*] Waiting for services to initialize..."
sleep 4

# 4. Launch dedicated Chrome / Chromium / Edge in App mode
if command -v google-chrome &> /dev/null; then
    google-chrome --app="http://localhost:3000" --start-maximized &
elif command -v chromium-browser &> /dev/null; then
    chromium-browser --app="http://localhost:3000" --start-maximized &
elif command -v chromium &> /dev/null; then
    chromium --app="http://localhost:3000" --start-maximized &
elif command -v microsoft-edge &> /dev/null; then
    microsoft-edge --app="http://localhost:3000" --start-maximized &
else
    xdg-open "http://localhost:3000" &
fi

echo "[DONE] RS Transport ERP is running!"
echo "Keep this terminal open or press Ctrl+C to close the application."
wait
