import { createPinia } from 'pinia'
import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'
import router from './router'
import './samples/node-api'

import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import 'element-plus/dist/index.css'
import 'vue-json-viewer/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersist from 'pinia-plugin-persist';

const pinia = createPinia();
pinia.use(piniaPluginPersist);
const app = createApp(App)
app.use(pinia)
app.use(VXETable)
app.use(router)
app.mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
VXETable.config({
  icon:{
    LOADING: 'vxe-icon-spinner roll vxe-loading--default-icon'
  }
})