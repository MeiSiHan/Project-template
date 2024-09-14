<template>
    <div class="main-box">
        <div class="time-box">
            <span class="text-label">
                时间段:
            </span>
            <el-select v-model="pageTimes.times.timeType" class="time-select" placeholder="请选择" size="small"
                style="width:90px;border-radius: 4px;" @change="changeTimes">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-date-picker v-if="pageTimes.times.timeType == '0'" v-model="pageTimes.times.changeTime" :default-time="defaultTime2" type="datetimerange"
                size="small" range-separator="-" style="width:320px;margin-left:10px;vertical-align: middle;"
                start-placeholder="开始时间" end-placeholder="结束时间" @change="changeTime" :clearable="false" class="time-select" />
        </div>
        <div class="main-item item-list1">
            <div class="item-box item-boxl">
                <div class="list-title">
                    <span class="text">{{barTitle}}</span>
                    <!-- <a class="infor-btn">详情>></a> -->
                </div>
                <div class="list-centre">
                    <BarBox ref="childBar"></BarBox>
                </div>
            </div>
            <div class="item-box item-boxs">
                <PieBox ref="childPie"></PieBox>
            </div>
        </div>
        <div class="main-item item-list2">
            <MapBox @changeMaps="changeMaps" @changeMapssion="changeMapssion" ref="childMap"></MapBox>
        </div>
        <div class="main-item item-list3">
            <div class="show-box">
                <el-checkbox v-model="isShowList" @change="changList" label="显示非法可疑列表" size="large" />
            </div>
            <div class="item-box item-boxl" :class="isShowList ? '' : 'allBox'">
                <div class="list-title clearfix">
                    <el-button @click="clickAudioAll" style="position:absolute;left:0;height: 24px;margin-top: 3px;" v-if="userType==1">播放所有</el-button>
                    <span class="text">设备列表</span>
                    <a class="infor-btn" @click="toDevice()">更多>></a>
                </div>
                <div class="list-centre">
                    <ListBox ref="childList" @setVeiwMap="setVeiwMap" @showPie="showPie" @updataChild="updataChild" @clickAudio="clickAudio"></ListBox>
                </div>
            </div>
            <div class="item-box item-boxs" v-show="isShowList">
                <div class="list-title">
                    <span class="text entrytext" title="非法可疑信号列表">非法可疑信号列表</span>
                    <a class="infor-btn" @click="toSiganl()">更多>></a>
                </div>
                <div class="list-centre">
                    <EntryBox ref="childRntry" @clickRow="clickRow" @clickAudio="clickAudio"></EntryBox>
                </div>
            </div>
        </div>
    </div>
    <SignalDialog :signaldata="signaldata.data" ref="signalDialog"></SignalDialog>
    <SignalsAudio :dataAudios="dataAudios" ref="signalAudios" v-dialogDrag @changeList="changeList"></SignalsAudio>
</template>
<script lang='ts' setup>
import BarBox from "./BarBox.vue"
import PieBox from "./PieBox.vue"
import MapBox from "./MapBox.vue"
import ListBox from "./ListBox.vue"
import EntryBox from "./EntryBox.vue"
import SignalDialog from "@/components/SignalDialog/index.vue"
import SignalsAudio from "@/components/SignalAudio/index.vue"
import { ref, reactive, toRefs, onMounted,onBeforeUnmount,nextTick,watch} from 'vue'
import { gettimeSolt, dateFormat} from '@/utils/auth'
import userStore from "@/store/user"
import {sendSock} from "@/utils/auth/websocket"
import { useRouter } from "vue-router"
import { ElMessage } from 'element-plus'
import http from '@/api/http'
import { AnyAaaaRecord } from "dns"
const store = userStore()
const router=useRouter()
let userType:any=ref(0)
userType.value=store.userInfo.userType
//子组件ref
let childRntry = ref()
let childMap=ref()
let childBar=ref()
let childPie=ref()
let childList=ref()
let signalDialog = ref()
let signalAudios = ref()
let isShowList = ref(true)
let endNums=0
let setupssion:any=0
let barTitle=ref('各区域分布图')
isShowList.value=store.userState.showList
let websocket:any=null
let websessionid:any=''
const defaultTime2=gettimeSolt(0)
let pageTimes= reactive({
    times:{
    timeType: "1",//0 指定时间
    startTime: '',
    endTime: '',
    nowTimes: [],
    changeTime: []}
})
let isshowDialog=ref(true)
let signaldata = reactive({
  data: {},
  dataList:[]
})
let dataAudios = reactive({
  data: {},
  type:0,//0单个
  nums:0,//播放第几个
  dataList:[]
})

