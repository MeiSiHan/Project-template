<template>
<div id="listtable">
    <ul id="tabBox" @click="changeTabs" v-if="userType==1">
      <li class="tabs-item" :class="radiobar==0?'active':''" tabindex="0">{{"userType==1"?"短信":"数传"}}</li>
      <li class="tabs-item" :class="radiobar==1?'active':''" tabindex="1">语音</li>
    </ul>
    <el-table :data="tableData.dataList" style="width: 100%;" height="calc(100% - 36px)" class="listtable" v-if="radiobar==0" :scrollbar-always-on=true @row-click="clickRow">
      <el-table-column prop="terminalName" label="设备名称" width="150">
        <template #default="scope">
        <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :style="tosignalColor(scope.row)">
        <span v-html="tosignlTitle(scope.row)"></span>
          </div>
          </template>
      </el-table-column>
      <el-table-column label="时间" :formatter="toTimes" prop="create_time"></el-table-column>
      <el-table-column label="频率(MHz)" width="100" :formatter="toFreq" prop="signal_freq_normal"></el-table-column>
      <el-table-column prop="terminalName" label="内容">
        <template #default="scope">
        <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :title="toText(scope.row,10)">
        {{toText(scope.row,10)}}
          </div>
          </template>
      </el-table-column>
    </el-table>
    <el-table :data="tableData.voiceList" :key="isupdata" style="width: 100%;" height="calc(100% - 36px)" class="listtable" v-else :crollbar-always-on=true  @row-click="clickRow">
      <el-table-column prop="terminalName" label="设备名称" width="150">
        <template #default="scope">
        <!-- <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :style="tosignalColor(scope.row)" @click="clickRow(scope.row)"> -->
        <div style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" :style="tosignalColor(scope.row)">
        <span v-html="tosignlTitle(scope.row)"></span>
          </div>
          </template>
      </el-table-column>
      <el-table-column label="时间" :formatter="toTimes" prop="create_time"></el-table-column>
      <el-table-column label="频率(MHz)" width="100" :formatter="toFreq" prop="signal_freq_normal"></el-table-column>
      <el-table-column prop="terminalName" label="播放" width="60">
        <template #default="scope">
          <div class="palyIcon off" v-if="playIndex==scope.$index&&playState==1" @click.stop="audioOff(scope.$index)"></div>
          <div class="palyIcon paly" v-else @click.stop="audioPaly(scope.$index,scope.row.audioUrl)"></div>
          </template>
      </el-table-column>
    </el-table>
    <div class="slectbBox">
      <el-button @click="clickAudio" style="height: 24px;" v-if="userType==1">播放所有</el-button>
      <el-radio-group v-model="radiobar" v-else>
        <el-radio :label="0">数传</el-radio>
        <el-radio :label="1">语音</el-radio>
      </el-radio-group>
   </div>
   <AudioApaly :src="audioSrc" ref="audioApaly" @palyState="palyState"></AudioApaly>
  </div>
</template>

