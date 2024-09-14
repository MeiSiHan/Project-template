<template>
  <div id="mapbox">
    <div id="map">
      <div id="mapmenu" class="clearflex">
        <div class="mantle"></div>
        <el-select v-model="maptype" class="maptype" placeholder="请选择" size="small" style="width: 80px;"
          @change="mapChange">
          <el-option v-for="item in mapoption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-checkbox v-model="showIcon" label="隐藏设备名称" size="large" @change="changText" style="float:left;margin-right:10px;" />
        <el-checkbox v-model="isCounts" v-show="isShowInfo" @change="changInfo" label="隐藏统计" size="large" style="float:left" />
        <div class="mapnum">设备总数:<span class="nums">{{allList}}</span>台&nbsp;
        <span v-show="maptype!==1">&nbsp;在线设备:<span class="nums">{{onlineList}}</span></span>
        <span v-show="maptype==1">&nbsp;离线设备:<span class="nums">{{offlineList}}</span></span>
        台</div>
        <a class="infor-btn" v-show="isShowInfo" @click="toDevice">详情>></a>
      </div>
      <div id="mapicon">
        <div class="mapico zoom-in" @click="zoommax('-1')"></div>
        <div class="mapico zoom-out" @click="zoommax('1')"></div>
        <div class="mapico best" @click="goodview()"></div>
      </div>
    </div>
    <ul id="contnums" v-show="!isCounts">
      <li class="numli1">
        <CountTo class="num num1" ref="countNum1" @click="loadCount(1)" :startVal='totalVal.num1.startVal'
          :endVal='totalVal.num1.sum' :duration='2000'></CountTo>
        <p class="text">非法信号数量</p>
      </li>
      <li class="numli2">
        <CountTo class="num num2" ref="countNum2" @click="loadCount(2)" :startVal='totalVal.num2.startVal'
          :endVal='totalVal.num2.sum' :duration='2000'></CountTo>
        <p class="text">可疑信号数量</p>
      </li>
      <li class="numli3">
        <CountTo class="num num3" ref="countNum3" @click="loadCount(3)" :startVal='totalVal.num3.startVal'
          :endVal='totalVal.num3.sum' :duration='2000'></CountTo>
        <p class="text">正常和未识别信号数量</p>
      </li>
    </ul>
    <div class="ol-popup" ref="popuptext">
      <a href="#" id="popup-closer" ref="closerPopup" class="ol-popup-closer"></a>
      <div id="popupContent" ref="popupContent" @click="toSiganls">
      </div>
    </div>
  </div>
  <FlyDialog v-directDrag ref="flyDialog" :imgUrl="flyUrl" :termId="flyTermId"></FlyDialog>
</template>

<script setup lang='ts'>
import {
  ref,
  reactive,
  onMounted
} from 'vue'
import http from '@/api/http'
import userStore from "@/store/user"
import { useRouter, useRoute } from 'vue-router'
import {
  toTime
} from '@/utils/auth'
import {
  CountTo
} from 'vue3-count-to';
import {
  transformfreq,
  cloneObjectFn,
  wgs84togcj02,
  toSearch
} from "@/utils/auth"
//map import
import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import {
  fromLonLat,
  toLonLat
} from 'ol/proj';
import {
  toStringHDMS
} from 'ol/coordinate';
import {
  addCoordinateTransforms,
  addProjection,
  transform,
} from 'ol/proj';
import {
  FullScreen,
  defaults as defaultControls
} from 'ol/control';
import {
  createStringXY
} from 'ol/coordinate';
import MousePosition from "ol/control/MousePosition";
// 图上图标相关
import OlFeature from 'ol/Feature'
import OlGeomPoint from 'ol/geom/Point'
import OlLayerVector from 'ol/layer/Vector'
import OlSourceVector from 'ol/source/Vector'
import OlSourceXYZ from 'ol/source/XYZ'
import geomCircle from 'ol/geom/Circle';
import OlStyleStyle from 'ol/style/Style'
import OlStyleIcon from 'ol/style/Icon'
// 用来添加相关文字描述的
import Text from 'ol/style/Text'
import {
  Style,
  Stroke,
  Fill,
  Circle
} from 'ol/style'

