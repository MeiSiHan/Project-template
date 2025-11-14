<template>
  <div class="content-box">
    hello world
  </div>


</template>
<script setup lang="ts">
import './index.scss'
import { ref,reactive,onMounted } from 'vue'
import { ipcMain, ipcRenderer } from 'electron'
import userStore from '@/store/user'
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile"; // 瓦片图层
import XYZ from "ol/source/XYZ"; // 瓦片图层源
import TileGrid from "ol/tilegrid/TileGrid";
import { TileImage } from 'ol/source';
// import ImageTile from 'ol/source/ImageTile.js';
import Feature from 'ol/Feature';
import { Icon, Style, Stroke, Fill, Circle } from "ol/style";
import { Point, LineString } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
// import { get as getProjection, transform,fromLonLat, Projection, toLonLat } from 'ol/proj';
import {
  Projection,
  fromLonLat,
  toLonLat,
  transform as Transform,
  get as getProjection,
  addProjection,
  addCoordinateTransforms,
  transformExtent
} from "ol/proj";
import { applyTransform, containsCoordinate } from "ol/extent";
import {
  wgs84togcj02,
  formattedData,
  ll2bmerc,
  bmerc2ll,
  smerc2bmerc,
  bmerc2smerc,
} from "@/utils/coordinate";
import {
  Control,
  defaults as defaultControls,
  Zoom,
  ScaleLine,
} from "ol/control";

import { bd09ToWgs84, wgs84ToBd09 } from '@/utils/coordTransform';
import { formatDate,getGradientColorByIntensity,getMultiSpectrumColorByIntensity} from '@/utils/index'
const store = userStore()
//地图对象
let map: Map | null |any = null;
let lineLayer: any = null;
let pointLayer: any = null;
let isViewInit = false;

