'use strict'

import { app, protocol, BrowserWindow ,ipcMain,Notification,Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import * as ffi from 'ffi-napi'
import {addnumber} from './mydll.js'
import fs from 'fs'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const exePath = path.dirname(app.getPath('exe'))


console.log("exePath", exePath)
//删除日志
function deleteOldLogFiles() {
  let rententionPeriodInMs = 7 * 24 * 60 * 60 * 1000
  let now = new Date().getTime()
  // 时间阈值，创建时间早于此阈值，则删除对应文件
  let thresholdTime = now - rententionPeriodInMs

  let LogsFolderPath = path.join(exePath, "logs")
  console.log("LogsFolderPath", LogsFolderPath)
  let files = fs.readdirSync(LogsFolderPath)
  files.forEach(file => {
    let filePath = path.join(LogsFolderPath, file)
    let fileStat = fs.statSync(filePath)  // 返回文件的文件信息
    let createTimeOfFile = fileStat.ctimeMs  // 获取文件的创建时间

    if (createTimeOfFile < thresholdTime) {
      fs.unlinkSync(filePath)
    }
  })
}


//通知
const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'
//系统通知
function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
async function createWindow() {
  // Create the browser window.
  // console.log(process.env)
  
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 820,
    minHeight: 500,
    title: "数据采集",
    // transparent: true,//透明
    // frame:true,//无边框
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#3b4985',
      height: 60
    },
    webPreferences: {
       // preload: path.join(__dirname, 'preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,//是否启用 Node.js 整合
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,//表示是否启用上下文隔离，默认为 true
      enableRemoteModule: true,//表示是否启用远程模块，默认为 false
      devTools: process.env.NODE_ENV === "development",//表示是否启用开发者工具，默认为 false
    }
  })
  require('@electron/remote/main').initialize();
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    // 跑本地开启这行,打包的时候注掉这行
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  //   const Dll = ffi.Library(path.resolve('dll/MyDLL.dll'), {
  //     Add: ['float', ['float', 'float']],
  //     Hello: ['string', []],
  //     StrLength: ['int', ['string']]
  //   })
  //   console.log('fii.Library Add result:', Dll.Add(1, 2))
	// console.log('fii.Library Add result:', Dll.Add(6, 2))
  // console.log("open",addnumber(10,3))
  
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    //打包的时候开启这行,跑本地注掉这行
    win.loadURL('app://./index.html')
    console.log("load")
  }
  ipcMain.on('setNet', (event,str) => {
    console.log('net',str)
  })
  // Menu.setApplicationMenu(null)
  // showNotification()
  // const Menu=new Menu()
  
}

// Quit when all windows are closed.
// 当所有窗口被关闭了，退出。
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    //try {
     // await installExtension(VUEJS3_DEVTOOLS)
    //} catch (e) {
     // console.error('Vue Devtools failed to install:', e.toString())
    //}
  }
  //隐藏菜单
  Menu.setApplicationMenu(null)
  // const menuTemp = [
  //   {
  //     label: '一级菜单',          
  //     submenu: [
  //       {
  //         type: 'submenu',
  //         label: '二级菜单',
  //         submenu: [
  //           {label: '三级菜单'}]
  //       }
  //     ]
  //   }
  // ]
  //   const menu = Menu.buildFromTemplate(menuTemp)    
  //   Menu.setApplicationMenu(menu)
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