toRefs(pageTimes)
// function showRow(data: any) {
//   signaldata.data = data
//   signalDialog.value.setDatas(data)
// }
if(store.userInfo.isChildGroup==1){
    barTitle.value="设备图"
}
if (Object.keys(store.userTime).length == 0) {
// if (store.userTime) {
    pageTimes.times.nowTimes = gettimeSolt(1)
    pageTimes.times.changeTime = gettimeSolt(5)
    userStore().setUserTime(pageTimes.times)
    // userStore().setUserTime(pageTimes)
} else {
    pageTimes.times=store.userTime as any
}

var devicelistarray = []; //设备列表
var mapdevicearray = []; //地图列表
let pageInfo = reactive({
    deviceList: [],//地图设备和设备列表
    illegalList: [],//非法信号
    eachList:{},//各地区分布图数据
    dataList: [],//数传列表
    voiceList: [],//语音列表
})

const options = [
    {
        value: '1',
        label: '一天内',
    },
    {
        value: '2',
        label: '两天内',
    },
    {
        value: '3',
        label: '三天内',
    },
    {
        value: '0',
        label: '指定时间',
    },
]
toRefs(pageInfo)
//地图数据
function changeMaps(data: any) {
    pageInfo.deviceList = data
    childList.value.setData(pageInfo.deviceList)
    childPie.value.setData(pageInfo.deviceList)
    
}
function changeMapssion(){
    updatasession()
}
function setVeiwMap(long:number,lat:number){
     childMap.value.viewMap(long,lat)
}
function showPie(num:number){
     childPie.value.initechart(num)
}
enum FormatsEnums {
    YMDHIS = 'Y-m-d H:i:s'
}
function changList(vla:boolean){
    let datas={
        "showList":vla
    }
    userStore().setShowState(datas)
}
function changeTime() {
    let times = pageTimes.times.changeTime
    let starts = times[0]
    let ends = times[1]
    pageTimes.times.nowTimes = [dateFormat(starts, FormatsEnums.YMDHIS), dateFormat(ends, FormatsEnums.YMDHIS)]
    changeData()
}
//更新页面数据请求
function changeData() {
    ElMessage({
    message: '数据请求中',
    type: 'info',
    duration:1000
  })
  updataChild(true)
}
//更新非法可疑列表
function changeList(nums:number){
    if(nums==1){
        getVoice()//非法可疑语音
    }else{
        getData()//非法可疑数传
    }
}
//地图和分布图
function getmapData(){
  var times: any = store.userTime
    var nowtime = times.nowTimes
    let timestr={
        "startTime": nowtime[0],
        "endTime": nowtime[1]
      }
   http.post('/terminal/allAreaToCount', timestr).then((res: any) => {
    if (res.data.success) {
        pageInfo.eachList=res.data
        childBar.value.setData(pageInfo.eachList)
        childMap.value.setData(res.data.terminalRows)
        childMap.value.setCount(res.data)
    }
    requestend(1)
  }).catch(res => {
  })
}
function getData(){
    var times: any = store.userTime
    var nowtime = times.nowTimes
    let urls='/signal/list'
   var sigfil = {
      "startTime": nowtime[0],
      "endTime": nowtime[1],
      "signalType": 2,
      "signalMark": 4,
  }
  var sigfils = JSON.stringify(sigfil)
  var dataparam = {
      "page": 1,
      "rows": 100,
      "signalFilter": sigfils
  }
  if(times.timeType=="1"){
    urls='/signal/abnormolList'
  }
  http.post(urls,dataparam).then((res:any) => {
            if(res.data.success){
              pageInfo.dataList=res.data.rows
              childRntry.value.setData(pageInfo.dataList)
            }
            requestend(1)
      }).catch(res => {
      })
}
function getVoice(){
    var times: any = store.userTime
    var nowtime = times.nowTimes
    let urls='/signal/list'
   var sigfil = {
      "startTime": nowtime[0],
      "endTime": nowtime[1],
      "signalType": 1,
      "signalMark": 4,
  }
  var sigfils = JSON.stringify(sigfil)
  var dataparam = {
      "page": 1,
      "rows": 100,
      "signalFilter": sigfils
  }
  if(times.timeType=="1"){
    urls='/signal/abnormolList'
  }
  http.post(urls,dataparam).then((res:any) => {
            if(res.data.success){
              pageInfo.voiceList=res.data.rows
              childRntry.value.setVoice(pageInfo.voiceList)
            }
            requestend(1)
      }).catch(res => {
      })
}
//请求完毕
function requestend(nums:number){
    endNums+=nums
    if(endNums==3){
        ElMessage({
            message: '数据请求完毕',
            type: 'success',
            duration:1000
        })
    }
}
//更新子页面数据请求
function updataChild(isrquesed?:boolean){
    // childRntry.value.onload()
    // childBar.value.getData()
    // childMap.value.setData()
    getVoice()//非法可疑语音
    getData()//非法可疑数传
    getmapData()//地图，分布图
    if(isrquesed){
        endNums=0
    }else{
        endNums=6
    }
}
//websocket 设备状态更新
function terminalState(data:any){
    let termList:any=pageInfo.deviceList
    if(termList==null){
        return false
    }else if(termList.length==0){
        updatasession()
    }else{
        let isupdata=false
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let ishave=false
            for (let i = 0; i < termList.length; i++) {
                const dataId = termList[i];
                if(element.terminal_ID==dataId.terminal_ID){
                    dataId.terminalStatus=element.terminalStatus
                    ishave=true
                    isupdata=true
                    break;
                }
            }
            if(ishave==false){
                updatasession()
                break;
            }
        }
        
        //更新包含设备状态
        if(isupdata){
            childMap.value.setData(pageInfo.deviceList)
        }
    }
}
function changeTimes() {
    if (pageTimes.times.timeType != "0") {
        let num = parseInt(pageTimes.times.timeType) - 1
        pageTimes.times.nowTimes = gettimeSolt(num)
        userStore().setUserTime(pageTimes.times)
        changeData()
    }else{
        let changetimes=pageTimes.times.changeTime
        pageTimes.times.nowTimes = [dateFormat(changetimes[0], FormatsEnums.YMDHIS), dateFormat(changetimes[1], FormatsEnums.YMDHIS)]
        userStore().setUserTime(pageTimes.times)
        changeData()
    }
}
function toDevice(){
  router.push({ path: '/devicefilter',query: {type: "false" }})
}
function toSiganl(){
  childRntry.value.toSiganl()
}
function clickRow(data:any){
    signalDialog.value.setData(data)
}
//播放所有
function clickAudioAll(){
    var times: any = store.userTime
    var nowtime = times.nowTimes
  let requestInfo={
    termInfo:{
        "startTime": nowtime[0],
        "endTime": nowtime[1]
    },
    nowPages:1,
    pageSize:20,
    data:1,//1列表播放全部，2列表播放单项，3非法可疑全部
  }
  signalAudios.value.setData(requestInfo)
}
function clickAudio(data:any){
    signalAudios.value.setData(data)
}
// function websocketurl(url:string){
function websocketmessage(msd){
    if ("WebSocket" in window) {
                    // // 打开一个 web socket
                    // if(websocket==null){
                    //     websocket= new WebSocket(url)
                    //     // websocket = new WebSocket('ws://192.168.16.130:8100/area/websocket')
                    // }
                    // websocket.onopen = function () {
                    //     // Web Socket 已连接上，使用 send() 方法发送数据
                    //     // websocket.send("发送数据")
                    //     // console.log("链接websocket")
                    //     let userInfo=store.userInfo
                        
                    //     let gulps=userInfo.groupList
                    //     var formov = {
                    //         "message": "web_user::group_list",
                    //         "user_group_list": gulps.map(Number),
                    //         "user_group_auth": userInfo.userGroupAuth,
                    //         "user_name": userInfo.userName
                    //     }
                    //     websksend(formov)
                    // }

                    // websocket.onmessage = function (msd) {

                        
                        // var redata = JSON.parse(msd.data);
                        var redata = JSON.parse(msd);
                        // console.log("接收",redata)
                        var time = store.userTime.nowTimes[1]
                        var starttime = store.userTime.nowTimes[0]
                        var endtime = store.userTime.nowTimes[1]
                        var time1:number=0//开始时间
                        var time2:number=0//搜索时间
                        var timestamp = new Date().getTime();//当前时间戳
                        if (starttime != undefined&&endtime!= undefined) {
                            time1 = new Date(starttime).getTime();
                            time2 = new Date(endtime).getTime();
                        }
                        // if (time2 < timestamp||time1 > timestamp||pageTimes.times.timeType=="0") {
                        //     return false
                        //     }
                        if (time2 < timestamp||time1 > timestamp) {
                            return false
                        }
                        if (redata.message == "notify::session_id") {
                            websessionid = redata.sessionId;
                        } else if (redata.message == "notify::signal_list_add"||redata.message == "notify::signal_abnormal_add") {
                            // if(pageTimes.times.timeType!="0"){
                            //     // childMap.value.setCounts(redata.signalAllListCount)
                            //     childMap.value.changeCount(redata.signalAllListCount)
                            // }else{
                            //     if (time2 !=0 && time2 > timestamp) {
                            //         childMap.value.changeCount(redata.signalAllListCount)
                            //     }
                            // }


                                childMap.value.changeCount(redata.signalAllListCount)
                        }
                        // else if(redata.message == "area::notify::signal_abnormal_add"){
                        //     childMap.value.changeCount(redata.signalAllListCount)
                        // }
                        else if (redata.message == "notify::signal_abnormal_update") {
                            //非法可疑信号列表
                            // if (pageTimes.times.timeType=="0" && time2 != 0 && timestamp > time2) {


                            // } else {
                                var data = redata.singnalDetailAndMark;
                                for (let i = 0; i < data.length; i++) {
                                    var typenum = data[i].signalDetail.signal_type; // 信号类别 1语音、2数传
                                    var marknum = data[i].mark;
                                    let datas = data[i].signalDetail;
                                    if (typenum == 1) {
                                        if (marknum == 0) {
                                            pageInfo.voiceList.unshift(datas)
                                        } else {
                                            for (let j = 0; j < pageInfo.voiceList.length; j++) {
                                                if (pageInfo.voiceList[j].signal_id == datas.signal_id && marknum == 1) {
                                                    pageInfo.voiceList.splice(j, 1)
                                                    break;
                                                } else if (pageInfo.voiceList[j].signal_id == datas.signal_id && marknum == 2) {
                                                    pageInfo.voiceList.splice(j, 1, datas)
                                                    break;
                                                }
                                            }
                                        }
                                        childRntry.value.setVoice(pageInfo.voiceList)
                                    } else if (typenum == 2) {
                                        if (marknum == 0) {
                                            pageInfo.dataList.unshift(datas)
                                        } else {
                                            for (var k = 0; k < pageInfo.dataList.length; k++) {
                                                if (pageInfo.dataList[k].signal_id == datas.signal_id && marknum == 1) {
                                                    pageInfo.dataList.splice(k, 1)
                                                    break;
                                                } else if (pageInfo.dataList[k].signal_id == datas.signal_id && marknum == 2) {
                                                    pageInfo.dataList.splice(k, 1, datas)
                                                    break;
                                                }
                                            }
                                        }
                                        childRntry.value.setData(pageInfo.dataList)
                                    }
                                }
                            // }
                        } else if (redata.message == "notify::signal_cheat_data") {
                            let ispop=store.userInfo.notifyStatus
                            if(ispop==0){
                                // isshowDialog.value=true
                                // pageInfo.illegalList.push(...redata.cheatRows)
                                signalDialog.value.setDatas(redata.cheatRows)
                            }
                        } else if (redata.message == "notify::terminal_change_data") {
                            terminalState(redata.terminalIdList)
                        }else if(redata.message == "notify::group_signal_count"){//分布图统计
                            let groupList:any=pageInfo.eachList
                            let groupRows=groupList.groupRows
                            if(groupRows==undefined||groupRows.length==0||groupRows==undefined){
                                // getmapData()
                                return false
                                }
                            let datas=redata.gspList
                            for (let index = 0; index < datas.length; index++) {
                                const element = datas[index];
                                if(groupRows.length==0){
                                    groupRows.push(element)
                                }else{
                                    let ishava=true
                                    for (let k = 0; k < groupRows.length; k++) {
                                    const elid = groupRows[k];
                                        if(element.area_id==elid.area_id){
                                            elid.count += element.count;
                                            elid.audio_count += element.audio_count;
                                            elid.digital_count += element.digital_count;
                                            elid.cheat_count += element.cheat_count;
                                            elid.uncertain_count += element.uncertain_count;
                                            elid.normal_count = elid.count - elid.cheat_count - elid.uncertain_count;
                                            ishava=false
                                            break;
                                        }
                                    }
                                    if(ishava){
                                        groupRows.push(element)
                                    }
                                }
                                
                            }
                            childBar.value.setData(pageInfo.eachList)
                        } else if (redata.message == "notify::fly_terminal") {
                            // childMap.value.addflyicon(redata)
                            //childMap.value.flyInfo(redata)
                        }
                        // } else if (redata.message == "notify::fly_heart") {
                        //     addflyfit(redata)
                        //     var ids=$("#usvid").attr("data")
                        //     if (ids !=="") {
                        //         setusv(ids)
                        //     }
                        // } else if (redata.message == "notify::uav_info") {
                        //     addflynum(redata)
                        //     // addflyico(redata)
                        // } else if (redata.message == "notify::fly_break") {
                        //     outfly(redata)
                        // } else if (redata.message == "notify::dev_img") {
                        //     // addflyimg(redata)
                        //     childMap.value.flyInfo(redata)
                        // } else if (redata.message == "notify::track_dev_param") {
                        // //     deviceinfo(redata)
                        // }
                    // }

                    // websocket.onclose = function (e) {
                    //     // 关闭 websocket
                    //     console.log("连接已关闭...",websocket.readyState)
                    //     console.log(e)
                    // }
                    // websocket.onerror = function (evt) {
                    //     if (websocket.readyState == 2 || websocket.readyState == 3) {
                    //         websocket.onopen();
                    //     }
                    // }
                } else {
                    // 浏览器不支持 WebSocket
                    // alert("您的浏览器不支持 WebSocket!")
                }
}
function websksend(datas:any) {
    var formval = JSON.stringify(datas);
    if (websocket.readyState == 0) {
        setTimeout(function () {
            websocket.send(formval)
        }, 500);
    } else if (websocket.readyState == 1) {
        websocket.send(formval)
    }
}
function getsession(){
        let username=store.userInfo.userName
        http.post('/user/updateSession', {"userName": username}).then((res: any) => {
        if (res.data.success) {
            updataChild()
        }
        }).catch(res => {
        })
    }
