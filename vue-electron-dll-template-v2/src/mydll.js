
// import path from 'path'
// import * as ffi from 'ffi-napi'

// //默认加载 32位 DLL
// // let dllFilePath = path.resolve('resources/MYDLLDEMO_x32')
// // if (arch === 'x64') {
// //   dllFilePath = path.resolve('resources/MYDLLDEMO_x64')
// // }


// const Dll = ffi.Library(path.resolve('dll/MyDLL.dll'), {
//     Add: ['float', ['float', 'float']],
//     Hello: ['string', []],
//     StrLength: ['int', ['string']]
//   })
// //   console.log('fii.Library Add result:', Dll.Add(1, 2))
// //   console.log('fii.Library Add result:', Dll.Add(6, 2))

//   export function add(a,b){
//     return Dll.Add(a,b)
//   }



var ffi = require('ffi-napi')
const path = require('path')
const Dll = ffi.Library(path.resolve('dll/MyDLL.dll'), {
  Add: ['float', ['float', 'float']],
  Hello: ['string', []],
  StrLength: ['int', ['string']]
})
module.exports = {
  addnumber() {
    return Dll.Add();
  }
}
