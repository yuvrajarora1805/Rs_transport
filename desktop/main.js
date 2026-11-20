const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
let frontendProcess = null;
let isQuitting = false;

const BACKEND_PORT = 4000;
const FRONTEND_PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

function checkServiceReady(port, maxAttempts = 30, intervalMs = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        clearInterval(interval);
        resolve(true);
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error(`Service on port ${port} failed to start in time.`));
        }
      });
      req.end();
    }, intervalMs);
  });
}

function startBackend() {
  const backendDir = path.join(ROOT_DIR, 'backend');
  const entryPoint = path.join(backendDir, 'dist', 'src', 'main.js');
  backendProcess = spawn('node', [entryPoint], {
    cwd: backendDir,
    env: { ...process.env, PORT: String(BACKEND_PORT), NODE_ENV: 'production' },
    stdio: 'pipe',
  });

  backendProcess.stdout?.on('data', (d) => console.log(`[Backend] ${d}`));
  backendProcess.stderr?.on('data', (d) => console.error(`[Backend Err] ${d}`));
}

function startFrontend() {
  const frontendDir = path.join(ROOT_DIR, 'frontend');
  frontendProcess = spawn('npm', ['run', 'start'], {
    cwd: frontendDir,
    env: { ...process.env, PORT: String(FRONTEND_PORT) },
    shell: true,
    stdio: 'pipe',
  });

  frontendProcess.stdout?.on('data', (d) => console.log(`[Frontend] ${d}`));
  frontendProcess.stderr?.on('data', (d) => console.error(`[Frontend Err] ${d}`));
}

function stopChildProcesses() {
  if (isQuitting) return;
  isQuitting = true;
  if (backendProcess) {
    try { backendProcess.kill(); } catch (e) {}
  }
  if (frontendProcess) {
    try { frontendProcess.kill(); } catch (e) {}
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 320,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    center: true,
    webPreferences: { nodeIntegration: false },
  });

  const splashHtml = `
    <html>
      <body style="margin:0; background:linear-gradient(135deg, #0f172a, #1e293b); color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; border-radius:16px; border:1px solid #334155; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
        <h2 style="margin:0 0 8px 0; color:#38bdf8; font-size:22px; letter-spacing:0.5px;">RS TRANSPORT ERP</h2>
        <p style="margin:0 0 24px 0; color:#94a3b8; font-size:13px;">Dedicated Desktop Client • Offline Ready</p>
        <div style="width:240px; height:4px; background:#334155; border-radius:2px; overflow:hidden;">
          <div style="width:100%; height:100%; background:#38bdf8; animation:load 1.8s infinite ease-in-out;"></div>
        </div>
        <p style="margin:16px 0 0 0; color:#cbd5e1; font-size:11px;">Initializing Local Database & Services...</p>
        <style>
          @keyframes load { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        </style>
      </body>
    </html>
  `;
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    show: false,
    title: 'RS Transport ERP',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${FRONTEND_PORT}`);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

app.whenReady().then(async () => {
  createSplashWindow();
  startBackend();
  startFrontend();

  try {
    await Promise.all([
      checkServiceReady(BACKEND_PORT, 25),
      checkServiceReady(FRONTEND_PORT, 25),
    ]);
    createMainWindow();
  } catch (err) {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    dialog.showErrorBox(
      'Startup Notice',
      `Could not initialize services automatically:\n${err.message}\n\nPlease verify MySQL is running on port 3306.`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopChildProcesses();
  app.quit();
});

app.on('before-quit', () => {
  stopChildProcesses();
});

