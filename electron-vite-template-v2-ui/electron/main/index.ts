import { app, BrowserWindow, shell, ipcMain ,dialog,Menu,MenuItem,Notification} from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import path from 'node:path'
import fs from 'fs';
// import koffi from 'koffi'
import { v4 as uuidv4 } from 'uuid';
import { TCPNet } from './nets';
import { checkAndReadJSONFile } from './readfiles'
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 获取当前用户的 AppData 目录
//const appDataDir = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
// 获取运行缓存目录路径
//const cachePath = app.getPath('userData');

let win: BrowserWindow | null = null

let signalTcp: any = "" //频谱仪tcp
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')


// let dllpath = path.join(process.cwd(), "/dll/IQToSpectrum.dll")
// const myDll = koffi.load(dllpath);
// // 请求频谱数据（模拟）
// let handleMsgToDll = myDll.func('char* iqToSpectrumMsgToDll(const char*, uint64_t, uint64_t, uint32_t, int32_t, uint32_t)');
// // 连接真机频谱仪
// let initSpectrum = myDll.func('bool initSpectrum(const char*, short, int)');
// // 断开真机频谱仪
// let uninitSpectrum = myDll.func('bool uninitSpectrum()');
// // 真机频谱仪参数控制(开始回调)
// let setDevPara = myDll.func('bool setDevPara(const uint64_t, uint64_t, uint32_t)');
// // 真机频谱仪参数控制
// let stopDevPara = myDll.func('bool stopDevPara()');
// // 回调函数类型定义
// let msgCallBackFun = koffi.proto('void myMsgCallBackFun(int, const char*, int, const char*)'); // 消息回调函数
// let registCallBackFunc = myDll.func('bool registmsgiqToSpecCallBackFun(myMsgCallBackFun *cb)'); // 注册回调函数
// function msgCallfunc(messageID, paraJson, datalen, data) {
//   let responses = { messageID, paraJson, datalen, data }
//   win?.webContents.send("call-msg-dll", responses)
//   responses = null
// }
// let cb = koffi.register(msgCallfunc, koffi.pointer(msgCallBackFun));
// registCallBackFunc(cb);
// console.log('koffi Hello result:');



async function createWindow() {
  win = new BrowserWindow({
    title: '北斗',
    width: 1600,
    height: 800,
    show:true,
    frame: true,  // 禁用默认窗口框架
    //transparent: true,  // 使窗口背景透明，方便自定义样式
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,//开启true这一步很重要,目的是为了vue文件中可以引入node和electron相关的API
      contextIsolation: false,// 可以使用require方法
      webSecurity: false,//允许跨域
    },
  })

  // 去掉菜单栏
  //Menu.setApplicationMenu(null);

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
    //win.webContents.openDevTools()
    // 设置全屏显示
    //win.setFullScreen(true);
    //最大化
    //BrowserWindow.getFocusedWindow().maximize()
    //win.maximize();
  } else {
    //win.maximize();
    win.loadFile(indexHtml)
  }
if (process.env.NODE_ENV === 'development') {
    const contextMenu = new Menu(); // 创建菜单
    // 添加菜单项
    contextMenu.append(new MenuItem({
      label: '刷新页面',
      click: () => {
        win?.reload();
      }
    }));

    contextMenu.append(new MenuItem({
      label: '开发工具',
      click: () => {
        win?.webContents.openDevTools();
      }
    }));
    // 监听右键点击事件
    win.webContents.on('context-menu', (event, params) => {
      // 显示右键菜单
      contextMenu.popup({ window: win });
    });

    win?.on('resize', () => {
      win?.webContents.send("window-max-reply", win?.isMaximized())
    })
   }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344

  // 获取 Electron 应用的根目录
  // const appRootDir = app.getAppPath();
  const appDataDir = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Local');
  //console.log("appDataDir",appDataDir);
  // 获取运行缓存目录路径
  const cachePath = app.getPath('userData');
  //console.log("cachePath",cachePath);
 // console.log("appData",app.getPath('appData'));
 // console.log("getAppMetrics",app.getAppMetrics());
 // console.log("versions.chrome",process.versions.chrome)
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
  // 打开的窗口，那么程序会重新创建一个窗口。
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

//https://blog.csdn.net/L_15737525552/article/details/131884028
// //自定义最小化
ipcMain.on('window-min', () => {
  // 窗口最小化
  BrowserWindow.getFocusedWindow().minimize()
})

//自定义最大化
ipcMain.on('window-max', (event, obj) => {
  // 窗口最大化 如果是最大化就取消最大化
  if (BrowserWindow.getFocusedWindow().isMaximized()) {
    // 取消最大化并设置窗口尺寸
    BrowserWindow.getFocusedWindow().unmaximize()
    BrowserWindow.getFocusedWindow().setSize(1300, 800)
    // obj.max = false
  }
  // 窗口不是最大化就进行最大化
  else {
    BrowserWindow.getFocusedWindow().maximize()
    // obj.max = true
  }
})

// //自定义关闭
ipcMain.on('window-close', () => {
  // 窗口关闭
  BrowserWindow.getFocusedWindow().close()
  app.quit()
})
// 获取窗口状态
ipcMain.on("curWindow", (event) => {
  event.reply('windowStatus', win.isMaximized());
});
//读取目录json文件
ipcMain.on('read-baseJson', (event, filePath, type) => {
  let files = path.join(process.cwd(), filePath)
  checkAndReadJSONFile(files).then((data: any) => {
    let datas = JSON.parse(data)
    event.sender.send('read-basefileEvent', datas.files_list);
  }).catch(error => {
    console.error('read file basejson error:', error);
  })
});

// tcp连接
function uint8ArrayToString(u8a: any) {
  var dataStr = "";
  for (var i = 0; i < u8a.length; i++) {
    dataStr += String.fromCharCode(u8a[i])
  }
  return dataStr;
}

//频谱仪网络tcp连接
ipcMain.on('create-signalTcp', (event, ips, port, ids) => {
  console.log('create-signalTcp', ips, port)
  if (signalTcp) {
    signalTcp.close()
  }
  signalTcp = new TCPNet(ips, port)
  signalTcp.onConnect(function () {
    console.log('signal tcp connet');
    win?.webContents.send('connect-signal', { id: ids, code: '200', data: 1, success: true, msg: '频谱仪连接成功' });
  })
  signalTcp.connect()
  signalTcp.onError((err) => {
    console.log(`signal tcp err: ${err}`)
    win?.webContents.send('connect-signal', { id: ids, code: '201', data: 0, success: false, msg: '频谱仪网络出错' });
    signalTcp = null
  })
  signalTcp.onData(function (data) {
    let datas = data
    var stringtext = uint8ArrayToString(data.data)
    datas.data = stringtext
    //console.log("cuss data",data)
    // win?.webContents.send('freqNum',{nums:freqs})
    // win?.webContents.send('message',freqs)

    if (data?.type == "0101") {
      win?.webContents.send('connect-signal-state', { code: '201', data: datas, success: true, msg: '频谱仪连接正常' });
    } else {
      win?.webContents.send('signal-message', datas);
    }
    //event.sender.send('message-signal', data);
  })
})