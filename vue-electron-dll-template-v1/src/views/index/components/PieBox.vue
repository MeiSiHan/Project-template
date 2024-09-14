<template>
  <div id="mainPieBox">
    <div class="list-title">
      <span class="text">{{pieInfo.pieTitles}}</span>
      <a class="infor-btn" @click="toSiganl()">详情>></a>
    </div>
    <div id="mainpie" v-show="pieInfo.pieShow"></div>
    <div class="leftBar" @click="cutBtnType(0)" v-show="isCutL"></div>
    <div class="rightBar" @click="cutBtnType(1)" v-show="isCutR"></div>
    <div id="mainCut">
      <div class="cutBtn cutBtnL" :class="{active:isCutActive}" @click="cutBtn(0)">信号性质</div>
      <div class="cutBtn cutBtnR" :class="isCutActive ? '':'active'" @click="cutBtn(1)">信号类型</div>
    </div>
  </div>

</template>
<!-- <script>
import {ref,defineComponent} from 'vue'

export default defineComponent({
    name:"BarBox",
})
</script> -->
<script setup lang='ts'>
  import {
    ref,
    reactive,
    watch,
    onUpdated,
    onMounted,
    onBeforeUnmount,
    nextTick
  } from 'vue'
  import {
    cloneObjectFn
  } from "@/utils/auth"
  // const data = reactive({

  // })
  import * as echarts from 'echarts/core';
  import {
    TooltipComponent,
    TooltipComponentOption,
    LegendComponent,
    LegendComponentOption
  } from 'echarts/components';
  import {
    PieChart,
    PieSeriesOption
  } from 'echarts/charts';
  import {
    LabelLayout
  } from 'echarts/features';
  import {
    CanvasRenderer
  } from 'echarts/renderers';
  import {
    toSearch
  } from '@/utils/auth'
  import {
    useRouter
  } from 'vue-router'
  import userStore from "@/store/user"
  const store = userStore()
  const router = useRouter()
  const isCutActive = ref(true)
  let isCutL=ref(false)
  let isCutR=ref(false)
  // let props = defineProps(['deviceList'])
  interface pieType {
    nowCount: number,
      nowType: boolean,
      pieTitles: string,
      pieShow: boolean,
      deviceList:any[]
  }
  let pieInfo: pieType = reactive({
    nowCount: 0,
    nowType: true, //信号性质
    pieTitles: "",
    pieShow: true,
    deviceList:[]
  })
  let options="数传"
  if(store.userInfo.userType=="1"){
    options="短信"
  }
//   watch(props, (props, prevCount) => {
//     /* 深层级变更状态所触发的回调 */
//     console.log(props)
    