const mapLayer:any=ref(null)
const satelliteLayer:any=ref(null)
const mapLayerpngs:any=ref(null)
let mapInfo={
// 百度地图
function baiduMap(val: any) {
  //百度地图
  const extent = [72.004, 0.8293, 137.8347, 55.8271];

  const baiduMercatorProj = new Projection({
    code: "baidu",
    extent: applyTransform(extent, ll2bmerc),
    units: "m",
  });

  addProjection(baiduMercatorProj);
  addCoordinateTransforms("EPSG:4326", baiduMercatorProj, ll2bmerc, bmerc2ll);
  addCoordinateTransforms(
    "EPSG:3857",
    baiduMercatorProj,
    smerc2bmerc,
    bmerc2smerc
  );

  var bmercResolutions = new Array(19);
  for (var i = 0; i < 19; ++i) {
    bmercResolutions[i] = Math.pow(2, 18 - i);
  }

  mapLayer.value = new XYZ({
    projection: "baidu",
    maxZoom: 18,
    wrapX: true, //允许左右无限移动
    tileUrlFunction: function (tileCoord) {
      var z = tileCoord[0];
      var x = tileCoord[1];
      var y = -tileCoord[2]-1;

      // 百度瓦片服务url将负数使用M前缀来标识
      if (x < 0) {
        x = -x;
      }
      if (y < 0) {
        y = -y;
      }
      if (val.offlineMap) {
        return `${val.mapSource}/baiduoff/${z}/${x}/${y}.png`;
      } else {
        return `http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20170809&scaler=1&p=1`;
      }
    },
    tileGrid: new TileGrid({
      resolutions: bmercResolutions,
      origin: [0, 0],
      extent: applyTransform(extent, ll2bmerc),
      tileSize: [256, 256],
    }),
    // tileLoadFunction,
  });

  satelliteLayer.value = new XYZ({
    projection: "baidu",
    maxZoom: 18,
    wrapX: true, //允许左右无限移动
    tileUrlFunction: function (tileCoord) {
      var z = tileCoord[0];
      var x = tileCoord[1];
      var y = tileCoord[2];

      // 百度瓦片服务url将负数使用M前缀来标识
      if (x < 0) {
        x = -x;
      }
      if (y < 0) {
        y = -y;
      }
      if (val.offlineMap) {
        return `${val.mapSource}/satellite/${z}/${x}/${y}.png`;
      } else {
        return `http://shangetu2.map.bdimg.com/it/u=x=${x};y=${y};z=${z};v=009;type=sate&fm=46&udt=20170606`;
      }
    },
    tileGrid: new TileGrid({
      resolutions: bmercResolutions,
      origin: [0, 0],
      extent: applyTransform(extent, ll2bmerc),
      tileSize: [256, 256],
    }),
  });
}
function baiduMaps(data:any) {
  //百度地图
  var projection = getProjection("EPSG:3857") as Projection;
  //分辨率
  let resolutions: number[] = [];
  for (let i = 0; i < 19; i += 1) {
    resolutions[i] = Math.pow(2, 18 - i);
  }
  const tilegrid = new TileGrid({
    origin: [0, 0],
    resolutions: resolutions,
  });

  //拼接百度地图出图地址
  mapLayer.value = new TileImage({
    //设置坐标参考系
    projection: projection,
    //设置分辨率
    tileGrid: tilegrid,
    //出图基地址
    tileUrlFunction: (tileCoord) => {
      if (!tileCoord) {
        return "";
      }
      const z = tileCoord[0];
      let x: string | number = tileCoord[1];
      let y: string | number = -tileCoord[2] - 1;
      //ol的y轴和百度的y轴相反，所以需要-1处理

      if (x < 0) {
        x = "M" + -x;
      }
      if (y < 0) {
        y = "M" + -y;
      }
      if (data.offlineMap) {
        return `${data.mapSource}/baiduoff/${z}/${x}/${y}.png`;
      } else {
        return `http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=${x}&y=${y}&z=${z}&styles=pl&udt=20170809&scaler=1&p=1`;
      }
      // return (
      //   "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" +
      //   x +
      //   "&y=" +
      //   y +
      //   "&z=" +
      //   z +
      //   "&styles=pl&udt=20151021&scaler=1&p=1"
      // );
    },
  });
  // // 创建百度地图瓦片源
  // const baiduMapLayer = new TileLayer({
  //   source: baidu_source
  // })
}
function initMap(data:any) {
  pointLayer = new VectorLayer({
    source: new VectorSource()
  });
  lineLayer = new VectorLayer({
    source: new VectorSource()
  });
  if (data.mapType === "gaode") {
    let roadMapUrl = "";
    let satelliteMapUrl = "";
    if (data.offlineMap) {
      roadMapUrl = `${data.mapSource}/roadmap/{z}/{x}/{y}.png`;
      satelliteMapUrl = `${data.mapSource}/satellite/{z}/{x}/{y}.png`;
    } else {
      roadMapUrl = `http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7`;
      satelliteMapUrl = `http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}`;
    }

    mapLayer.value = new XYZ({
      url: roadMapUrl,
      // tileLoadFunction,
    });

    satelliteLayer.value = new XYZ({
      url: satelliteMapUrl,
    });
  } else {
    console.log("创建百度")
    baiduMap(data);
  }
  


  mapLayerpngs.value = new TileLayer({
    visible: true,
    source: mapLayer.value,
  });
  console.log("mapLayerpngs",mapLayerpngs.value)
  map = new Map({
    target: mapRef.value as HTMLElement,
    layers: [
      // new TileLayer({
      //   source: baiduSource,
      // }),
      mapLayerpngs.value,
      pointLayer,
      lineLayer
    ],
    view: new View({
        center: Transform(
          data.mapType === "gaode"
            ? wgs84togcj02(103.407, 30.904)
            : [103.407, 30.904],
          "EPSG:4326",
          "EPSG:3857"
        ),
        zoom: 4,
        minZoom: 3,
        maxZoom: 19,
      })
    // view: new View({
    //   center: fromLonLat([116.407, 39.904]), // 设置中心点为北京
    //   zoom: 6, // 设置初始缩放级别
    //   minZoom: 3, // 设置最小缩放级别
    //   projection: 'EPSG:3857' // 设置投影坐标系
    // }),

  })

  // 添加比例尺控件
  const scaleLineControl = new ScaleLine({
    units: "metric", // 比例尺默认的单位 自定义的比例尺，当前仅支持单位 米
  });
  map.addControl(scaleLineControl);
  map.on('click', (evt:any) => {
    const coordinate = evt.coordinate;
    // 将EPSG:3857转回经纬度
    const lonLat = Transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    console.log('原始坐标:', lonLat);

    // 转换到BD-09
    const bdCoord = wgs84ToBd09(lonLat[0], lonLat[1]);
    console.log('BD-09坐标:', bdCoord);
  });

  map.on('moveend', function () {
    const view = map?.getView() as View;
    const center = view.getCenter();
    const zoom = view.getZoom();
    console.log('中心点:', center);
    console.log('缩放级别:', zoom);
  });
  // 地图拖动
  map.on('pointerdrag', function (evt:any) {
    const coordinate = evt.coordinate;
    // 将EPSG:3857转回经纬度
    const lonLat = Transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    //console.log('鼠标地图拖动坐标:', lonLat);
    // 转换到BD-09

  });
  //鼠标拖动
  map.on('pointermove', function (evt:any) {
    const coordinate = evt.coordinate;
    // 将EPSG:3857转回经纬度
    const lonLat = Transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    //console.log('鼠标移动坐标:', lonLat);
    // 转换到BD-09
  })
  map.on('loadstart', function () {

  });
  map.on('loadend', function () {

  });
  map.on('postrender', function (evt:any) {
    // 绘制完成后触发
  })
  map.on('postcompose', function (evt:any) {
    // 绘制完成后触发
  })
}
</script>



<style scoped>

</style>
