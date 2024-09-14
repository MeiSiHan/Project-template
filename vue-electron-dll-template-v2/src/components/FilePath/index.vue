<template>
  <el-dialog v-model="centerDialogVisible" title="存储目录配置" :close-on-click-modal="false" :before-close="beforeDialog"
    width="600" align-center>
    <div class="dialog-main">
      <div class="file-box">
        <span class="label-text">存储目录:</span>
        <el-input v-model="filename" autocomplete="off" width="400" placeholder="请选择你的文件" readonly
          @click="selectDirectory" />
      </div>


    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="selectDirectory">选择目录</el-button>
        <el-button type="primary" @click="openDirectory">打开目录 </el-button>
        <el-button @click="readFile">读取文件</el-button>
        <el-button @click="writeFile">写入文件</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
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
// const {dialog}=electron.remote
//   const props = defineProps([''])
function beforeDialog(done) {
  console.log("关闭弹窗")
  done()
}
//选择目录
function selectDirectory() {
  // shell.openPath(`${app.getAppPath()}\\`)
  dialog.showOpenDialog({
    properties: ["openFile"] // 选择文件
    // properties: ["openDirectory"] // 选择目录
  }).then((results) => {
    console.log(results, results.filePaths);
    if (results.filePaths.length > 0) {
      filename.value = results.filePaths[0]
    }

    // console.log(results.canceled);

  })
}
//打开目录
function openDirectory() {
  let files = filename.value
  // shell.openPath(`${app.getAppPath()}\\`)
  shell.openPath(files)
  readFiles()
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
.file-box {
  display: flex;
  height: 60px;
  align-items: center;

  .label-text {
    width: 100px;
    display: inline-block;
  }
}

.dialog-footer button:first-child {
  margin-right: 10px;
}</style>