const updatasession=throttles(getsession,30000)
function throttles(func, wait){
  let timeout;
  return function() {
      if(!timeout) {
          timeout = setTimeout(()=>{
              func.apply(this, arguments);
              timeout = null;
          }, wait);
      }
  }
}
function setupssions(){
    setupssion=setInterval(function(){
    updatasession()
    },1000*60*30)

}
// watch(() =>router.currentRoute.value.path,(newValue,oldValue)=> {
//         console.log(newValue,oldValue)
//         if(newValue=="/login"){
//             websocket.close()
//             console.log("关闭")
//         }
// },{ immediate: true })
onBeforeUnmount(() => {
    // if(websocket.readyState==2||websocket.readyState==1) websocket.close()
   if(setupssion!==0) clearInterval(setupssion)
  });
onMounted(()=>{
    changeTimes()
    setupssions()
    // websocketurl("ws://" + window.location.host + "/area/websocket")
    window.addEventListener('onmessageWS',(e:any)=>{
        websocketmessage(e.detail.data)
        // var formov = {
        //     "message": "web_user::test"
        // }
        // sendSock(formov)
    })
    // websocketurl("ws://localhost:8100/area/websocket")
})
</script>
<style scoped lang='scss'>
.main-box {
    width: 100%;
    height: 100%;
    padding: 90px 1% 16px 1%;
    box-sizing: border-box;
    display: flex;
    justify-self: center;

    .main-item {
        height: 100%;
        background-color: rgba(20, 19, 19, 0.6);
    }
}