//baidu
import TileImage from "ol/source/TileImage";
import TileGrid from "ol/tilegrid/TileGrid";
import FlyDialog from "@/components/fly-dialog/index.vue"
const store = userStore()
const router = useRouter()
const emit = defineEmits(['changeMaps','changeMapssion'])
let map: any;
let iconLayer: any;
let flyLayer:any;
let addoverlay:any;
let maptype = ref(0)
let showIcon = ref(false)
let isCounts=ref(true)
let isShowInfo=ref(true)
isCounts.value=store.userState.showNums
let allList=ref(0)
let onlineList=ref(0)
let offlineList=ref(0)
let equipList: Array<any> = []
let popuptext = ref()
let closerPopup = ref()
let popupContent = ref()
const countNum1 = ref()
const countNum2 = ref()
const countNum3 = ref()
let onenmber = ref(1)
let flyList: Array<any> = [] //无人机
let flyTermList: Array<any> = [] //终端无人机
let flyTermImgList:Array<any> = [] //终端视频图
let flyUrl=ref('/')//视频图片
let flyTermId=ref('')//终端id
let flyDialog = ref(null)
let totalVal = reactive({
  num1: {
    sum: 0,
    startVal: 0
  },
  num2: {
    sum: 0,
    startVal: 0
  },
  num3: {
    sum: 0,
    startVal: 0
  }
})
const mapoption = [{
  value: 0,
  label: '全部',
}, {
  value: 2,
  label: '在线',
}, {
  value: 1,
  label: '离线',
}]
let clickMapData = {}
function changInfo(vla:boolean){
    let datas={
        "showNums":vla
    }
    userStore().setShowState(datas)
}
function initMap() {
  var mapurl=store.mapOnline ? "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}":'../exam/mapimg/gaodeoff/{z}/{x}/{y}.png'
  let gaodeMapLayer = new OlSourceXYZ({
    url: mapurl
  })
  let gaodeSatelliteLayer = new OlSourceXYZ({
    url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}"
  })
  iconLayer = new OlLayerVector({
    source: new OlSourceVector()
  })
  flyLayer = new OlLayerVector({
    source: new OlSourceVector()
  })
  let circleLayer = new OlLayerVector({
    source: new OlSourceVector()
  })
  let movecircleLayer = new OlLayerVector({
    source: new OlSourceVector()
  })
  let mapLayerpng = new TileLayer({
    source: gaodeMapLayer
  })
  map = new Map({
    target: "map",
    layers: [
      // new TileLayer({
      //   source: new OSM(),
      // }),
      mapLayerpng, iconLayer,flyLayer
    ],
    view: new View({
      center: transform([104.06, 30.65], 'EPSG:4326', 'EPSG:3857'),
      zoom: 4,
      minZoom:3,
    }),
    controls: defaultControls().extend([new FullScreen(),
    // new MousePosition({
    //   //坐标格式
    //   coordinateFormat: createStringXY(5),
    //   //地图投影坐标系（若未设置则输出为默认投影坐标系下的坐标）
    //   projection: "EPSG:4326",
    //   //坐标信息显示样式类名，默认是'ol-mouse-position'
    //   className: "custom-mouse-position",
    //   //显示鼠标位置信息的目标容器
    //   // target: document.getElementById("mouse-position"),
    //   //未定义坐标的标记
    //   undefinedHTML: "&nbsp;"
    // })
    ]),
  })
  addoverlay = new Overlay({
    element: popuptext.value,
    positioning: 'left-top',
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
  });
  closerPopup.value.onclick = function () {
    addoverlay.setPosition(undefined);
    closerPopup.value.blur();
    return false;
  };
  map.addOverlay(addoverlay)
  map.on("click", function (evt: any) {
    var pixel = map.getEventPixel(evt.originalEvent);
    let coordinate = map.getEventCoordinate(evt.originalEvent);
    let coord = transform(coordinate, "EPSG:3857", "EPSG:4326")
    var mapFeature = map.forEachFeatureAtPixel(pixel, function (feature: any, layer: any) {
      return feature
    });
    if (mapFeature) {
      let datas = mapFeature.values_.data
      clickMapData=datas
      let coortran=null;
      if(mapFeature.values_.type=="flyicos"){
        coortran = wgs84togcj02(datas.Longitude, datas.Latitude);
        popupContent.value.innerHTML = addtip(datas)
      }else{
        coortran = wgs84togcj02(datas.longitude / 10000000, datas.latitude / 10000000);
        popupContent.value.innerHTML = addtips(datas)
      }
      let coord = transform(coortran, "EPSG:4326", "EPSG:3857")
      
      addoverlay.setPosition(coord)
    }
  })
}




