<!--
 * @Author: you
 * @Date: 2023-09-01 16:44:35
 * @Description: 
 * 
-->
# vue3-electron

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
### 安装
npm install -g @vue/cli@4.5.7
# OR
yarn global add @vue/cli
vue create myproject
vue add electron-builder
npm run electron:serve
#安装 element-plus 
npm install element-plus --save
##按需引入
npm install -D unplugin-vue-components unplugin-auto-import

### 安装路由 See [vue-router](https://router.vuejs.org/zh/installation.html).
npm install vue-router@4
### 安装pinia [pinia](https://router.vuejs.org/zh/installation.html).
npm install pinia
### 安装sass [sass配置](https://blog.csdn.net/qq_35624642/article/details/122559122)
npm install -D sass-loader@^10 sass
### 设置别名 [别名](https://blog.csdn.net/weixin_42369612/article/details/128673118)

### 引入dialog报错解决
npm install --save @electron/remote
主进程中
require('@electron/remote/main').initialize();
渲染进程
import { BrowserWindow } from '@electron/remote'
import { dialog,app,shell } from '@electron/remote'
### 读取配置文件 参考文章
https://blog.csdn.net/weixin_45689946/article/details/128482084
### 安装 moment 
npm install moment --save
### 打包配置
https://www.xjx100.cn/news/325487.html?action=onClick
https://blog.csdn.net/weixin_42508580/article/details/130760495
### 打包报错
https://www.likecs.com/show-305324457.html