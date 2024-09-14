<template>
  <div class="header-box">
    <div class="header-left">
      <ul class="tabs-ul">
        <li class="tabs-li cursor" :class="[tabnum==0?'tabs-active':'']" @click="changeTab(0)">
          <span>数据采集</span>
        </li>
        <li class="tabs-li cursor" :class="[tabnum==1?'tabs-active':'']" @click="changeTab(1)">
          <span>算法验证</span>
        </li>
      </ul>
      <div class="header-state">
        <span class="state-label">信号源：</span>
        <span class="state-success">连接成功</span>
        <span class="state-label">设备：</span>
        <span class="state-error">连接成功</span>
      </div>
    </div>
    
    <div class="header-bar">
      <ul class="nav-ul">
        <li class="nav-li menu-btn" @click="openFile">
          <span>存储目录配置</span>
        </li>
        <li class="nav-li menu-btn" @click="openNet">
          <span>网络设置</span>
        </li>
        <li class="nav-li menu-btn" @click="openDirect">
          <span>信号源指令配置</span>
        </li>
      </ul>
    </div>
    <!-- 存储路径 -->
    <FilePath ref="filepath"></FilePath>
    <!-- 网络设置 -->
    <NetWork ref="networks"></NetWork>
    <!-- 信号源指令设置 -->
    <DirectForm ref="directform"></DirectForm>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header",
});
</script>
<script setup>
import FilePath from '@/components/FilePath/index.vue';
import NetWork from '@/components/NetWork/index.vue';
import DirectForm from '@/components/DirectForm/index.vue';
import { ElMessageBox, ElMessage, ElLoading, ElNotification } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { ref,reactive, h,onMounted } from 'vue'
import userStore from "@/store/user"
const emit = defineEmits(['changeTabs'])
const store = userStore()
const router = useRouter()
let isOpen = ref(true)
const tabnum=ref(0)
const filepath=ref(null)//文件路径弹窗
const networks=ref(null)//网络设置弹窗
const directform=ref(null)//信号源指令设置弹窗
let userInfo =reactive({
  data:{}
})
function changeTab(num){
tabnum.value=num
emit('changeTabs',num)
}
//打开文件设置
function openFile(){
  filepath.value.showDialog()
}
//打开网络设置
function openNet(){
  networks.value.showDialog()
}
//打开信号源配置设置
function openDirect(){
  directform.value.showDialog()
}
const handleCommand = (command) => {
  // const loading = ElLoading.service({
  //   lock: true,
  //   text: 'Loading',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  // setTimeout(() => {
  //   loading.close()
  // }, 2000)
  // ElMessage(`click on item ${command}`)
  if (command == 2) {
    ElMessageBox.confirm(
      '是否退出系统？',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }
    )
      .then(() => {
        
        router.push({ path: '/login' })
      })
      .catch(() => {

      })
  } else if (command == 1) {
    let states = 0
    if (isOpen.value == true) {
      isOpen.value = false
      states = 1
    } else {
      isOpen.value = true
      states = 0
    }
    

  }
}

function toUrl() {
  router.push({ path: '/'})
}
onMounted(()=>{
})
</script>




<style scoped lang='scss'>
$bg-color: #ddd;
$inblock: inline-block;
.header-box {
  height: 60px;
  display: flex;
  width: 100%;
  justify-content : space-between;
}
/**tabs */
.header-left{
  height: 40px;
  display: flex;
}
.tabs-ul{
  display: inline-block;
  margin-top: 20px;
  .tabs-li{
    display: inline-block;
    width: 86px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background-color: #e5e5e5;
    border-radius: 6px 6px 0px 0px;
    border: solid 1px #cfd1d3;
    box-sizing: border-box;
  }
  .tabs-active{
    background-color: #fff;
    border: solid 1px #fff;
  }
}

.header-state{
  font-size: 14px;
  color: #777e8e;
  height: 30px;
  line-height: 30px;
  margin-top: 30px;
  margin-left: 40px;
  display: inline-block;
}
.state-label{
  margin-right: 10px;
  margin-left: 10px;
}
.state-success{
  color: #00b01e;
}
.state-error{
  color: #ff1818;
}
.header-bar {
  display: $inblock;
  height: 60px;
  line-height: 60px;
}

.nav-ul {
  font-size: 14px;
  display: inline-block;
  .nav-li {
    display: inline-block;
    width: 96px;
    text-align: center;
    font-size: 12px;
    height: 30px;
    line-height: 30px;
    background-color: #ffffff;
    border-radius: 6px;
    border: solid 1px #cfd1d3;
    margin-left: 10px;
  }
}

.menu-btn {
  cursor: pointer;
}


// 时间选择框
</style>
