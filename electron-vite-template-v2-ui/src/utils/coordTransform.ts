//坐标转换工具

// 坐标转换工具类
const PI = 3.1415926535897932384626;
const X_PI = PI * 3000.0 / 180.0;
const A = 6378245.0;
const EE = 0.00669342162296594323;

/**
 * 判断坐标是否在中国境外
 */
function outOfChina(lng:number, lat:number) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

/**
 * 纬度转换
 */
function transformLat(x:number, y:number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

/**
 * 经度转换
 */
function transformLng(x:number, y:number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

/**
 * WGS84转GCJ02（火星坐标系）
 */
export function wgs84ToGcj02(lng:number, lat:number) {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }
    
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    
    const radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    
    dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);
    
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    
    return [mgLng, mgLat];
}

/**
 * GCJ02转BD09（百度坐标系）
 */
export function gcj02ToBd09(lng:number, lat:number) {
    const x = lng;
    const y = lat;
    const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    const bdLng = z * Math.cos(theta) + 0.0065;
    const bdLat = z * Math.sin(theta) + 0.006;
    return [bdLng, bdLat];
}

/**
 * WGS84转BD09（完整转换）
 */
export function wgs84ToBd09(lng:number, lat:number) {
    const gcj02 = wgs84ToGcj02(lng, lat);
    return gcj02ToBd09(gcj02[0], gcj02[1]);
}

/**
 * BD09转GCJ02
 */
export function bd09ToGcj02(lng:number, lat:number) {
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
    const gcjLng = z * Math.cos(theta);
    const gcjLat = z * Math.sin(theta);
    return [gcjLng, gcjLat];
}

/**
 * GCJ02转WGS84
 */
export function gcj02ToWgs84(lng:number, lat:number) {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }
    
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    
    const radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    
    dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);
    
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    
    return [lng * 2 - mgLng, lat * 2 - mgLat];
}

/**
 * BD09转WGS84
 */
export function bd09ToWgs84(lng:number, lat:number) {
    const gcj02 = bd09ToGcj02(lng, lat);
    return gcj02ToWgs84(gcj02[0], gcj02[1]);
}
