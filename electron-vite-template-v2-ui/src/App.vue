<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import { ElConfigProvider } from "element-plus"
import zhCn from "element-plus/es/locale/lang/zh-cn"
import {ref,provide,nextTick,reactive} from "vue"
import Index from "./views/index/index.vue";
import { useRouter } from "vue-router";




//   let isRouter=ref(true)
// const reload = async () => {
//       isRouter.value = false;
//       await nextTick(() => {
//         isRouter.value = true;
//       });
//     };
//     provide("reload",reload)
</script>

<template>
<el-config-provider :locale="zhCn">
  <router-view></router-view>
</el-config-provider>
  <!-- <Index></Index> -->
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