//加载数据
function setData(data: any,isShow=true) {
  equipList = data
  emit('changeMaps', equipList)
  onloadIcon()
  goodview()
  if(isShow==false){
    changInfo(true)
    isCounts.value=true
    isShowInfo.value=false
  }
  
  // if(isCounts.value){
  //   setCount()
  // }
}
//计算在线
function countNum(){
  let data=equipList
  let allCont=data.length
  let onLine=0
  allList.value=data.length
  for (let index = 0; index < data.length; index++) {
    if(data[index].terminalStatus==0){
      onLine++
    }
  }
  onlineList.value=onLine
  allList.value=allCont
  offlineList.value=allCont-onLine
}
//最近视野
function goodview() {
  let data = cloneObjectFn(equipList);
  if(maptype.value!==0){
    for(var j=0;j<data.length;j++){
       if (maptype.value == 2&&data[j].terminalStatus!==0) {//在线
          data.splice(j, 1);
          j--;
        }else if(maptype.value == 1&&data[j].terminalStatus!==1){
          data.splice(j, 1);
          j--;
        }
    }
  }
  for (var i = 0; i < data.length; i++) {
    if (data[i].latitude < 20000000 || data[i].latitude > 550000000 || data[i].longitude < 720000000 || data[i].longitude > 1360000000) {
        data.splice(i, 1);
        i--;
    }
  }
  let maxlat: number = NaN;
  let minlat: number = NaN;
  let maxlong: number = NaN;
  let minlong: number = NaN;
  if (data.length !== 0 && data !== "") {
    maxlat = data[0].latitude;
    minlat = data[0].latitude;
    maxlong = data[0].longitude;
    minlong = data[0].longitude;
  }
  if (data.length > 1) {
    for (var i = 0; i < data.length; i++) {
      if (maxlat < data[i].latitude) {
        maxlat = data[i].latitude
      }
      if (minlat > data[i].latitude) {
        minlat = data[i].latitude
      }
      if (maxlong < data[i].longitude) {
        maxlong = data[i].longitude
      }
      if (minlong > data[i].longitude) {
        minlong = data[i].longitude
      }
    }
    minlong = minlong / 10000000 - 0.6;
    minlat = minlat / 10000000 - 0.4;
    maxlong = maxlong / 10000000 + 0.6;
    maxlat = maxlat / 10000000 + 0.6;
    var coordata = [minlong, minlat, maxlong, maxlat]
    //经纬度转墨卡坐标
    var coorall = transform([coordata[0], coordata[1]], "EPSG:4326", "EPSG:3857")
    var coorall1 = transform([coordata[2], coordata[3]], "EPSG:4326", "EPSG:3857")
    map.getView().fit([coorall[0], coorall[1], coorall1[0], coorall1[1]], map.getSize());
  } else if (data.length == 1) {
    var long: any = maxlong / 10000000;
    var latin: any = maxlat / 10000000;
    var view = map.getView();
    view.setCenter(transform([long, latin], 'EPSG:4326', 'EPSG:3857'))
  }
}
//定位
function viewMap(long: number, lat: number) {
  var view = map.getView();
  var coortran = wgs84togcj02(long, lat);
  view.setCenter(transform(coortran, 'EPSG:4326', 'EPSG:3857'));
  view.setZoom(16)
}
//地图大小变化
function mapSize(){
  map.updateSize()
}
function onloadIcon() {
  let data = equipList;
  iconLayer.getSource().clear();
  countNum()
  if (data.length > 0) {
    for (let index = 0; index < data.length; index++) {
      var long = data[index].longitude / 10000000;
      var lat = data[index].latitude / 10000000;
      if (lat > 2 && lat < 55 && long > 72 && long < 136) {
        let maptypes = maptype;
        const addIcons = data[index];
        if (maptypes.value == 0) {
          addIcon(addIcons, index)
        } else if (maptypes.value == 2&&addIcons.terminalStatus==0) {//在线
          addIcon(addIcons, index)
        }else if(maptypes.value == 1&&addIcons.terminalStatus==1){
          addIcon(addIcons, index)
        }
      }
    }
  }
}

