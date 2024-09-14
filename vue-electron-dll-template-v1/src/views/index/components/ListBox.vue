<template>
  <div id="listtable">
    <el-table :data="dataInfo.deviceList" :key="isUpdate" style="width: 100%;" height="100%" :row-style="{height: '30px'}" :cell-style="{'white-space': 'nowrap','text-overflow': 'ellipsis'}" class="listtable">
      <el-table-column prop="terminalName" label="设备名称" width="150">
        <template #default="scope">
        <div :style="toColor(scope.row)" class="tablecont">
        <span v-html="toTitle(scope.row)" class="tername" @click="showPie(scope.$index)"></span>
        <span class="modify" @click="modifyName(scope.row)"></span>
          </div>
          </template>
      </el-table-column>
      <el-table-column label="地址">
        <template #default="scope">
          <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :title="scope.row.workArea" @click="clickRow(scope.row)">{{ toAddress(scope.row) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" v-if="userType==0||userType==2">
        <template #default="scope">
          <span class="text-color-1" @click="toSiganl(scope.row)">详情</span>
        </template>
      </el-table-column>
      <el-table-column label="播放" width="60" v-else-if="userType==1">
        <template #default="scope">
          <a class="text-color-1" @click="toAudio(scope.row)">播放</a>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="centerDialogVisible" title="修改设备名" width="540px" center>
    <div class="dialogbox">

    
    <div>
      <span class="label">设备名:</span>
      <el-input
      v-model="oldName"
      class="w-50 m-2"
      size="small"
      style="width:150px"
      disabled
    />
    </div>
    <div>
      <span class="label">新设备名:</span>
      <el-input
      v-model="newName"
      class="w-50 m-2"
      size="small"
      style="width:150px"
      placeholder="请输入设备名称"
    /></div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="modifyNames(0)">还原</el-button>
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="modifyNames(1)"
          >确定</el-button
        >
      </span>
    </template>
    </el-dialog>
  </div>
</template>

<script setup lang='ts'>
import {onMounted,computed,reactive, ref} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {toColor,toTitle,toAddress} from '@/utils/auth/totable'
import http from '@/api/http'
import { useRouter, useRoute } from 'vue-router'
import {toSearch} from '@/utils/auth'
import userStore from "@/store/user"
import { number } from 'echarts'
interface dataType{
  deviceList:any[]
}
let dataInfo:dataType=reactive({
  deviceList:[] 
})
const store = userStore()
const router=useRouter()
let userType:any=ref('0')
userType.value=store.userInfo.userType
let centerDialogVisible=ref(false)
const isUpdate=ref<boolean>(false)
let newName=ref('')
let oldName=ref('')
let terminalID=ref('')
const emit=defineEmits(['setVeiwMap','updataChild','showPie','clickAudio'])
function toSiganl(data:any){
  let userTime:any=store.userTime
  let times=userTime.nowTimes
  let info={
      "startTime":times[0],
      "endTime": times[1],
      "terminal_Name":data.terminalName
  }
  var seach=toSearch(info)
  userStore().setSearch(seach)
  router.push({ path: '/signal',query: { search: 's' }  })
}
function toAudio(data:any){
  let userTime:any=store.userTime
  let times=userTime.nowTimes
  let requestInfo={
    termInfo:{
        "startTime": times[0],
        "endTime": times[1],
        "terminal_Name": data.terminalName,
        "groupId":null,
        "terminal_ID": [],
    },
    nowPages:1,
    pageSize:20,
    types:2,//1列表播放全部，2列表播放单项，3非法可疑全部
  }
  emit("clickAudio",requestInfo)
}
function setData(data:any){
  dataInfo.deviceList=[]
  let datas=sortData(data)
  isUpdate.value=!isUpdate.value
  dataInfo.deviceList=datas
}
function sortData(data:any){
data.sort(function(a,b){
  if(a.terminalStatus<b.terminalStatus){
    return -1
  }else if(a.terminalStatus==b.terminalStatus){
    if(a.cheat_count<b.cheat_count){
      return 1
    }else if(a.cheat_count==b.cheat_count){
      if(a.uncertain_count<b.uncertain_count){
        return 1
      }else if(a.uncertain_count>b.uncertain_count){
        return -1
      }else{
        return 0
      }
    }else{
      return -1
    }
  }else{
    return 1
  }
})
return data
}
function clickRow(data:any){
  let long=data.longitude/10000000
  let lat=data.latitude/10000000
  if(long>180||long<0||lat>90||lat<0) return false
  emit('setVeiwMap',long,lat)
}
function showPie(num:number){
  emit('showPie',num)
}
function modifyName(data:any){
  centerDialogVisible.value=true
  oldName.value=data.terminalName
  terminalID.value=data.terminal_ID
}
function modifyNames(data:any){
  if(newName.value==""&&data==1){
    ElMessage({
                type: 'error',
                message: "新设备名不能为空",
              })
    return false
  }
      let requst={
        user_id:store.userInfo.user_ID,
        terminal_guid:terminalID.value,
        terminal_name:newName.value
      }
      if(data==0){
        requst.terminal_name=''
      }
      http.post('/terminal/custom',{custom_name:JSON.stringify(requst)}).then((res:any) => {
            if(res.data.success){
              ElMessage({
                type: 'success',
                message: '修改成功',
              })
              centerDialogVisible.value=false
              emit('updataChild')
            }else{
              ElMessage({
                type: 'error',
                message: res.data.msg,
              })
            }
      }).catch(res => {
      })
   
}
onMounted(() =>{
})
defineExpose({setData})
</script>
<style scoped lang='scss'>
#listtable {
  width: 100%;
  height: 100%;
}
.text-color-1{
  color: #0efcff;
  cursor: pointer;
}
.tablecont{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-right: 20px;
  box-sizing: border-box;
  width: 100%;
  position: relative;
}
.tername{
  cursor: pointer;
}
.modify{
  display: inline-block;
  width: 20px;
  height: 20px;
  background-color: #0efcff;
  display: none;
  position:absolute;
  right: 0;
  top:0;
  cursor: pointer;
  z-index: 1;
  background: url("@/assets/icons/common/pen.png") no-repeat 100% 100%;
}
.tablecont:hover .modify{
  display: block;
}
//设备弹窗
.dialogbox{
  div{
    margin:0 auto;
    height: 30px;
    line-height: 30px;
    width:220px;
    .label{
      display: inline-block;
      width: 70px;
      letter-spacing: 2px;
    }
  }
}
</style>
<!-- <style>
#listtable .el-table th,#listtable .el-table tr,#listtable .el-table td{
 border: 0;
background: transparent !important;
color: #fff;
 }
