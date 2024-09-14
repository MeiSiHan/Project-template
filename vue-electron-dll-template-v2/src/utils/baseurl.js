import { BrowserWindow } from '@electron/remote'
import { dialog, app, shell } from '@electron/remote'
import { ipcRenderer, electron } from 'electron'
import moment from 'moment/moment'
import fs from 'fs'
import path from 'path'

export function getSystem() {
  //这是mac系统
  if (process.platform == "darwin") {
    return 1;
  }
  //这是windows系统
  if (process.platform == "win32") {
    return 2;
  }
  //这是linux系统
  if (process.platform == "linux") {
    return 3;
  }
}
/**
 *
 * @file 文件路径
 */
export function getFilePath (localFileName) {
  const localFileUrlList = { // 要生成的文件的本地文件路劲
    'app.asar': {
      win: '\\resources\\app.asar',
      mac: '/resources/app.asar'
    },
    'update.asar': {
      win: '\\resources\\update.asar',
      mac: '/resources/update.asar'
    },
    'download.bat': {
      win: '\\download.bat',
      mac: '/download.bat'
    }
  }
  const exePath = path.dirname(app.getPath('exe'))
  console.log('localFileName', localFileName)
  if (getSystem() === 1) {
    return exePath + localFileUrlList[localFileName].mac
  } else {
    return exePath + localFileUrlList[localFileName].win
  }
}
/**
 *
 * @returns 获取安装路径
 */
export function getExePath() {
  // return path.dirname("C:");
  return path.dirname(electron.remote.app.getPath("exe"));
}
/**
 *
 * @returns 获取配置文件路径
 */
export function getConfigPath() {
  if (getSystem() === 1) {
    return getExePath() + "/config.json";
  } else {
    return getExePath() + "\\config.json";
  }
}
/**
 * 读取配置文件
 */
export function readConfig() {
  return new Promise((res, rej) => {
    console.log("fs", fs)
    fs.readFile(getConfigPath(), "utf-8", (err, data) => {
      let config = ""
      if (data) {
        //有值
        config = JSON.parse(data)
      }
      res(config)
    })
  })
}
export function readFiles(){
  const exePath = path.dirname(app.getPath('exe'))
  let timeStr = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  let dateStr = moment(new Date()).format("YYYY-MM-DD")
  let LogsFolderPath = path.join(exePath, "logs")
  let logFilePath = path.join(LogsFolderPath, `log-${dateStr}.log`)
console.log(logFilePath)
  // 如果文件夹不存在，则新建
  var checkDir = fs.existsSync(LogsFolderPath);
  console.log(checkDir)
  if (!fs.existsSync(LogsFolderPath)) {
    fs.mkdirSync(LogsFolderPath)
  }
}
