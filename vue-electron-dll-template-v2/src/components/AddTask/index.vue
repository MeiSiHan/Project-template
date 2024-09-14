<template>
  <el-dialog v-model="dialogVisible" title="任务编辑" :close-on-click-modal="false" :before-close="beforeDialog"
    width="80%" align-center>
    <div class="dialog-main">
      <div class="header-main">
        <el-form
          ref="taskFormRef"
          :model="taskForm"
          :rules="rules"
          :inline="true"
          label-width="100px"
          class="demo-ruleForm"
          :size="formSize"
          label-position="left"
          status-icon
        >
          <el-form-item label="任务名称" prop="name">
            <el-input v-model="taskForm.name" />
          </el-form-item>
          <el-form-item label="采集频率" prop="frequency">
            <el-input v-model="taskForm.frequency" style="width:200px" />
            <span class="label-tip">Hz</span>
          </el-form-item>
          <el-form-item label="采集方式" prop="gatherWay">
            <el-radio-group v-model="taskForm.gatherWay">
              <el-radio :label="0">开路采集</el-radio>
              <el-radio :label="1">闭路采集</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="">
            <el-checkbox-group v-model="taskForm.use_Signal">
              <el-checkbox label="使用信号源发射信号" name="true" />
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="item-box">
        <el-form
          ref="signalFormRef"
          :model="signalForm"
          :rules="rules"
          :inline="true"
          label-width="100px"
          class="demo-ruleForm"
          :size="formSize"
          label-position="left"
          status-icon
        >
          <el-form-item label="信号源类型" prop="signal_type">
            <el-select v-model="signalForm.signal_type" placeholder="请选择">
              <el-option label="Zone one" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="信号源强度" prop="signal_level">
            <el-input v-model="signalForm.signal_level" style="width:200px" />
            <span class="label-tip">dBuv</span>
          </el-form-item>
          <el-form-item label="调制方式" prop="modulate_type">
            <el-select v-model="signalForm.modulate_type" placeholder="请选择">
              <el-option label="MSK" value="shanghai" />
              <el-option label="Zone two" value="beijing" />
            </el-select>
          </el-form-item>
          <el-form-item label="码速率">
            <el-input v-model="signalForm.bitrate" style="width:200px" />
          </el-form-item>
        </el-form>
      </div>
      <div class="item-box">
        <el-form
          ref="deviceFormRef"
          :model="deviceForm"
          :rules="rules"
          :inline="true"
          label-width="100px"
          class="demo-ruleForm"
          :size="formSize"
          label-position="left"
          status-icon
        >
          <el-form-item label="采集显宽" prop="signal_level">
            <el-input v-model="deviceForm.gather_span" style="width:200px" />
            <span>dBuV</span>
          </el-form-item>
          <el-form-item label="采集次数" prop="signal_level">
            <el-input v-model="deviceForm.number_times" style="width:200px" />
          </el-form-item>
          <el-form-item label="" style="width:100%">
            <el-radio-group v-model="deviceForm.is_series">
              <el-radio :label="true">
                <span>连续IQ</span>
                <el-input v-model="deviceForm.gather_time" style="width:200px;margin-left:34px;" placeholder="请输入采集时长" />
                <span class="label-tip">s</span>
              </el-radio>
              <el-radio :label="false">
                <span>单次IQ</span>
                <el-input v-model="deviceForm.gather_points" style="width:200px;margin-left:34px;" placeholder="请输入采集点数" />
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="item-box">
        <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="rules"
          :inline="true"
          label-width="100px"
          :size="formSize"
          label-position="left"
          status-icon
        >
          <el-form-item label="备注信息" style="width:100%">
            <el-input v-model="addForm.notes" type="textarea" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button>保存</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { reactive, ref ,onMounted} from 'vue'
