// http.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import qs from 'qs'
import { ElMessage } from "element-plus"
import { useRouter} from 'vue-router'
// 导入pinia
//import pinia from '@/store/index'
import userStore from "@/store/user"

const showStatus = (status: number) => {
  let message = ''
  switch (status) {
    case 400:
      message = '请求错误(400)'
      break
    case 401:
      message = '未授权，请重新登录(401)'
      break
    case 403:
      message = '拒绝访问(403)'
      break
    case 404:
      message = '请求出错(404)'
      break
    case 408:
      message = '请求超时(408)'
      break
    case 500:
      message = '服务器错误(500)'
      break
    case 501:
      message = '服务未实现(501)'
      break
    case 502:
      message = '网络错误(502)'
      break
    case 503:
      message = '服务不可用(503)'
      break
    case 504:
      message = '网络超时(504)'
      break
    case 505:
      message = 'HTTP版本不受支持(505)'
      break
    default:
      message = `连接出错(${status})!`
  }
  return `${message}，请检查网络或联系管理员！`
}
const baseRequest:any=import.meta.env.VITE_APP_URL//
//const store = userStore()
let store:any=""
let baseUrls = '/'
const service = axios.create({
  // 联调
  //baseURL: process.env.NODE_ENV === 'production' ? `/` : '/api',
  // baseURL: "/api",
  baseURL: baseUrls,
 // baseURL: "http://localhost:3000/",
  // headers: {
  //   get: {
  //     'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  //   },
  //   post: {
  //     'Content-Type': 'application/json;charset=utf-8'
  //   }
  // },
  // 是否跨站点访问控制请求
  withCredentials: true,  // 允许携带凭证（cookies，headers等）
  // timeout: 60000,
  transformRequest: [(data) => {
    //return data
    //console.log("进行字符",data)
    if (typeof data === 'object') {
      return  JSON.stringify(data)
    }
    // let params = qs.stringify(data, {indices: false})
    // return params
    
  }],
  // validateStatus() {
  //   // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
  //   return true
  // },
  // transformResponse: [(data) => {
  //   if (typeof data === 'string' && data.startsWith('{')) {
  //     data = JSON.parse(data)
  //   }
  //   return data
  // }]
  
})

// 请求拦截器
service.interceptors.request.use((config: any) => {
  // config.headers['Authorization'] = getToken()
  //console.log("axios请求参数",config)
  // 每次请求前都检查 baseURL
  if(store==""){
    store = userStore();
  }
  if (store.configData?.control_url!== config.baseURL&&store.configData?.control_url) {
    baseUrls = store.configData?.control_url;
    config.baseURL = baseUrls;
  }
  //获取token，并将其添加至请求头中
  // let token = localStorage.getItem('token')
  // if(token){
  //   config.headers.Authorization = `${token}`;
  // }
  // 如果请求方法是 POST 且数据是对象或数组，我们将 Content-Type 设置为 application/json
  if (config.method === 'post') {
    // 如果请求的数据是对象或数组（也可以添加更多类型的判断条件）
    if (config.data && (typeof config.data === 'object' || Array.isArray(config.data))) {
      config.headers['Content-Type'] = 'application/json';  // 设置为 application/json
    }
  }else if (config.method === 'get') {// 也可以处理其他方法和请求头的动态设置
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';  // GET 请求使用 URL 编码格式
  }
  // if (config.method === 'post' && config.data !== undefined) {
  //   config.headers = {
  //     'Content-Type':'application/x-www-form-urlencoded;charset=utf-8' //配置请求头
  //   }
  // }
  return config
}, (error) => {
  // 错误抛到业务代码
  error.data = {}
  error.data.msg = '服务器异常，请联系管理员！'
  return Promise.resolve(error)
})

// 响应拦截器
service.interceptors.response.use((response: any) => {
  //console.log("axios响应参数",response)
  // const status = response.status
  // let msg = ''
  // if (status < 200 || status >= 300) {
  //   // 处理http错误，抛到业务代码
  //   msg = showStatus(status)
  //   if (typeof response.data === 'string') {
  //     response.data = { msg }
  //   } else {
  //     response.data.msg = msg
  //   }
  // }
  if (typeof response.data === 'string') {
    if(response.data.indexOf(baseRequest+'/login') !=-1){
      ElMessage({
        showClose: true,
        message: '登录时间失效,请重新登录',
        type: 'error',
      })
      store.setIsLogin(false)
      // const router=useRouter()
      // router.push({ path: '/' })
      // window.location.reload();
  }
  }else{
    return response
  }
  
    
}, (error) => {
  if (axios.isCancel(error)) {
    // console.log('repeated request: ' + error.message)
  } else {
    // handle error code
    // 错误抛到业务代码
    error.data = {}
    error.data.msg = '请求超时或服务器异常，请检查网络或联系管理员！'
    // ElMessage.error(error.data.msg)
  }
  return Promise.reject(error)
})
// 设置一个方法来更新 baseURL
export const setBaseURL = (newBaseURL:any) => {
  service.defaults.baseURL = newBaseURL; // 更新 axios 实例的 baseURL
};
//console.log("创建完获取store",store)
// 设置动态的 baseURL
//service.defaults.baseURL = store.configData?.||'http://localhost:3000';
export default service
