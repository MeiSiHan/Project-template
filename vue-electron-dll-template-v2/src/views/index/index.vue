<template>
  <div class="page-box">
    <Header @changeTabs="changeTabs"></Header>
    <div class="page-main-box">
      <!-- <el-tabs
        v-model="activeName"
        type="border-card"
        class="main-tabs"
        @tab-click="handleClick"
      >
        <el-tab-pane label="数据采集" name="first">User</el-tab-pane>
        <el-tab-pane label="算法验证" name="second">Config</el-tab-pane>
      </el-tabs> -->
      <div class="tabs-main" v-show="tabMain==0">
        <DataBox></DataBox>
      </div>
      <div class="tabs-main" v-show="tabMain==1">
        1
      </div>
    </div>
    <!-- <p>路径{{ pageData.route }}</p> -->
  </div>
</template>
<script setup>
import { ref,reactive,onMounted } from 'vue'
import Header from './components/Header.vue'
import DataBox from './components/DataBox.vue'
import { ElMessageBox, ElMessage, ElLoading, ElNotification } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import userStore from '@/store/user.js';
import { storeToRefs } from 'pinia'
const store = userStore()
const { name } = storeToRefs(store)
const router = useRouter()
const tabMain=ref(0)
const route = useRoute()
const activeName = ref('first')//tabname
const pageData=reactive({
  route:""
})
onMounted(()=>{
  console.log(route)
  pageData.route=route
})
function changeTabs(num){
  console.log(num)
  tabMain.value=num
}
const handleClick = (tab,event) => {
  console.log(tab, event)
}
</script>
<style scoped lang="scss">
.page-box{
  background-color:#e2e3ed;
  width: 100%;
  height: 100%;
  min-width: 880px;
  box-sizing: border-box;
  padding:0 20px 10px 20px;
}
.page-main-box{
  height: calc(100% - 60px);
  width: 100%;
}
.tabs-main{
  width: 100%;
  height: 100%;
}
</style>