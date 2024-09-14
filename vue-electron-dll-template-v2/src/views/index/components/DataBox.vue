<template>
    <div class="cont-box">
        <div class="left-cont-box">
            <div class="header-btn-box">
                <div class="btn-item cursor" @click="openTask">添加任务</div>
                <div class="btn-item cursor">执行任务</div>
                <div class="btn-item cursor" @click="onloadTaskList">加载子任务</div>
                <div class="btn-item cursor" @click="addTaskList">写入子任务</div>
            </div>
            <div class="list-box container">
                <div class="list-item-box active" v-for="(item,index) in pageData.taskList" :key="item.id">
                    <ul class="text-cont-box">
                        <li class="text-box">
                            <span class="label-text">任务名称：</span>
                            <span class="cont-text">{{item.name}}</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集频率：</span>
                            <span class="cont-text">120.0000MHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集显宽：</span>
                            <span class="cont-text">56kHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">设备编号：</span>
                            <span class="cont-text">SCS20230816</span>
                        </li>
                    </ul>
                    <div class="list-btn-box">
                        <div class="progress-box">
                            <el-progress
                            :text-inside="true"
                            :stroke-width="24"
                            :percentage="60"
                            status="success"
                            />
                        </div>
                        <div class="btn-box">
                            <div class="btn-item">执行</div>
                            <div class="btn-item" @clic="changeTaskList(item)">修改</div>
                            <div class="btn-item">删除</div>
                        </div>
                    </div>
                </div>





                <div class="list-item-box active">
                    <ul class="text-cont-box">
                        <li class="text-box">
                            <span class="label-text">任务名称：</span>
                            <span class="cont-text">SCS20230816</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集频率：</span>
                            <span class="cont-text">120.0000MHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集显宽：</span>
                            <span class="cont-text">56kHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">设备编号：</span>
                            <span class="cont-text">SCS20230816</span>
                        </li>
                    </ul>
                    <div class="list-btn-box">
                        <div class="progress-box">
                            <el-progress
                            :text-inside="true"
                            :stroke-width="24"
                            :percentage="60"
                            status="success"
                            />
                        </div>
                        <div class="btn-box">
                            <div class="btn-item">执行</div>
                            <div class="btn-item">修改</div>
                            <div class="btn-item">删除</div>
                        </div>
                    </div>
                </div>
                <div class="list-item-box">
                    <ul class="text-cont-box">
                        <li class="text-box">
                            <span class="label-text">任务名称：</span>
                            <span class="cont-text">SCS20230816</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集频率：</span>
                            <span class="cont-text">120.0000MHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">采集显宽：</span>
                            <span class="cont-text">56kHz</span>
                        </li>
                        <li class="text-box">
                            <span class="label-text">设备编号：</span>
                            <span class="cont-text">SCS20230816</span>
                        </li>
                    </ul>
                    <div class="list-btn-box">
                        <div class="progress-box">
                            <el-progress
                            :text-inside="true"
                            :stroke-width="24"
                            :percentage="60"
                            status="success"
                            />
                        </div>
                        <div class="btn-box">
                            <div class="btn-item">执行</div>
                            <div class="btn-item">修改</div>
                            <div class="btn-item">删除</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-cont-box">
            <div class="info-box">
                <p class="info-name">信号源参数</p>
                <ul class="text-cont-box">
                    <li class="text-box">
                        <span class="label-text">信号源类型：</span>
                        <span class="cont-text">信号源01</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">频率：</span>
                        <span class="cont-text">120.0000MHz</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">强度： </span>
                        <span class="cont-text">46dBμV </span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">调制方式：</span>
                        <span class="cont-text">FM </span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">调制速率： </span>
                        <span class="cont-text">52.34 </span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">调制深度：</span>
                        <span class="cont-text">12.34</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">滤波器：</span>
                        <span class="cont-text">MSK</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">码速率：</span>
                        <span class="cont-text">52.34 </span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">频偏：</span>
                        <span class="cont-text">563.215MHz</span>
                    </li>
                </ul>
            </div>
            <div class="info-box">
                <p class="info-name">设备参数</p>
                <ul class="text-cont-box">
                    <li class="text-box">
                        <span class="label-text">设备类型：</span>
                        <span class="cont-text">DZH300</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">设备编号：</span>
                        <span class="cont-text">SCS0230816</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">中心频率：</span>
                        <span class="cont-text">120.0000MHz</span>
                    </li>
                    
                    <li class="text-box">
                        <span class="label-text">采样率：</span>
                        <span class="cont-text">56.23</span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">天线型号：</span>
                        <span class="cont-text">52.34 </span>
                    </li>
                    <li class="text-box">
                        <span class="label-text">版本：</span>
                        <span class="cont-text">v0.0.92</span>
                    </li>
                </ul>
            </div>
            <!-- 频谱 -->
            <div class="freq-box">
                频谱
            </div>
        </div>
        <AddTask ref="taskdialog" types="1"></AddTask>
    </div>
