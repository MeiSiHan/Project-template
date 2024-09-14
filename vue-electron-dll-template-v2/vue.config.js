const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports =defineConfig({
  lintOnSave:false,//vue name报错
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      //因为这两个模块中包含原生 C代码，所以要在运行的时候再获取，而不是被webpack打包到bundle中
      externals: ['ffi-napi', 'ref-napi'],
      // builderOptions: {
      //   extraResources: { 
      //     // 拷贝静态文件到指定位置,否则打包之后出现找不到资源的问题.将整个resources目录拷贝到 发布的根目录下 https://juejin.cn/post/6968342888690221086
      //     from: 'resources/',
      //     to: './'
      //   }
      // },
      // 指定创建asar存档时要解压的文件，解决合成子线程的依赖包找不到的问题 https://blog.csdn.net/weixin_43276017/article/details/131415415
      // asarUnpack: [
      //   './node_modules/ffi-napi/**/*',
      //   './node_modules/ref-napi/**/*',
      //   './node_modules/debug/**/*',
      //   './node_modules/ms/**/*',
      //   './node_modules/node-gyp-build/**/*',
      //   './node_modules/ref-struct-di/**/*',
      // ],
      builderOptions: {
        // 在这里的配置将会和默认配置合并，然后传递给electron-builder
        appId: 'com.example.vue-electron', // 项目唯一标识
        productName: 'Vue-Electron', // 打包产物的前缀
        copyright: 'Copyright © year ${author}', // 可用使用${}引用package.json里面配置项，配置项不存在会报错
        directories: {
            output: 'dist' // 打包产物的位置
        },
        extraResources: [
            { "from": "resources", "to": "../" },
            { "from": "localfile", "to": "../" },
        ],
        // ------- Mac 相关配置
        mac: {
              icon: 'build/icons/icon.icns', // 应用图标
              category: 'public.app-category.utilities', // 应用类型
              target: ['dmg'] // 打包的目标类型(默认是dmg和zip),支持很多类型，具体看文档
          }
      }
    }
  },
  css: {
    // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
    // 也可以是一个传递给 `extract-text-webpack-plugin` 的选项对象
    //https://www.zhihu.com/question/551480015/answer/3052847163
    //extract: true,
    // 是否开启 CSS source map？
    //sourceMap: false,
    // 为所有的 CSS 及其预处理文件开启 CSS Modules。
    // 这个选项不会影响 `*.vue` 文件。
    //modules: false,
  // 为预处理器的 loader 传递自定义选项。比如传递给
    // Css-loader 时，使用 `{ Css: { ... } }`。
    loaderOptions: {
      // `sass` 选项仅在 Ruby Sass 处理器中被设置
      // 这里我们使用 `dart-sass`，它具有更好的性能
      // sass: {
      //   prependData: `@import "@/styles/variables.scss";`
      // }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src') //使用 @/ 的引用都会直接指向 src 目录
      }
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ]
  },
  devServer:{
    client: {
      overlay: false//弹窗显示
    }
  }
  // 代理
    /* devServer: {
      port: 8080,
      // host: 'localhost',
      https: false, // https:{type:Boolean}
      open: true, // 配置自动启动浏览器
      disableHostCheck: true,
        "proxy": {
        "/*": {
            "target": "http://xxx",
            "changeOrigin": true
        }
      }
    }, */
})