.time-box {
    position: absolute;
    top: 60px;
    left: 1%;
    display:flex;
    justify-content: center;
    align-items:center;
}

.item-list1 {
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.item-list2 {
    width: 49%;
    margin: 0 auto;
    background: url("@/assets/icons/index/mapicon.png") no-repeat;
  background-size: 100% 100%;
}

.item-list3 {
    width: 25%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
}

.item-box {
    box-sizing: border-box;
    padding: 10px 16px;

}

.show-box {
    display: inline-block;
    position: absolute;
    right: 0;
    top: -30px;
    z-index: 10;

    .el-checkbox {
        color: #fff;
    }
}

.item-boxl {
    height: 58%;
    background: url('@/assets/icons/index/baricon.png') no-repeat;
    background-size: 100% 100%;
}

.allBox {
    height: 100%;
    background: url('@/assets/icons/index/equlang.png') no-repeat;
    background-size: 100% 100%;
}

.item-boxs {
    height: 41%;
    background: url('@/assets/icons/index/pieicon.png') no-repeat;
    background-size: 100% 100%;

}

.list-title {
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #4cf9ff;
    position: relative;

    .text {
        font-size: 18px;
    }

    .infor-btn {
        font-size: 14px;
        cursor: pointer;
        position: absolute;
        right: 0;
    }
}

.list-centre {
    width: 100%;
    height: calc(100% - 30px);
}
:deep( .time-select){
      background-color: #fff;
    }
@media screen and (min-width: 320px) and (max-width: 1366px){
.text.entrytext{
    font-size: 18px;
    width: 80px;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
}
</style>
