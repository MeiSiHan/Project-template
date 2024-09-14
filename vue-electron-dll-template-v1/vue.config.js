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
    }
  },
  css: {
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
  }
})