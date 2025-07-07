// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./database.js');
const server = require('./server.js');


// Função para criar a janela principal do aplicativo
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      // __dirname é o diretório atual do arquivo (pedzap-desktop)
      // path.join junta os caminhos de forma segura para qualquer sistema operacional
      preload: path.join(__dirname, 'preload.js') // Vamos criar este arquivo no futuro
    }
  });

  // Adiciona um Content Security Policy seguro
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://localhost:3001; script-src 'self' http://localhost:3001; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self' http://localhost:3001 ws://localhost:3001; object-src 'none'; frame-ancestors 'none'; base-uri 'self';"
        ]
      }
    });
  });

  // Carrega o arquivo HTML que será a interface do nosso painel
  // mainWindow.loadFile('menu.html');
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));

  // Abre as Ferramentas de Desenvolvedor (DevTools) para depuração.
  // Remova esta linha na versão final do aplicativo.
  mainWindow.webContents.openDevTools();

  // Verifica atualização ao abrir
  checkForUpdates(mainWindow);
}

// Função para verificar se há atualizações disponíveis
function checkForUpdates(mainWindow) {
  try {
    const updateInfo = JSON.parse(fs.readFileSync(path.join(__dirname, 'update-info.json'), 'utf-8'));
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
    if (updateInfo.latestVersion && updateInfo.latestVersion !== pkg.version) {
      mainWindow.webContents.executeJavaScript(`
        alert('Nova versão disponível!\n\nVersão atual: ${pkg.version}\nNova versão: ${updateInfo.latestVersion}\n\nMudanças:\n${updateInfo.changelog}\n\nBaixe em: ${updateInfo.downloadUrl}');
      `);
    }
  } catch (err) {
    console.error('Erro ao verificar atualização:', err);
  }
}

// Este método será chamado quando o Electron terminar a inicialização
// e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
  createWindow();

  // Lógica para reabrir a janela no macOS
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Encerra o aplicativo quando todas as janelas são fechadas (exceto no macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});