<template>
  <el-dialog v-model="dialogVisible" title="信号源指令配置" :close-on-click-modal="false" :before-close="beforeDialog"
    width="80%" align-center>
    <div class="dialog-main">
      <div class="btn-box">
        <el-button type="primary" @click="openAdd">添加</el-button>
      </div>
      <div class="table-box">
        <el-table
        :data="tableData"
        ref="multipleTableRef"
        style="width: 100%"
        max-height="500"
        highlight-current-row
        @current-change="handleCurrentChange"
        border
        >
          <!-- <el-table-column type="selection" width="55" /> -->
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="信号源名称" width="180" />
          <el-table-column prop="ip" label="ip" width="180" />
          <el-table-column prop="port" label="端口" />
          <el-table-column prop="set_freq" label="设置频率" width="180" />
          <el-table-column prop="set_level" label="设置强度" width="180" />
          <el-table-column prop="set_bitrate" label="设置码速率" />
          <el-table-column prop="set_filter" label="设置滤波器" />
          <el-table-column prop="set_bitrate" label="设置码速率" />
          <el-table-column prop="set_modulate_rate" label="设置调制速率" />
          <el-table-column prop="set_freq_offset" label="设置频偏" />
          <el-table-column prop="set_modulate_depth" label="设置调制深度" />
          <el-table-column prop="get_freq" label="获取频率" />
          <el-table-column prop="get_level" label="获取强度" />
          <el-table-column prop="get_bitrate" label="获取码速率" />
          <el-table-column prop="get_filter" label="获取滤波器" />
          <el-table-column prop="get_modulate_rate" label="获取调制速率" />
          <el-table-column prop="get_freq_offset" label="获取频偏" />
          <el-table-column prop="get_modulate_depth" label="获取调制深度" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default>
              <el-button link type="primary" size="small" @click="handleClick"
                >删除</el-button
              >
              <el-button link type="primary" size="small">修改</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="readFile">读取文件</el-button>
        <el-button @click="writeFile">写入文件</el-button>
      </span>
    </template>
  </el-dialog>
  <AddDirect ref="adddirect"></AddDirect>
</template>
<script setup>
import AddDirect from '../AddDirect'
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
const dialogVisible = ref(false)
const adddirect=ref(null)//编辑弹窗
const multipleTableRef=ref(null)
const multipleSelection = ref([])
const filename = ref("")//文件路径
let filecont=''
// const {dialog}=electron.remote
//   const props = defineProps([''])



const tableData = [
]
let tables={
    "name":"信号源1",
    "id":"16919837810029",
    "ip":"192.168.24",
    "port":"5555",
    "set_freq":"",
    "set_level":"",
    "set_bitrate":"",
    "set_filter":"",
    "set_modulate_rate":"",
    "set_freq_offset":"",
    "set_modulate_depth":"",
    "get_greq":"",
    "get_level":"",
    "get_bitrate":"",
    "get_filter":"",
    "get_modulate_rate":"",
    "get_freq_offset":"",
    "get_modulate_depth":"",
}
tableData.push(tables)




const handleCurrentChange  = (val) => {
  multipleSelection.value = val
}
const handleClick = () => {
  console.log('click')
}


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

function openAdd(){
  adddirect.value.showDialog()
}
function showDialog() {
  dialogVisible.value = true
}
function closeDialog() {
  dialogVisible.value = false
}
defineExpose({ showDialog, closeDialog })
</script>
<style scoped lang="scss">
.btn-box{
  text-align:right;
  padding-bottom:10px;
}




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
}

.el-dialog__body{
  padding-top: 10px;
}
</style>