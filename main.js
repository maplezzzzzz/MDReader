const { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem } = require('electron');
const path = require('path');

let mainWindow; // 在最上面定义 mainWindow 变量
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // 确保路径指向 preload.js
            contextIsolation: true,
            enableRemoteModule: true,
            nodeIntegration: true, // 禁用 Node 集成
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => {
        mainWindow = null; // 在窗口关闭时重置 mainWindow
    });
}

// 在 Electron 应用程序启动时创建窗口
app.whenReady().then(() => {
    createWindow();
    createMenu();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 处理打开文件的请求
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Markdown Files', extensions: ['md'] }, // 只允许打开 Markdown 文件
        ],
    });

    return result.filePaths; // 返回选中的文件路径
});

// 处理打开文件夹的请求
ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'], // 允许选择文件夹
    });

    return result.filePaths; // 返回选中的文件夹路径
});



/**
 * 创建菜单
 */
function createMenu() {
    const menu = Menu.getApplicationMenu(); // 获取当前菜单
    if (menu) {
        // 找到“文件”菜单项
        const fileMenu = menu.items.find(item => item.label === 'File');
        if (fileMenu) {
            // 添加“打开文件”菜单项
            fileMenu.submenu.append(new MenuItem({
                label: '打开文件',
                click: openFile,
            }));
            // 添加“打开文件夹”菜单项
            fileMenu.submenu.append(new MenuItem({
                label: '打开文件夹',
                click: openFolder,
            }));
        } else {
            console.log('未找到“文件”菜单项');
        }
        // 更新菜单
        Menu.setApplicationMenu(menu);
    } else {
        console.log('未找到菜单');
    }
}


/**
 * 打开文件
 */
async function openFile() {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Markdown Files', extensions: ['md'] }, // 只允许打开 Markdown 文件
        ],
    });
    // 直接通知渲染进程进行文件渲染
    mainWindow.webContents.send('file-opened', result.filePaths);
}

/**
 * 打开文件夹
 */
async function openFolder() {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'], // 允许选择文件夹
    });
    mainWindow.webContents.send('folder-opened', result.filePaths);
}