#listtable table{
background: transparent !important;
}

</style> -->




<!-- <style>
/* 表格样式
.el-table__header th, .el-table__header tr {
  background:transparent;
  color: white;
}
.el-table--enable-row-hover .el-table__body tr:hover>td{
  background: transparent !important;
}
.el-pager li.active {
  color: #080909;
  cursor: default;
  background-color: #17B3A3;
  border-radius: 2px;
}
.el-table th, .el-table tr {
  background-color: transparent;
}
.el-table th, .el-table tr,.el-table td{
  background-color: transparent;
}
.el-table th:hover, .el-table tr:hover{
  color: #4A95F6;
  background-color: darkgray!important;
}
.el-table--striped .el-table__body tr.el-table__row--striped.current-row td,
.el-table__body tr.current-row>td, .el-table__body tr.hover-row.current-row>td,
.el-table__body tr.hover-row.el-table__row--striped.current-row>td,
.el-table__body tr.hover-row.el-table__row--striped>td, .el-table__body tr.hover-row>td {
    color: #4A95F6;
    background-color: darkgray!important;
} */


/* 去掉背景颜色 */
.el-table{
  background-color:transparent;
  color: #fff;
  background: transparent;
}
.el-table th,.el-table tr,.el-table td,.el-table th.el-table__cell{
 border: 0;
background: transparent;
 }
 /* 表格头部 */
 .el-table thead{
   color: #fff;
 }
 /* 表格下划线 */
 .el-table td.el-table__cell{
   border-bottom: 0;
 }
 /* 表格最下面下划线 */
 .el-table__inner-wrapper::before{
   height:0;
 }
 /* hover效果 */
 .el-table th:hover,
  .el-table tr:hover{
  color: #4A95F6;
  background-color: darkgray;
}
</style> -->