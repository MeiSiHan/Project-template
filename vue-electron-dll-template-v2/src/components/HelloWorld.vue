<template>
  <div class="hello">
    <el-button type="success">我是 ElButton</el-button>
    <p>{{ addsnamu }}</p>
    <button @click="addnum">获取cs++</button>
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener">eslint</a></li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
// import {addnumber} from 'electron/ffi/mydll.js'
import * as ffi from 'ffi-napi'
import path from "path";
import { ipcRenderer } from 'electron'
import { ElButton } from 'element-plus'
export default {
  name: 'HelloWorld',
  components: { ElButton },
  props: {
    msg: String
  },
  data(){
    return{
      addsnamu:0
    }
  },
  methods:{
    addnum(){
      // this.addsnamu=add(1,2)
    const Dll = ffi.Library(path.resolve('dll/MyDLL.dll'), {
      Add: ['float', ['float', 'float']],
      Hello: ['string', []],
      StrLength: ['int', ['string']]
    })
    this.addsnamu=Dll.Add(this.addsnamu, 2)
    console.log('fii.Library Add result:', Dll.Add(1, 2))
    ipcRenderer.send('setNet', "连接主进程")
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