function addIcon(data: any, num: number) {
  //roles 1 教师
  // _that.addText(data, num)
  // let iconum = "" + data.team_tag + modetype + data.device_type;
  var urlnum = 0;
  var zindex = 0;
  var backcolor = ''
  var icotext = ''
  if (showIcon.value == false) {
    icotext = data.terminalName
  }
  if (data.terminalStatus == 0) {
    if (data.cheat_count > 0) {
      urlnum = 3;
      zindex = 30;
      backcolor = "#E70700";
    } else if (data.uncertain_count > 0) {
      urlnum = 5;
      zindex = 20;
      backcolor = "#FFA200"
    } else {
      urlnum = 1;
      zindex = 16;
      backcolor = "#00AADA"
    }
  } else {
    if (data.cheat_count > 0) {
      urlnum = 2;
      zindex = 12;
      backcolor = "#F0605C"
    } else if (data.uncertain_count > 0) {
      urlnum = 4;
      zindex = 6;
      backcolor = "#FFCC73"
    } else {
      urlnum = 0;
      zindex = 1;
      backcolor = "#2e3352";
    }
  }
  let imgSrc = getImageUrl(urlnum)
  let long = data.longitude / 10000000;
  let lat = data.latitude / 10000000;
  var coortran = wgs84togcj02(long, lat);
  let coord = transform(coortran, 'EPSG:4326', 'EPSG:3857')
  let startMarker = new OlFeature({
    type: 'icon0',
    data: data,
    id: num,
    geometry: new OlGeomPoint(coord)
  })
  // 设置样式，在样式中就可以设置图标
  startMarker.setStyle(
    new OlStyleStyle({
      image: new OlStyleIcon({
        imgSize: [24, 24],
        src: imgSrc,
        anchor: [0.5, 24],
        anchorOrigin: 'top-right',
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        offsetOrigin: 'top-right',
        offset: [0, 0]
      }),
      text: new Text({
        textAlign: 'center', //位置
        textBaseline: 'top', //基准线
        font: 'normal 14px', //文字样式
        text: icotext, //文本内容
        fill: new Fill({ //文本填充样式（即文字颜色)
          color: backcolor
        }),
        stroke: new Stroke({
          color: 'rgba(0,0,0,0)',
          width: 0
        })
      }),
      zIndex: zindex
    }));
  // 添加到之前的创建的layer中去
  iconLayer.getSource().addFeature(startMarker);
}
//无人机信息
function flyInfo(data:any){
  let redata=data
  if (redata.message == "notify::fly_terminal") {
      addTermList(redata)
      onloadFlyTer()
      flyDialog.value.webInfo(redata)
  }else if (redata.message == "notify::fly_heart") {
      // addflyfit(redata)
      // var ids=$("#usvid").attr("data")
      // if (ids !=="") {
      //     setusv(ids)
      // }
      flyDialog.value.webInfo(redata)
  } else if (redata.message == "notify::uav_info") {
      addflyList(redata)
  } else if (redata.message == "notify::fly_break") {
      outfly(redata)
  } else if (redata.message == "notify::dev_img") {
      addTermimg(redata)
  } else if (redata.message == "notify::track_dev_param") {
      // deviceinfo(redata)
      flyDialog.value.webInfo(redata)
  }
  addflyList({})
  addTermimg("")
}
function addTermList(data:any){
  let terid=data.StationCode;
  if (flyTermList.length<1) {
            data.Stationfly=false;
            data.Stationline=true;
            flyTermList.push(data)
  }else{
      var ishave=0;
      for (var i = 0; i < flyTermList.length; i++) {
          if (flyTermList[i].StationCode==terid) {
            var flys=flyTermList[i].Stationfly;
            flyTermList[i]=data;
            flyTermList[i].Stationline=true;
            flyTermList[i].Stationfly=flys;
              ishave=1;
              break;
          } 
      }
      if (ishave==0) {
          data.Stationfly=false;
          data.Stationline=true;
          flyTermList.push(data)
      }
  }
}
function addflyList(datas:any){
  let data={
    "message": "notify::uav_info",
    "StationCode": "0C3D2F57-6A77-45C9-BB22-D99B08F133D5", 
    "DataType": 0, 
    "FreqOrNo": 2446, 
    "TargetName": "Phantom 3/4", 
    "DeviceId": 1, 
    "DeviceLng": 112.882405, 
    "DeviceLat": 28.210195, 
    "Longitude": 112.87529638818411, 
    "Latitude": 28.20964676295609, 
    "Altitude": 0, 
    "Speed": 0, 
    "Direction": 265, 
    "Distance": 700, 
    "Pitch": 0, 
    "Height": 0, 
    "Timestamp": 1571827025
}

        var timestamp=new Date().getTime();
        if (flyList.length<1) {
          flyList.push(data)
        }else{
            var ishave=0;
            for (var i = 0; i < flyList.length; i++) {
                var oldtime=flyList[i].Timestamp;
                var timebit=timestamp-oldtime*1000;
                if (timebit>9000) {
                  flyList.splice(i, 1);
                    i--;
                }else{
                   if (flyList[i].StationCode==data.StationCode&&flyList[i].FreqOrNo==data.FreqOrNo&&flyList[i].TargetName==data.TargetName) {
                        flyList[i]=data;
                        ishave=1;
                        break;
                    }
                }
            }
            if (ishave==0) {
              flyList.push(data)
            }
        }
        onloadFly()
        if (flyTermId.value==data.StationCode) {
            // addflytable(terid)
        }
}