import { ElMessage } from 'element-plus'
const dialogVisible = ref(false)
const pageType=ref("0")//0 添加 1编辑
const props=defineProps({
  types:{
    default:0
  },
  title:{
    default:"任务编辑"
  }
})
const radios=ref(0)
const formSize = ref('default')
const ruleFormRef = ref(null)
const taskFormRef = ref(null)
const signalFormRef=ref(null)
const deviceFormRef=ref(null)
const addFormRef=ref(null)
const pageData=reactive({
  taskData:{
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
})
let taskForm = reactive({
    "name":"任务一",
    "id":"16919837810012",
    "frequency":1000,
    "gatherWay":0,
    "use_Signal":true,
    "task_time":"2023-01-01 21:03:01",
    "status":0,
    "signal_info":{},
    "device_info":{},
    "add_info":{}
})
let signalForm = reactive({
        "signal_type":"信号1",
        "signal_level":10,
        "modulate_type":"MSK",
        "bitrate":10,
        "filter":"默认"
})
let deviceForm = reactive({
        "gather_span":100,
        "is_series":true,
        "gather_time":100,
        "gather_points":1000,
        "number_times":1
})
let addForm = reactive({
        "device_iype":"DZH300",
        "device_number":"0135012",
        "software_version":"v1.0.0",
        "antenna_type":"",
        "notes":"测试"
})





onMounted(()=>{
  console.log(props.types)
})


const rules = reactive({
  name: [
    { required: true, message: '请输入信号源名称', trigger: 'blur' },
    { min: 3, max: 20, message: '最小输入三位数名称', trigger: 'blur' },
  ],
  gatherWay: [
    {
      required: true,
      message: '请选择采集方式',
      trigger: 'change',
    },
  ],
  frequency: [
    {
      required: true,
      message: '请输入采集频率',
      trigger: 'change',
    },
  ],
  signal_type: [
    {
      required: true,
      message: '请选择信号源类型',
      trigger: 'change',
    },
  ],
  port: [
    {
      required: true,
      message: '请输入端口号',
      trigger: 'change',
    },
  ],
  signal_level: [
    {
      required: true,
      message: '请输入强度',
      trigger: 'change',
    },
  ],
  modulate_type:[
    {
      required: true,
      message: '请选择调制方式',
      trigger: 'change',
    },
  ],
  set_level: [
    {
      required: true,
      message: '请输入设置强度指令',
      trigger: 'change',
    },
  ],
  get_freq: [
    {
      required: true,
      message: '请输入获取频率指令',
      trigger: 'change',
    },
  ],
  get_level: [
    {
      required: true,
      message: '请输入获取强度指令',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change',
    },
  ],
  desc: [
    { required: true, message: 'Please input activity form', trigger: 'blur' },
  ],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
      console.log(ruleForm)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
}




























//初始化数据
function initForm(){
  let taskForms = {
    "name":"",
    "id":"",
    "frequency":"",
    "gatherWay":0,
    "use_Signal":true,
    "task_time":"",
    "status":0,
    "signal_info":{},
    "device_info":{},
    "add_info":{}
  }
let signalForms ={
        "signal_type":"",
        "signal_level":"",
        "modulate_type":"",
        "bitrate":"",
        "filter":"默认"
}
let deviceForms = {
        "gather_span":"",
        "is_series":true,
        "gather_time":"",
        "gather_points":"",
        "number_times":1
}
let addForms = {
        "device_iype":"",
        "device_number":"",
        "software_version":"",
        "antenna_type":"",
        "notes":""
}
// taskForm=taskForms
Object.assign(taskForm, taskForms)
signalForm=signalForms
deviceForm=deviceForms
addForm=addForms
}



function beforeDialog(done) {
  console.log("关闭弹窗")
  done()
}
function showDialog(types,data) {
  pageType.value=types
  if(types==0){
    initForm()
  }else{
    pageData.taskData=data
  }
  dialogVisible.value = true
}
function closeDialog() {
  dialogVisible.value = false
}
defineExpose({ showDialog, closeDialog })
</script>
<style scoped lang="scss">
.item-box{
  box-sizing:border-box;
  border:1px solid #ddd;
  padding:10px;
  margin-bottom:10px;
}
.label-tip{
  margin-left:10px;
}
.el-dialog__body{
  margin:20px;
}
.el-form--inline .el-form-item{
  width:50%;
  margin-right: 0;
  box-sizing: border-box;
  padding-right: 40px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}

.el-dialog__body{
  padding-top: 10px;
}
</style>