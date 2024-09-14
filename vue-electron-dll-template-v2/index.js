const ffi = require('ffi-napi')
const path = require('path')
const Dll = ffi.Library(path.resolve('dll/MyDLL.dll'), {
  Add: ['float', ['float', 'float']],
  Hello: ['string', []],
  StrLength: ['int', ['string']]
})
function callCppDll () {
    console.log('fii.Library Hello result:', Dll.Hello())
    console.log('fii.Library Add result:', Dll.Add(1, 2))
    console.log('fii.Library Add result:', Dll.StrLength('hello world'))
  }
  callCppDll()