<script setup lang='ts'>
import {ref,reactive,onMounted,onActivated, onDeactivated} from 'vue'
import AudioApaly from "@/components/AudioApaly/index.vue"
import {toTimes,toFreq,toText,tosignalColor,tosignlTitle,toSearch} from '@/utils/auth'
import http from '@/api/http'
import { useRouter } from 'vue-router'
import userStore from "@/store/user"
const store = userStore()
const router=useRouter()
let userType:any=ref('0')
userType.value=store.userInfo.userType
const emit = defineEmits(['clickRow','clickAudio'])
let tableData=reactive({
  dataList:[] as any[],
  voiceList:[]
})
let radiobar=ref(1)
let playIndex=ref()//音频播放数
let playState=ref(0)//音频播放状态
let audioApaly=ref()
let audioSrc=ref('/')
const isupdata=ref(false)
function onload(){
  var times:any=store.userTime
  var nowtime=times.nowTimes
  getVoice(nowtime)
  getData(nowtime)
}
function getData(times:string[]){
   var sigfil = {
      "startTime": times[0],
      "endTime": times[1],
      "signalType": 2,
      "signalMark": 4,
  }
  var sigfils = JSON.stringify(sigfil)
  var dataparam = {
      "page": 1,
      "rows": 10000,
      "signalFilter": sigfils
  }
  http.post('/signal/list',dataparam).then((res:any) => {
            if(res.data.success){
              tableData.dataList=res.data.rows
            }
      }).catch(res => {
      })
}
function setData(data:any){
  // tableData.dataList=data
  tableData.dataList = data.filter((item:any) => item.signalMark !== 0 && item.signalMark !== 1)
}
function getVoice(times:string[]){
   var sigfil = {
      "startTime": times[0],
      "endTime": times[1],
      "signalType": 1,
      "signalMark": 4,
  }
  var sigfils = JSON.stringify(sigfil)
  var dataparam = {
      "page": 1,
      "rows": 10000,
      "signalFilter": sigfils
  }
  http.post('/signal/list',dataparam).then((res:any) => {
            if(res.data.success){
              tableData.voiceList=res.data.rows
            }
      }).catch(res => {
      })
}

function setVoice(data:any){
   let newArr= data.filter((item:any) => item.signalMark != "0" && item.signalMark != "1")
    isupdata.value=!isupdata.value
    tableData.voiceList=newArr
}
//跳转检索页面
function toSiganl(){
  let userTime:any=store.userTime
  let times=userTime.nowTimes
  let signalType=2 //1语音
  if(radiobar.value==1){
    signalType=1
  }
  let info={
      "startTime":times[0],
      "endTime": times[1],
      "signalType": signalType,
      "signalMark": 4,
  }
  var seach=toSearch(info)
  userStore().setSearch(seach)
  router.push({ path: '/signal',query: { search: 's' }  })
}
//tab
function changeTabs(e){
let changeNum=e.target.attributes.tabindex.value
radiobar.value=parseInt(changeNum)
}

function audioPaly(num:number,src:string){
playIndex.value=num
playState.value=1
audioSrc.value=src
audioApaly.value.onload(src)
}
function audioOff(num:number){
playIndex.value=num
playState.value=0
audioApaly.value.off()
}
function palyState(num:number){
  if(num==0){
    playState.value=0
  }
}
function clickRow(row:any){
emit('clickRow', row)
}
function clickAudio(){
  let userTime:any=store.userTime
  let times=userTime.nowTimes
  let requestInfo={
    termInfo:{
        "startTime": times[0],
        "endTime": times[1],
        "signalMark":4,
    },
    nowPages:1,
    pageSize:20,
    types:3,//1列表播放全部，2列表播放单项，3非法可疑全部
  }
  emit("clickAudio",requestInfo)
}
onMounted(()=>{
  // onload()
})
onDeactivated(() => {
  audioOff(playIndex.value)
})
defineExpose({onload,toSiganl,setData,setVoice})
</script>
<style scoped lang='scss'>
#listtable{
  width: 100%;
  height: 100%;
  position: relative;
  .slectbBox{
      position:absolute;
      top:-30px;
      left:0;
      z-index: 10;
      .el-radio:first-child{
        margin-right: 6px;
      }
    }
}
// tab
#tabBox{
  width: 100%;
  text-align: center;
  height: 30px;
  line-height: 30px;
  li{
    display: inline-block;
    color: #009cf4;
    height: 26px;
    line-height: 26px;
    width: 100px;
    text-align: center;
    background-color: #fff;
    cursor: pointer;
  }
  li:first-child{
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
  }
  li:nth-child(2){
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
  }
  li.active{
    background-color: #009cf4;
    color:#fff;
  }
}
:deep(.palyIcon){
  display:inline-block;
  width:22px;
  height: 22px;
  cursor: pointer;
  background-size: 100% 100%;
  vertical-align: middle;
}
:deep(.paly){
  background: url("@/assets/icons/common/tablepalyico.png") no-repeat;
}
:deep(.off){
  background: url("@/assets/icons/common/tableoffico.png") no-repeat;
}
</style>