//加载终端设备
function onloadFlyTer(){
    delectdyn(null)
    if(flyTermList.length>0){
      for (let index = 0; index < flyTermList.length; index++) {
        let element:any = flyTermList[index];
        let terid=element.StationCode
        if(element.DeviceList.length>0){
          let flylist:any=element.DeviceList
          let longitude=0;
          let latitude=0;
          let ishave=false;
          let isflylose=false
          for(let j = 0; j < flylist.length; j++){
              let items:any=flylist[j]
              let itemslong=items.DeviceLng
              let itemslat=items.DeviceLat
              if (itemslat > 2 && itemslat < 55 && itemslong > 72 && itemslong < 136) {
                longitude=itemslong
                latitude=itemslat
                ishave=true;
                break;
              }
            }
            for (var k = 0; k < flylist.length; k++) {
                if (flylist[k].DeviceStatus==false) {
                    isflylose=true;
                    break;
                }
            }
          if(ishave){
              var coortran = wgs84togcj02(longitude,latitude);
              let coord = transform(coortran, 'EPSG:4326', 'EPSG:3857')
              // 设置样式，在样式中就可以设置图标
              let urlnum=1//在线
              if(!element.Stationline){
                urlnum=4
              }
              if (element.Stationline==false) {
                urlnum=3
              }else if (isflylose) {
                urlnum=2
              }else if (element.Stationfly) {
                urlnum=1
              }else{
                urlnum=0
              }
              let imgSrc = getImageUrls(urlnum)
              var ele=document.createElement("div")
              ele.className="dynicon";
              ele.id="dyn"+terid;
              ele.style.backgroundImage="url("+imgSrc+")";
              ele.setAttribute("data", terid);
              ele.addEventListener("click",function(e){
                flybox(element,coord)
              })
              // ele.setAttribute("onclick", "flybox('"+terid+"')")
              document.body.appendChild(ele);
              var point_overlay = new Overlay({
                  element: ele,
                  positioning: 'center-center'
              });
              ele.style.display="black";
              map.addOverlay(point_overlay);
              point_overlay.setPosition(coord);
          }
      }
    }
  }
}
function onloadFly(){
  if(flyList.length>0){
    flyLayer.getSource().clear();
        for (var i = 0; i < flyList.length; i++) {
            var data=flyList[i];
            var coortran = wgs84togcj02(data.Longitude, data.Latitude)
            let coord = transform(coortran, 'EPSG:4326', 'EPSG:3857')
            let startMarker = new OlFeature({
              type: 'flyicos',
              data: data,
              id: i,
              geometry: new OlGeomPoint(coord)
            })
            let imgSrc = new URL(`../../../assets/icons/map/fly.png`,import.meta.url).href
            startMarker.setStyle(
                new OlStyleStyle({
                  image: new OlStyleIcon({
                    imgSize: [40, 40],
                    src: imgSrc,
                    anchor: [0.5, 30],
                    anchorOrigin: 'top-right',
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    offsetOrigin: 'top-right',
                    offset: [0, 0]
                  })
                }));
            flyLayer.getSource().addFeature(startMarker);
        }
  }
}
// 终端离线
function outfly(data){
      if (flyTermList.length>0) {
        for (var i = 0; i < flyTermList.length; i++) {
          if (flyTermList[i].StationCode==data.StationCode) {
            delectdyn(data.StationCode)
            flyTermList.splice(i, 1);
            break;
          }
        }
      }
    }
function delectdyn(id){
        var iddom:any=document.getElementsByClassName("dynicon")
        if (iddom !==null &&iddom.length>0) {
            if (id==null||id==undefined) {
                for (var i = 0; i < iddom.length; i++) {
                    iddom[i].parentNode.remove();
                }
            }else{
              let eldom:any=document.getElementById("dyn"+id)
              eldom.parentNode.remove();
              addoverlay.setPosition(null)
            } 
        }
    }
