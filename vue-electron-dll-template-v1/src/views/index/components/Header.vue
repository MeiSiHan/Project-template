<template>
  <div class="header-box">
    <div class="flex-item">
      <img class="header-logo" src="@/assets/icons/common/logo.png" />
    </div>
    <div class="header-text">
      <span>{{ userInfo.data.pageTitle }}</span>
    </div>
    <div class="flex-item header-bar">
      <ul class="nav-ul">
        <li class="nav-li menu-btn" @click="toUrl">
          <span class="navico menuicon"></span>
          <span>菜单页</span>
        </li>
        <li class="nav-li">
          <span class="navico usericon"></span>
          <span>{{ userInfo.data.userName }}</span>

          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <span class="menubar"></span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="1">非法提醒
                  <el-switch v-model="isOpen" @change="changeState" style="margin-left:6px"/>
                </el-dropdown-item>
                <el-dropdown-item command="2">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </li>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Header",
});
</script>
<script lang='ts' setup>
// import { defineComponent } from "vue";
// export default defineComponent({
//   name: "Header",
//   data() {
//     return {
//       headertext: "考试保障指挥中心",
//       userinfo: {
//         name: "admin"
//       }
//     }
//   }
// });
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage, ElLoading, ElNotification } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { ref,reactive, h,onMounted } from 'vue'
import http from '@/api/http'
import userStore from "@/store/user"
const store = userStore()
const router = useRouter()
let isOpen = ref(true)
let userInfo: any =reactive({
  data:{}
})


const headertext: string = "考试保障指挥中心"

const handleCommand = (command: string | number | object) => {
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
        http.post('/user/logout').then((res: any) => {
          if (res.data.success) {
            
          } else {
            // ElMessage.error('退出失败')
          }
        }).catch(res => {
        })
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
    // let requst = {
    //   "_id": userInfo.userName,
    //   "notifyStatus": states
    // }
    // http.post('/user/notifyStatus', requst).then((res: any) => {
    //   if (res.data.success) {
    //     ElNotification({
    //       title: 'Success',
    //       message: '修改成功',
    //       type: 'success',
    //     })
    //   } else {
    //     ElMessage.error('修改失败')
    //   }
    // }).catch(res => {
    //   console.log(res);
    // })

  }
}
function changeState(){
  let states = 0 //打开
    if (isOpen.value) {
      states = 0
    } else {
      states = 1
    }
    let requst = {
      "_id": userInfo.data._id,
      "notifyStatus": states
    }
    http.post('/user/notifyStatus', requst).then((res: any) => {
      if (res.data.success) {
        ElNotification({
          title: '非法提醒',
          message: '修改成功',
          type: 'success',
        })
        if(states==0){
          isOpen.value=true
        }else{
          isOpen.value=false
        }
        store.$patch((state) => {
              state.userInfo.notifyStatus = states
        })
      } else {
        ElMessage.error('修改失败')
        if(states==0){
          isOpen.value=false
        }else{
          isOpen.value=true
        }
      }
      
    }).catch(res => {
    })
}
const openVn = () => {
  // ElMessage({
  //   message: h('p', null, [
  //     h('span', null, 'Message can be '),
  //     h('i', { style: 'color: teal' }, 'VNode'),
  //   ]),
  // })
}
function toUrl() {
  router.push({ path: '/signal'})
}
onMounted(()=>{
  userInfo.data=store.userInfo
  if(userInfo.data.notifyStatus==1){
  isOpen.value=false
}
})
</script>




<style scoped lang='scss'>
$bg-color: #ddd;
$inblock: inline-block;

.header-box {
  position: fixed;
  top: 0;
  left: 0;
  height: 90px;
  width: 100%;
  padding: 0 1%;
  box-sizing: border-box;
}

.header-logo {
  width: 238px;
  height: 36px;
  display: $inblock;
  float: left;
  margin-top: 9px;
}

.header-text {
  position: relative;
  margin-left: 27%;
  width: 46%;
  height: 80px;
  line-height: 56px;
  text-align: center;
  font-size: 34px;
  font-weight: normal;
  font-stretch: normal;
  letter-spacing: 2px;
  color: #23cefd;
  background: url("@/assets/icons/index/titleicon.png") no-repeat;
  background-size: 100% 100%;
}

.header-bar {
  font-size: 20px;
  text-align: center;
  display: $inblock;
  right: 10px;
  top: 10px;
  position: absolute;
}

.nav-ul {
  font-size: 14px;
  display: flex;

  .nav-li {
    height: 30px;
    line-height: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: 20px;

    .navico {
      width: 25px;
      height: 25px;
      margin-right: 4px;
      display: $inblock;
    }

    .menuicon {
      background: url("@/assets/icons/common/menuicon.png") no-repeat 100% 100%;
    }

    .usericon {
      background: url("@/assets/icons/common/usericon.png") no-repeat 100% 100%;
    }
  }
}

.menu-btn {
  cursor: pointer;
}

.menubar {
  display: $inblock;
  width: 0;
  height: 0;
  border-width: 8px;
  border-style: solid;
  cursor: pointer;
  margin: 8px 0 0 6px;
  border-color: #ffffff transparent transparent transparent;
}

// 时间选择框
</style>
