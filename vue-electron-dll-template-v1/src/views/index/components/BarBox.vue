<template>
 <div id="mainBarBox">
   <div id="mainBar" v-show="isData"></div>
   <div class="slectbBox">
     <el-radio-group v-model="radiobar" @change="changeType">
        <el-radio :label="1">非法可疑</el-radio>
        <el-radio :label="0">全部</el-radio>
      </el-radio-group>
   </div>
   <div v-show="!isData" class="dataText"><span>无数据</span></div>
   <div class="leftBar" @click="changCount(-1)" v-show="isCutL"></div>
   <div class="rightBar rightBars" @click="changCount(1)" v-show="isCutR"></div>
 </div>
</template>
<!-- <script>
import {ref,defineComponent} from 'vue'

export default defineComponent({
    name:"BarBox",
})
</script> -->
<script setup lang='ts'>
import {ref,reactive, onUpdated,onMounted,onBeforeUnmount, toRefs, nextTick } from 'vue'
import {cloneObjectFn} from "@/utils/auth"
import http from '@/api/http'
import userStore from "@/store/user"

import * as echarts from 'echarts/core';
import {
  ToolboxComponent,
  ToolboxComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
  BrushComponent,
  BrushComponentOption
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
const store = userStore()
let radiobar=ref(0)
const isData=ref(true)
const isCutL=ref(false) //是否显示切换
const isCutR=ref(false) //是否显示切换
let dataBar = reactive({
  datas:[],
  nowData:[],
  nowCount:1,
  nowPage:5
})
toRefs(dataBar)
echarts.use([
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BrushComponent,
  BarChart,
  CanvasRenderer
]);

type EChartsOption = echarts.ComposeOption<
  | ToolboxComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BrushComponentOption
  | BarSeriesOption
>;
interface echardata{
  name?:string
}
let myChart:echarts.ECharts

function initechart():void{

var option: EChartsOption;
var dataList:any=dataBar.nowData
let xAxisData: string[] = [];
let yData1:number[]=[] //非法
let yData2:number[]=[]//可疑
let yData3:number[]=[]//正常
let maxNum=maxNumber(radiobar.value)
for (let i = 0; i < dataList.length; i++) {
  xAxisData.push(dataList[i].groupName.slice(0,2))
  if(dataList[i].cheat_count<0){
    yData1.push(0)
  }else{
    yData1.push(dataList[i].cheat_count)
  }
  if(dataList[i].uncertain_count<0){
    yData2.push(0)
  }else{
    yData2.push(dataList[i].uncertain_count)
  }
  if(radiobar.value==0){
    if(dataList[i].normal_count<0){
      yData3.push(0)
    }else{
      yData3.push(dataList[i].normal_count)
    }
  }
}

let pieText:string[]=['非法','可疑']
let pieColor:string[]=["#f24916","#fdb628"]
let yData: any[] = [
  {
    name: '非法',
      type: 'bar',
      stack: 'total',
      barWidth:30,
      // barMinHeight:40,
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: yData1
  },{
      name: '可疑',
      type: 'bar',
      stack: 'total',
      barWidth:30,
      // barMinHeight:20,
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: yData2
    }
];
if(radiobar.value==0){
  let item={
      name: '正常和未识别',
      type: 'bar',
      stack: 'total',
      barWidth:30,
      // barMinHeight:20,
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: yData3
    }
    yData.unshift(item)
    pieText.unshift("正常和未识别")
    pieColor.unshift("#00a3ff")
  }
var emphasisStyle = {
  itemStyle: {
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.3)'
  }
};

option = {
  color: pieColor,
  legend: {
    data: pieText,
    left: 'left',
    orient: 'vertical',
    itemWidth:20,
    itemHeight:12,
    itemGap:6,
    textStyle:{
      color:'#fff'
    }
  },
  tooltip: {},
  xAxis: {
    name: '',
    type: 'category',
    data: xAxisData,
    axisLine: { onZero: true },
    splitLine: { show: false },
    splitArea: { show: false }
  },
  yAxis: [{
    minInterval: 2,
    // max: function(value) {
    //   return maxNum
    // }
  }],
  grid: {
    left: '30',
    right: '30',
    top:'66',
    bottom: '3%',
    containLabel: true
  },
  series: yData
}
option && myChart.setOption(option,true)
}
function maxNumber(types:number){
  let dataList=dataBar.datas
  let yData3=[]
  let yData1=[]
  let yData2=[]
  let maxnumbers=10
  for (let i = 0; i < dataList.length; i++) {
  yData1.push(dataList[i].cheat_count)
  yData2.push(dataList[i].uncertain_count)
  if(types==0){
    yData3.push(dataList[i].normal_count)
  }
}
if(types==0){
  let newAll=[...yData1,...yData2,...yData3]
maxnumbers=Math.max(...newAll)
}else{
  let newAll=[...yData1,...yData2]
maxnumbers=Math.max(...newAll)
}
if(maxnumbers<10){
  maxnumbers=10
}
  return maxnumbers
}
// function getData(){
//   var times: any = store.userTime
//     var nowtime = times.nowTimes
//     let timestr={
//         "startTime": nowtime[0],
//         "endTime": nowtime[1]
//       }
//    http.post('/terminal/allAreaToCount', timestr).then((res: any) => {
//     if (res.data.success) {
//       if(res.data.groupRows.length<=0){
//         isData.value=false
//       }else{
//         dataBar.datas=res.data.groupRows
//         countData(1)
//       }
//     }
//   }).catch(res => {
//   })
//   initechart()
// }
function setData(data:any){
  if (data.success) {
      if(data.groupRows.length<=0||data.groupRows==undefined){
        isData.value=false
        dataBar.datas=[]
      }else{
        isData.value=true
        dataBar.datas=data.groupRows
        let curPage=dataBar.nowCount
        countData(curPage)
      }
    }
    initechart()
}
function countData(num:number){
  let dataleng=dataBar.datas.length
  let pageNum=dataBar.nowPage;
  let maxNum=Math.floor(dataleng/pageNum)
  let maxCount=Math.ceil(dataleng/pageNum)
  if(num<=0){
    num=1
  }else if(num>=maxCount){
    num=maxCount
  }
  dataBar.nowCount=num
  let star=pageNum*(num-1)
  let end=pageNum*num
  if(end>=dataleng){
    end=dataleng
  }
  dataBar.nowData=dataBar.datas.slice(star,end)
  initechart()
  isCutL.value=true
  isCutR.value=true
  if(dataBar.datas.length<=dataBar.nowPage){
    isCutL.value=false
    isCutR.value=false
  }else if(num==1){
    isCutL.value=false
  }else if(num==maxCount){
    isCutR.value=false
  }
}
//切换类型
function changeType(){
initechart()
}
function changCount(num:number){
  let pageNum=dataBar.nowCount;
  let page=pageNum+num
  countData(page)
}
onMounted(() => {
  // getData()
  nextTick(() => {
    var chartDom = document.getElementById('mainBar')!;
    myChart = echarts.init(chartDom);
    window.addEventListener("resize", () => {
      if(myChart){
        myChart.resize();
      }
    });
  })
});
onUpdated(() => {
  
});
onBeforeUnmount(() => {
  if(myChart!==undefined){
    myChart.dispose(); //销毁
  }
});
defineExpose({setData})
</script>
<style scoped lang='scss'>
#mainBarBox{
    width: 100%;
    height: 100%;
    position: relative;
    #mainBar{
      width: 100%;
      height: 100%;
    }
    .slectbBox{
      position:absolute;
      top:0px;
      right:0;
      z-index: 10;
      .el-radio{
        margin-right: 20px;
      }
    }
    .leftBar{
      display:inline-block;
      width:26px;
      height:68px;
      position:absolute;
      top:40%;
      background: url("@/assets/icons/common/leftcut.png") no-repeat 100% 100%;
    }
    .leftBar:hover{
      background: url("@/assets/icons/common/leftcuts.png") no-repeat 100% 100%;
      cursor:pointer;
    }
    .rightBar{
      display:inline-block;
      width:26px;
      height:68px;
      position:absolute;
      top:40%;
      right:0px;
      background: url("@/assets/icons/common/rightcut.png") no-repeat 100% 100%;
    }
    .rightBar:hover{
      background: url("@/assets/icons/common/rightcuts.png") no-repeat 100% 100%;
      cursor:pointer;
    }
}
.dataText{
  width:100%;
  height: 100%;
  display:flex;
  justify-content:center;
  align-items: center;
  color: #909399;
}
</style>