</template>
<script setup>
import { ref,reactive,onMounted } from 'vue'
import {isFileExisted,createFolderPath,deleteFile,writeJsonFile,readJsonFile} from '@/utils/filefun'
import AddTask from '@/components/AddTask'
const taskdialog=ref(null)//任务弹窗
const pageData=reactive({
    taskData:[],
    taskList:[]
})
onMounted(()=>{
    console.log("页面加载完成")
    // isfile()
    onloadTask()
    onloadTaskList()
})
//加载任务
function onloadTask(){
    readJsonFile("./localfile/task/task.json")
    .then((jsonData) => {
        let datas=jsonData
        pageData.taskData=datas.data
    }).catch((err) => {
        console.error('无法读取JSON文件:', err);
        initTask()
    });
}
//加载子任务
function onloadTaskList(){
    readJsonFile("./localfile/task/subtask.json")
    .then((jsonData) => {
        let datas=jsonData
        pageData.taskList=datas.data
        console.log("子任务读取",datas)
    }).catch((err) => {
        console.error('无法读取JSON文件:', err);
        initTaskList()
    });
}
//初始化json文件
function initTask(){
    var datas={
        "data":[]
    }
    writeJsonFile("./localfile/task/task.json",datas).then(() => {
        console.log('JSON文件写入成功！');
        onloadTask()
    })
    .catch((err) => {
        console.error('无法写入JSON文件:', err);
    });
}
function initTaskList(){
    var datas={
        "data":[]
    }
    writeTaskList(datas)
}
function writeTaskList(datas){
    writeJsonFile("./localfile/task/subtask.json",datas).then(() => {
        console.log('JSON文件写入成功！');
        onloadTaskList()
    })
    .catch((err) => {
        console.error('无法写入JSON文件:', err);
    });
}
function addTaskList(){
    let taskdata={
        "name":"任务一",
        "id":"16919837810012",
        "frequency":1000,
        "gatherWay":0,
        "use_Signal":true,
        "task_time":"2023-01-01 21:03:01",
        "status":0,
        "signal_info":{
            "signal_type":"信号1",
            "signal_level":10,
            "modulate_type":"MSK",
            "bitrate":10,
            "filter":"默认"
        },
        "device_info":{
            "gather_span":100,
            "is_series":true,
            "gather_time":100,
            "gather_points":1000,
            "number_times":1
        },
        "add_info":{
            "device_iype":"DZH300",
            "device_number":"0135012",
            "software_version":"v1.0.0",
            "antenna_type":"",
            "notes":"测试"
        }
    }
    readJsonFile("./localfile/task/subtask.json")
    .then((jsonData) => {
        let datas=jsonData
        datas.data.push(taskdata)
        writeTaskList(datas)
    }).catch((err) => {
        console.error('无法读取JSON文件:', err);
        initTask()
    });
}



async function isfile(){
    isFileExisted("./localfile/task/config/con.json").then((res)=>{
        console.log("是否有文件",res)
    }).catch((err)=>{

    })
    createFolderPath("./localfile/task/config/con.json\\")
    deleteFile("./localfile/task/config/con.json\\").then((res)=>{
        console.log("删除文件成功",res)
    }).catch((err)=>{
        console.log("删除文件报错",err)
    })
    var datas={
        "dddd":1,
        "name":"task"
    }
    writeJsonFile("./localfile/task/list.json",datas).then(() => {
    console.log('JSON文件写入成功！');
  })
  .catch((err) => {
    console.error('无法写入JSON文件:', err);
  });
  readJsonFile("./localfile/task/list.json")
  .then((jsonData) => {
    console.log(jsonData);
  })
  .catch((err) => {
    console.error('无法读取JSON文件:', err);
  });
}


function changeTaskList(item){
    taskdialog.value.showDialog(1,item)
}




//打开任务弹窗
function openTask(){
    taskdialog.value.showDialog(0)
}
</script>
<style lang="scss">
@import './DataBox.scss';
.cont-box{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
}
.left-cont-box{
    height: 100%;
    width: 460px;
    background-color: #fff;
    border-radius: 6px;
}
.right-cont-box{
    height: 100%;
    width: 69%;
    margin-left: 1%;
    border-radius: 6px;
    flex:1;
    display: flex;
    flex-direction: column;
}

.container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.container::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom right, #6e6e6e 0%, #676666 100%);
  border-radius: 5px;
}

.container::-webkit-scrollbar-track {
  background-color: #ddd;
  border: 1px solid #ccc;
}

// .container::-webkit-scrollbar-button {
//   background-color: #6e6e6e;
//   border-radius: 5px;
// }

.container::-webkit-scrollbar-button:hover {
  background-color: #999999;
}

</style>