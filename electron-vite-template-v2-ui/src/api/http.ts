import axios from "./requset";

export default  class Http {
  /**
   * get方法
   * @param {string} url 路径
   * @param {object} params 参数
   */
  static get = (url: string, params?: any) => {
    return new Promise((resolve, reject) => {
      axios.get(url, { params: params},).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  }

  static post = (url: string, params?: any) => {
    return new Promise((resolve, reject) => {
      axios.post(url, params).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  }
  static dowfile = (url: string, params?: any) => {
    return new Promise((resolve, reject) => {
      axios.get(url, {params,responseType: "blob"}).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  }
  static download=(url:string,params?:any ) =>{
    return axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob'
    }).then((data:any) => {
      const content = data
      let filename =""
      if(data.headers['content-disposition']!=undefined && data.headers['content-disposition']!=null){
        filename = data.headers['content-disposition'].split(';')[1].split('filename=')[1]
      }
      const blob = new Blob([content.data],{type: 'application/zip'})
      // if ('download' in document.createElement('a')) {
      //   const elink = document.createElement('a')
      //   elink.download = filename
      //   elink.style.display = 'none'
      //   const URL = window.URL || window.webkitURL
      //   elink.href = URL.createObjectURL(blob)
      //   // elink.href = window.URL.createObjectURL(blob);
      //   document.body.appendChild(elink)
      //   elink.click()
      //   URL.revokeObjectURL(elink.href)
      //   document.body.removeChild(elink)
      // } else {
      //   // window.navigator.msSaveBlob(blob, filename)
      // }
    }).catch((r) => {
      console.error(r)
    })
  }
}
