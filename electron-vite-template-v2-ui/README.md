# electron-vite-vue

🥳 Really simple `Electron` + `Vue` + `Vite` boilerplate.

<!-- [![awesome-vite](https://awesome.re/mentioned-badge.svg)](https://github.com/vitejs/awesome-vite) -->
<!-- [![Netlify Status](https://api.netlify.com/api/v1/badges/ae3863e3-1aec-4eb1-8f9f-1890af56929d/deploy-status)](https://app.netlify.com/sites/electron-vite/deploys) -->
<!-- [![GitHub license](https://img.shields.io/github/license/caoxiemeihao/electron-vite-vue)](https://github.com/electron-vite/electron-vite-vue/blob/main/LICENSE) -->
<!-- [![GitHub stars](https://img.shields.io/github/stars/caoxiemeihao/electron-vite-vue?color=fa6470)](https://github.com/electron-vite/electron-vite-vue) -->
<!-- [![GitHub forks](https://img.shields.io/github/forks/caoxiemeihao/electron-vite-vue)](https://github.com/electron-vite/electron-vite-vue) -->
[![GitHub Build](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml/badge.svg)](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml)
[![GitHub Discord](https://img.shields.io/badge/chat-discord-blue?logo=discord)](https://discord.gg/sRqjYpEAUK)

## Features

📦 Out of the box  
🎯 Based on the official [template-vue-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-vue-ts), less invasive  
🌱 Extensible, really simple directory structure  
💪 Support using Node.js API in Electron-Renderer  
🔩 Support C/C++ native addons  
🖥 It's easy to implement multiple windows  

## Quick Setup

```sh
# clone the project
git clone https://github.com/electron-vite/electron-vite-vue.git

# enter the project directory
cd electron-vite-vue

# install dependency
npm install

# develop
npm run dev
```

## Debug

![electron-vite-react-debug.gif](https://github.com/electron-vite/electron-vite-react/blob/main/electron-vite-react-debug.gif?raw=true)

## Directory

```diff
+ ├─┬ electron
+ │ ├─┬ main
+ │ │ └── index.ts    entry of Electron-Main
+ │ └─┬ preload
+ │   └── index.ts    entry of Preload-Scripts
  ├─┬ src
  │ └── main.ts       entry of Electron-Renderer
  ├── index.html
  ├── package.json
  └── vite.config.ts
```

<!--
## Be aware

🚨 By default, this template integrates Node.js in the Renderer process. If you don't need it, you just remove the option below. [Because it will modify the default config of Vite](https://github.com/electron-vite/vite-plugin-electron-renderer#config-presets-opinionated).

```diff
# vite.config.ts

export default {
  plugins: [
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
  ],
}
```
-->

## FAQ

- [C/C++ addons, Node.js modules - Pre-Bundling](https://github.com/electron-vite/vite-plugin-electron-renderer#dependency-pre-bundling)
- [dependencies vs devDependencies](https://github.com/electron-vite/vite-plugin-electron-renderer#dependencies-vs-devdependencies)
## 配置build
```javascript
npm install --save-dev electron-builder
```
electron-build github地址：https://github.com/electron-userland/electron-builder
//github 文件下载失败 https://blog.csdn.net/weixin_40954498/article/details/140114624
```json
{
"build": {  
  "appId": "your.id", // 应用的唯一ID  
  "productName": "YourProductName", // 安装后生成的文件夹和快捷方式的名称  
  "nsis": {  
    "oneClick": false, // 是否一键安装，如果为 false，则显示安装向导  
    "allowElevation": true, // 是否允许请求提升（以管理员身份运行）  
    "allowToChangeInstallationDirectory": true, // 是否允许用户更改安装目录  
    "createDesktopShortcut": true, // 是否在桌面上创建快捷方式  
    "createStartMenuShortcut": true, // 是否在开始菜单中创建快捷方式  
    "shortcutName": "YourAppName", // 快捷方式的名称  
    "uninstallDisplayName": "Your App", // 卸载时显示的名称  
    "license": "path/to/license.txt", // 许可证文件的路径  
    "installerIcon": "path/to/installer-icon.ico", // 安装程序图标的路径  
    "uninstallerIcon": "path/to/uninstaller-icon.ico", // 卸载程序图标的路径  
    "installerHeaderIcon": "path/to/header-icon.ico", // 安装向导头部的图标路径  
    "installerSidebarIcon": "path/to/sidebar-icon.bmp", // 安装向导侧边栏的图标路径（必须是 BMP 格式）  
    "runAfterFinish": true, // 安装完成后是否运行应用  
    "perMachine": true, // 是否为所有用户安装（而非仅当前用户）  
    "script": "path/to/custom-nsis-script.nsh", // 自定义 NSIS 脚本的路径  
    "compression": "lzma", // 压缩方式，可选值包括 'none', 'zip', 'lzma' 等  
    "artifactName": "${productName}-${version}-Setup.${ext}", // 自定义输出文件的名称  
  },
}                  
//原文链接：https://blog.csdn.net/CMDN123456/article/details/140922066
```
## 淘宝新镜像地址 electron 下载失败
```js
// 下载地址 https://www.jianshu.com/p/3d1a1cdeb0d2
npm config set registry https://registry.npmmirror.com/
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
npm config set sqlite3_binary_host_mirror https://npmmirror.com/mirrors/sqlite3/
npm config set chromedriver_cdnurl https://npmmirror.com/mirrors/chromedriver/
npm config set operadriver_cdnurl https://npmmirror.com/mirrors/operadriver/
npm config set fse_binary_host_mirror https://npmmirror.com/mirrors/fsevents/
```

## "koffi": "^2.9.2",