function addTermimg(datas:any){
  let data={
    "message": "notify::dev_img", 
    "StationCode": "0C3D2F57-6A77-45C9-BB22-D99B08F133D5",
    "imgBase64":'/9j/4AAQSkZJRgABAQIAJQAlAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAuAEwDAREAAhEBAxEB/8QAGgABAAIDAQAAAAAAAAAAAAAAAgEDAAQFCP/EACMQAAIBAwUBAAMBAAAAAAAAAAABAhESMQMhQVFhE1KBkbH/xAAZAQEBAQEBAQAAAAAAAAAAAAACAQAEAwf/xAAbEQEBAQEBAQEBAAAAAAAAAAAAARESAiFBUf/aAAwDAQACEQMRAD8A8SKCaVT7Bmvld9EoLCPSQL6NQRbB6wrFXY08p0Vux6SN0SiqF5gX0mxGyJ0lQVTZBvo7V2bn+DqVB/iOZ+o1fnRHNJjqt0lDbc9J50SjFVLfOQdJJdGkC36Sgmek86luLFpqheQ6T80+DctqY6W+DcpaXz3LJjdH868l4lHtp2enPy66xQYpBKMXXA7PgadvhfMC01FrKQp5rW6SW2ELmjbCjCvhuaPRKCrk3NG+jWmuWWeRvolpV5Lg60VE5pNrt6ZbQeYl9EoqpcDTUExSBfWHHTdMHpPgX0drSwLU6JR/ZN1L6WLTeS5odEtPv/BzxqWmorphsyo51PDnkdluJUVyhYmlGKFYFqyEd+iyBpxToKBVijVYK2wow7QsG1ZYKQLdJQXLHjJt9LjOdCFVwcOY6fXukoU6HI09Eo0fAsS3TS3FAWqKSwbkaawWTBpRVWPBtWKOwsDvCjHsrd6Vq8/hm6r/2Q=='
  }
        var terid=data.StationCode;
        var usvid=flyTermId.value
        if (flyTermImgList.length<1) {
          flyTermImgList.push(data)
        }else{
            var ishave=0;
            for (var i = 0; i < flyTermImgList.length; i++) {
                if (flyTermImgList[i].StationCode==terid) {
                    flyTermImgList[i]=data;
                    ishave=1;
                    break;
                } 
            }
        }
        if (terid==usvid) {
          flyUrl.value='data:image/jpg;base64,'+data.imgBase64;
        }
}
function getTermimg(ids:String){
  flyUrl.value=""
  for (var i = 0; i < flyTermImgList.length; i++) {
      if (flyTermImgList[i].StationCode==ids) {
          flyUrl.value='data:image/jpg;base64,'+flyTermImgList[i].imgBase64;
          break;
      }
  }
}
function flybox(data:any,coords:any){
  flyDialog.value.showDialog(data)
  flyTermId.value=data.StationCode
  getTermimg(data.StationCode)
  var datas=data.DeviceList;
  var ulli=''
  if (datas.length>0) {
            for (var i = 0; i < datas.length; i++) {
                var str='';
                var isonline="在线";
                var strtype=datas[i].DeviceKind;
                if (strtype==1) {
                    str="探测设备"
                } else if (strtype==2) {
                    str="光电跟踪设备"
                    if (datas[i].DeviceStatus) {
                        // $("#usvhandle").show()
                    }
                } else if (strtype==3) {
                    str="红外设备"
                } else if (strtype==4) {
                    str="干扰设备"
                } else if (strtype==6) {
                    str="诱骗设备"
                } else if (strtype==7) {
                    str="智能控制箱";
                    if (datas[i].DeviceStatus) {
                        var nums=datas[i].SensorStatus
                        // flyone(nums)
                    }
                }
                if (datas[i].DeviceStatus) {
                    isonline="在线"
                    ulli+='<li><span class="popupcon">&nbsp;&nbsp;'+str+'</span><span>'+isonline+'</span></li>'
                } else{
                    isonline="离线"
                    ulli+='<li style="color:#a7a7a7;"><span class="popupcon">&nbsp;&nbsp;'+str+'</span><span>'+isonline+'</span></li>'
                }
                
            }
        }else{
            ulli='<li>无设备</li>'
        }
      popupContent.value.innerHTML = '<ul class="popuptips" class="clearfix">'+ulli+'</ul>';
      addoverlay.setPosition(coords)
}
function addtip(data: any) {
  let datastr = data
  var textcont = '<ul class="popuptips" class="clearfix"><li><span class="popuplab">设备:</span><span class="popupcon">' +
    datastr.TargetName + '</span></li>\
            <li><span class="popuplab">时间:</span><span class="popupcon">' + toTime(datastr.Timestamp*1000) + '</span></li>\
            <li><span class="popuplab">经度:</span><span class="popupcon">' + datastr.Longitude+ '</span></li>\
            <li><span class="popuplab">纬度:</span><span class="popupcon">' + datastr.Latitude+ '</span></li>\
            </ul>';
  return textcont
}
function addtips(data: any) {
  let datastr = data
  var textcont = '<ul class="popuptips" class="clearfix"><li><span class="popuplab">设备:</span><span class="popupcon">' +
    datastr.terminalName + '</span><button>查看</button></li>\
            <li><span class="popuplab">GUID:&nbsp; </span><span class="popupcon" style="font-size:16px; margin-left:5px">' + datastr.terminal_ID.slice(4, 20) + '</span></li>\
            <li><span class="popuplab">时间:</span><span class="popupcon">' + toTime(datastr.loginTime) + '</span></li>\
            <li><span class="popuplab">经度:</span><span class="popupcon">' + datastr.longitude / 10000000 + '</span></li>\
            <li><span class="popuplab">纬度:</span><span class="popupcon">' + datastr.latitude / 10000000 + '</span></li>\
            <li><span class="popuplab">信号:</span><span>' + datastr.count +
    '</span><span style="margin-left:10px">可疑:' + datastr.uncertain_count +
    '</span><span style="margin-left:10px">非法:' + datastr.cheat_count + '</span></li></ul>';
  return textcont
}
function toSiganl(data: any) {
  let userTime: any = store.userTime
  let times = userTime.nowTimes
  let info = {
    "startTime": times[0],
    "endTime": times[1],
    "terminal_Name": data.terminalName
  }
  var seach = toSearch(info)
  userStore().setSearch(seach)
  router.push({ path: '/signal', query: { search: 's' } })
}
function toSiganls(e) {
  if (e.target.localName.toLowerCase() === 'button') {
    toSiganl(clickMapData)
  }
}
function changText() {
  onloadIcon()
}
function zoommax(num: string): void {
  const view = map.getView();
  const zoom = view.getZoom();
  const zooms = zoom + parseInt(num);
  view.setZoom(zooms);
}