// //     let onloadmap=new Promise((resolve) => {
// // // resolve()
// // 	})
// //   onloadmap.then(() => {
// // 		//	此dom为echarts图标展示dom
// // 		initechart(pieInfo.nowCount)
// // 	})
//   initechart(pieInfo.nowCount)
//   })

  echarts.use([
    TooltipComponent,
    LegendComponent,
    PieChart,
    CanvasRenderer,
    LabelLayout
  ]);

  type EChartsOption = echarts.ComposeOption <
    TooltipComponentOption | LegendComponentOption | PieSeriesOption >
  ;

  let option: EChartsOption
  var chartDom: HTMLElement = document.getElementById('mainpie') !;
  let myChart: echarts.ECharts
  function setData(data:any){
    pieInfo.deviceList=data
    initechart(pieInfo.nowCount)
  }
  function initechart(nums: number) {
    let datas = pieInfo.deviceList
    let arrLength = datas.length-1
    let num = nums
    pieInfo.pieShow = true
    if (datas.length == 0) {
      pieInfo.pieTitles = "无"
      pieInfo.pieShow = false
      // myChart.showLoading({
      //     text: '暂无数据',
      //     showSpinner: false,    // 隐藏加载中的转圈动图
      //     textColor: '#fff',
      //     maskColor: 'rgba(255, 255, 255, 0.1)',
      //     fontSize: '14px',
      //     fontWeight: 'bold',
      //     fontFamily: 'Microsoft YaHei'
      // })
      return false
    }
    if (num < 0) {
      num = 0
    } else if (num > arrLength) {
      num = arrLength
    }
    isCutL.value=true
    isCutR.value=true
    if(arrLength<1){
      isCutL.value=false
      isCutR.value=false
    }else if(num==0){
      isCutL.value=false
    }else if(num==arrLength){
      isCutR.value=false
    }
    let data = cloneObjectFn(datas[num])
    pieInfo.nowCount = num
    pieInfo.pieTitles = data.terminalName
    let colorBar: string[]
    let dataBars: any[]
    if (pieInfo.nowType) {
      colorBar = ["#00a3ff", "#f24916", "#fdb628"]
      dataBars = [{
          value: data.normal_count,
          name: '正常和未识别'
        },
        {
          value: data.cheat_count,
          name: '非法'
        },
        {
          value: data.uncertain_count,
          name: '可疑'
        }
      ]
    } else {
      colorBar = ["#00a3ff", "#f24916"]
      dataBars = [{
          value: data.digital_count,
          name: options
        },
        {
          value: data.audio_count,
          name: '语音'
        }
      ]
    }

    option = {
      color: colorBar,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        top: '5%',
        left: 'left',
        bottom: '10%',
        orient: 'vertical',
        itemWidth: 20,
        itemHeight: 12,
        itemGap: 6,
        textStyle: {
          color: '#fff'
        }
      },
      series: [{
        name: data.terminalName,
        type: 'pie',
        radius: ['30%', '50%'],
        bottom: 30,
        avoidLabelOverlap: false,
        // minAngle:20,
        startAngle:90,
        label: {
          show: true, //展示label
          formatter: '{b}:{c} ({d}%)', //指示线外显示百分比数
          position: 'outer',
          fontStyle: "normal",
          color: '#fff',
          // formatter(v:any) {
          //    let text = v.name+'\n'+Math.round(v.percent)+'%'
          //    return text
          // }
        },
        itemStyle: {

        },

        labelLine: {
          show: true,
          length: 20, //第一段长度
          length2: 6 //第二段长度 设置0不显示第二段
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '12',
          }
        },
        data: dataBars
      }]
    };
    option && myChart.setOption(option);
  }
  //跳转
  function toSiganl() {
    if(pieInfo.deviceList.length<=0) return false
    let data = cloneObjectFn(pieInfo.deviceList[pieInfo.nowCount])
    let userTime: any = store.userTime
    let times = userTime.nowTimes
    let info = {
      "startTime": times[0],
      "endTime": times[1],
      "terminal_Name": data.terminalName,
      // "terminal_ID":[data.terminal_ID]
    }
    var seach = toSearch(info)
    userStore().setSearch(seach)
    router.push({
      path: '/signal',
      query: {
        search: 's'
      }
    })
  }
  // 切换
  function cutBtnType(num: number): void {
    let nowCode = pieInfo.nowCount
    let nowNum: number = nowCode
    if (num == 0) {
      nowNum--
    } else {
      nowNum++
    }
    initechart(nowNum);
  }

  function cutBtn(num: number): void {
    let nowCode = pieInfo.nowCount
    if (num == 0) {
      isCutActive.value = true
      pieInfo.nowType = true
    } else {
      isCutActive.value = false
      pieInfo.nowType = false
    }
    initechart(nowCode);
  }
  onMounted(() => {
    chartDom = document.getElementById('mainpie')!;
    myChart = echarts.init(chartDom);
    nextTick(()=>{
      initechart(0);
      window.addEventListener("resize", () => {
        myChart.resize();
      });
    })
  });
  onBeforeUnmount(() => {
    myChart.dispose(); //销毁
  });
  defineExpose({setData,initechart})
</script>
<style scoped lang='scss'>
  #mainPieBox {
    width: 100%;
    height: 100%;
  }

  #mainpie {
    width: 100%;
    height: calc(100% - 30px);
  }

  #mainPieBox {
    position: relative;
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

  #mainCut {
    position: absolute;
    width: 200px;
    height: 30px;
    bottom: 4px;
    left: 50%;
    margin-left: -100px;

    .cutBtn {
      width: 100px;
      height: 30px;
      line-height: 30px;
      display: inline-block;
      text-align: center;
      background-color: #ffffff;

      color: #009cf4;
      cursor: pointer;
    }

    .cutBtnL {
      border-top-left-radius: 15px;
      border-bottom-left-radius: 15px;
    }

    .cutBtnR {
      border-top-right-radius: 15px;
      border-bottom-right-radius: 15px;
    }

    .active {
      background-color: #00a3ff;
      color: #fff;
    }
  }

  .leftBar {
    display: inline-block;
    width: 26px;
    height: 68px;
    position: absolute;
    top: 50%;
    margin-top: -34px;
    z-index: 10;
    background: url("@/assets/icons/common/leftcut.png") no-repeat 100% 100%;
  }

  .leftBar:hover {
    background: url("@/assets/icons/common/leftcuts.png") no-repeat 100% 100%;
    cursor: pointer;
  }

  .rightBar {
    display: inline-block;
    width: 26px;
    height: 68px;
    position: absolute;
    top: 50%;
    right: 0px;
    z-index: 10;
    margin-top: -34px;
    background: url("@/assets/icons/common/rightcut.png") no-repeat 100% 100%;
  }

  .rightBar:hover {
    background: url("@/assets/icons/common/rightcuts.png") no-repeat 100% 100%;
    cursor: pointer;
  }
</style>