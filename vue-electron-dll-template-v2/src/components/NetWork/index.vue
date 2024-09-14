<template>
  <el-dialog v-model="centerDialogVisible" title="网络设置" :close-on-click-modal="false" :before-close="beforeDialog"
    width="700" align-center>
    <div class="dialog-main">
      <div class="item-box">
        <div class="item-header">
          <div class="head-left">
            <span class="label-text">TCP连接状态:</span>
            <span class="label-cont">未连接</span>
          </div>
          <div class="head-title">
            信号源网络配置
          </div>
        </div>
        <div class="item-cont">
          <el-form
            label-width="60px"
            :model="formSignla"
            inline="true"
          >
            <el-form-item label="IP">
              <el-input v-model="formSignla.ip" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input v-model="formSignla.port" />
            </el-form-item>
          </el-form>
        </div>
        <div class="item-btn">
          <el-button type="primary">连接</el-button>
        </div>
      </div>
      <div class="item-box">
        <div class="item-header">
          <div class="head-left">
            <span class="label-text">TCP连接状态:</span>
            <span class="label-cont">未连接</span>
          </div>
          <div class="head-title">
            设备网络配置
          </div>
        </div>
        <div class="item-cont">
          <el-form
            label-width="60px"
            :model="formSignla"
            inline="true"
          >
            <el-form-item label="IP">
              <el-input v-model="formSignla.ip" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input v-model="formSignla.port" />
            </el-form-item>
          </el-form>
        </div>
        <div class="item-btn">
          <el-button type="primary">连接</el-button>
        </div>
      </div>
      <div class="item-box">
        <div class="item-header">
          <div class="head-left">
            <span class="label-text">UDP连接状态:</span>
            <span class="label-cont">未连接</span>
          </div>
          <div class="head-title">
            本地网络配置
          </div>
        </div>
        <div class="item-cont">
          <el-form
            label-width="60px"
            :model="formSignla"
            inline="true"
          >
            <el-form-item label="IP">
              <el-input v-model="formSignla.ip" />
            </el-form-item>
            <el-form-item label="端口">
              <el-input v-model="formSignla.port" />
            </el-form-item>
          </el-form>
        </div>
        <div class="item-btn">
          <el-button type="primary">连接</el-button>
        </div>
      </div>

    </div>
    <template #footer>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref ,reactive} from 'vue'
// import { app , shell,dialog} from 'electron'
import { ipcRenderer, electron } from 'electron'
import { BrowserWindow } from '@electron/remote'
import { dialog, app, shell } from '@electron/remote'
import { ElMessage } from 'element-plus'
import {readFiles} from '@/utils/baseurl'
//引入node原生fs模块
const fs = require("fs")
//引入node原生读写配置
const ini = require('ini');
const centerDialogVisible = ref(false)
const filename = ref("")//文件路径
let filecont=''


//form
const formSignla = reactive({
  ip: '192.168.28',
  port: '5555',
})

function beforeDialog(done) {
  console.log("关闭弹窗")
  done()
}


// 读取配置文件
function readFile(){
    if(!filename.value){
        ElMessage({
          message: '请选择文件',
          type: 'warning',
        })
        return
    }
    filecont = ini.parse(fs.readFileSync(filename.value).toString());
    console.log(filecont,'config')
}
// 写入配置文件
function writeFile(){
    if(filecont==""){
        this.errMsg("请先读取文件")
        return
    }
    filecont = "你想要修改的值"
    fs.writeFileSync(filename.value, ini.stringify(filecont))
}


function showDialog() {
  centerDialogVisible.value = true
}
function closeDialog() {
  centerDialogVisible.value = false
}
defineExpose({ showDialog, closeDialog })
</script>
<style scoped lang="scss">
.item-box{
  box-sizing: border-box;
  width:100%;
  padding:10px 30px;
  border:1px solid #ddd;
  border-radius: 6px;
  margin-bottom:10px;
}
.item-header{
  height:50px;
  display:flex;
  justify-content: space-between;
  align-items: center;
  font-size:16px;
  .head-left{
    color:#3a3a3a;
  }
}
.item-btn{
  text-align: right;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}</style>