function loadCount(order: number): void {
  onenmber.value++
  if (order == 1) {
    countNum1.value.start()
  } else if (order == 2) {
    countNum2.value.start()
  } else {
    countNum3.value.start()
  }
}

function setCount(data:any) {
  // var times: any = store.userTime
  // var nowtime = times.nowTimes
  // let timestr = {
  //   "startTime": nowtime[0],
  //   "endTime": nowtime[1]
  // }
  // var requst = {
  //   "signalFilter": JSON.stringify(timestr)
  // }
  // http.post('/signal/count', requst).then((res: any) => {
  //   if (res.data.success) {
  //     totalVal.num1.startVal = 0
  //     totalVal.num2.startVal = 0
  //     totalVal.num3.startVal = 0
  //     totalVal.num1.sum = res.data.cheat_count
  //     totalVal.num2.sum = res.data.uncertain_count
  //     totalVal.num3.sum = res.data.normal_count
  //     countNum1.value.start()
  //     countNum2.value.start()
  //     countNum3.value.start()
  //   }
  // }).catch(res => { })
      totalVal.num1.startVal = 0
      totalVal.num2.startVal = 0
      totalVal.num3.startVal = 0
      totalVal.num1.sum = data.cheat_count
      totalVal.num2.sum = data.uncertain_count
      totalVal.num3.sum = data.normal_count
      if(totalVal.num1.sum<0){
        totalVal.num1.sum=0
      }
      if(totalVal.num2.sum<0){
        totalVal.num2.sum=0
      }
      if(totalVal.num3.sum<0){
        totalVal.num3.sum=0
      }
      countNum1.value.start()
      countNum2.value.start()
      countNum3.value.start()
}
//修改统计
function setCounts(data:any,isShow=true){
  isCounts.value=isShow
  totalVal.num1.sum += data.cheat_count
  totalVal.num2.sum += data.uncertain_count
  totalVal.num3.sum += data.normal_count
  countNum1.value.start()
  countNum2.value.start()
  countNum3.value.start()
}
//websoket修改设备数量统计
function changeCount(data:any){
  for (var i = 0; i < data.length; i++) {
                if (equipList.length > 0) {
                    var ishave = true;
                    for (var j = 0; j < equipList.length; j++) {
                        if (data[i].terminal_ID == equipList[j].terminal_ID) {
                            equipList[j].count += data[i].count;
                            equipList[j].audio_count += data[i].audio_count;
                            equipList[j].digital_count += data[i].digital_count;
                            equipList[j].cheat_count += data[i].cheat_count;
                            equipList[j].uncertain_count += data[i].uncertain_count;
                            equipList[j].normal_count = equipList[j].count - equipList[j].cheat_count - equipList[j].uncertain_count;
                            ishave = false;
                            //统计
                            totalVal.num1.startVal = totalVal.num1.sum
                            totalVal.num2.startVal = totalVal.num2.sum
                            totalVal.num3.startVal = totalVal.num3.sum
                            totalVal.num1.sum += data[i].cheat_count
                            totalVal.num2.sum += data[i].uncertain_count
                            totalVal.num3.sum += data[i].normal_count
                            break;
                        }
                    }
                    if (ishave) {
                      equipList.unshift(data[i])
                      emit('changeMapssion', '')
                    }
                }
            }
            emit('changeMaps', equipList)
            onloadIcon();
            if(totalVal.num1.startVal<0){
              totalVal.num1.startVal=0
            }
            if(totalVal.num2.startVal<0){
              totalVal.num2.startVal=0
            }
            if(totalVal.num3.startVal<0){
              totalVal.num3.startVal=0
            }
            if(totalVal.num1.sum<0){
              totalVal.num1.sum=0
            }
            if(totalVal.num2.sum<0){
              totalVal.num2.sum=0
            }
            if(totalVal.num3.sum<0){
              totalVal.num3.sum=0
            }
            countNum1.value.start()
            countNum2.value.start()
            countNum3.value.start()
}
function toDevice(){
  router.push({ path: '/devicefilter',query: {type: "true" }})
}
onMounted(() => {
  initMap()
})

function getImageUrl(name: number) {
  return new URL(`../../../assets/icons/map/devico${name}.png`,
    import.meta.url).href
}
function getImageUrls(name: number) {
  return new URL(`../../../assets/icons/map/fly${name}.gif`,
    import.meta.url).href
}
function mapChange(v: string): void {
  onloadIcon()
}
defineExpose({
  setData,
  viewMap,
  setCount,
  changeCount,
  mapSize,
  flyInfo
})
</script>
<style scoped lang='scss'>
//去掉地图默认
:deep(.ol-control) {
  display: none;
}

#mapbox,
#map {
  width: 100%;
  height: 100%;
}

#mapbox {
  box-sizing: border-box;
  padding: 4px;
  position: relative;
}

#contnums {
  position: absolute;
  top: 50px;
  left: 50px;
  width: calc(100% - 50px);
  display: flex;
  justify-content: center;

  li:last-child {
    margin-right: 0;
  }

  li {
    color: #fff;
    border-radius: 6px;
    width: 30%;
    text-align: center;
    opacity: 0.8;
    height: 90px;
    margin-right: 3%;

    .num {
      height: 60px;
      line-height: 60px;
      font-size: 48px;
      cursor: pointer;
    }
  }

  .numli1 {
    background-color: #f24916;

  }

  .numli2 {
    background-color: #fdb628;

  }

  .numli3 {
    background-color: #00a3ff;

  }
}

#mapicon {
  position: absolute;
  left: 10px;
  top: 50px;
  z-index: 1;

  .mapico {
    width: 40px;
    height: 40px;
    margin-bottom: 2px;
    cursor: pointer;
    // box-shadow: 5px 3px 4px #afa8a8;
    border:1px solid #409eff;
  }

  .zoom-in {
    background: url("@/assets/icons/common/zoomin.png") no-repeat;
    background-size: 100% 100%;
  }

  .zoom-in:hover {
    background: url("@/assets/icons/common/zoomins.png") no-repeat;
  }

  .zoom-out {
    background: url("@/assets/icons/common/zoomout.png") no-repeat;
    background-size: 100% 100%;
  }

  .zoom-out:hover {
    background: url("@/assets/icons/common/zoomouts.png") no-repeat;
  }

  .best {
    background: url("@/assets/icons/common/best.png") no-repeat;
    background-size: 100% 100%;
  }

  .best:hover {
    background: url("@/assets/icons/common/bests.png") no-repeat;
  }
}

#mapmenu {
  position: absolute;
  height: 40px;
  line-height: 40px;
  width: calc(100% - 8px);
  z-index: 1;
  color: #474747;
  overflow: hidden;
  .mantle {
    height: 100%;
    width: 100%;
    background-color: #bfbfbf;
    opacity: 0.5;
    position: absolute;
    z-index: -1;
  }
.mapnum{
  
  display: inline-block;
  height: 40px;
  line-height: 34px;
  font-size: 16px;
  margin-left: 10px;
  float: left;
  .nums{
    color: #00a3ff;
    font-size: 22px;
  }
}
  .infor-btn {
    color: #00a3ff;
    float: right;
    cursor: pointer;
    display: inline-block;
    height: 40px;
    line-height: 40px;
    margin-right: 12px;
  }

  .maptype {
    margin: 8px 14px 0 4px;
    vertical-align: middle;
    float: left;

  }
}

/*ol*/
.ol-popup {
  position: absolute;
  background-color: #0761d2;
  color: #fff;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
  padding: 20px 10px 4px 10px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  width: 260px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: #0761d2;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url("@/assets/icons/common/close.png") center no-repeat;
  background-size: 100% 100%;
}

:deep(.popuptips) {
  width: 100%;
  padding: 0;
  margin: 0;
}

:deep(.popuptips) li {
  width: 100%;
  height: 26px;
  line-height: 26px;
  font-size: 16px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
}

:deep(.popuptips) li button {
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border-radius: 4px;
  border: 0;
  cursor: pointer;
  outline: none;
  padding: 0 6px;
  color: #333;
  background-color: #dfdfdf;
}

:deep(.popuptips) li button:hover {
  background-color: #057fdc;
  color: #fff;
}

:deep(.popuptips) li span {
  float: left;
}

:deep(.popuptips) li .popuplab {
  display: inline-block;
  width: 40px;
}

:deep(.popuptips) li .popupcon {
  display: inline-block;
  width: 175px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
:deep(.dynicon){
	width: 50px;
	height:50px;
	background-size: 100% 100%;
	cursor: pointer;
}
</style>