<template>
  <el-dialog v-model="dialogVisible" title="编辑信号源指令" :close-on-click-modal="false" :before-close="beforeDialog"
    width="800" align-center>
    <div class="dialog-main">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        :inline="true"
        label-width="100px"
        class="demo-ruleForm"
        :size="formSize"
        label-position="left"
        status-icon
      >
        <el-form-item label="IP" prop="ip">
          <el-input v-model="ruleForm.ip" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="ruleForm.port" style="width:100px" />
          <el-button type="primary" style="margin-left:20px;">连接测试</el-button>
        </el-form-item>
        
        <el-form-item label="设置频率" prop="set_freq">
          <el-input v-model="ruleForm.set_freq" />
        </el-form-item>
        <el-form-item label="设置强度" prop="set_level">
          <el-input v-model="ruleForm.set_level" />
        </el-form-item>
        <el-form-item label="设置码速率">
          <el-input v-model="ruleForm.set_bitrate" />
        </el-form-item>
        <el-form-item label="设置滤波器">
          <el-input v-model="ruleForm.set_filter" />
        </el-form-item>
        <el-form-item label="设置码速率">
          <el-input v-model="ruleForm.set_bitrate" />
        </el-form-item>
        <el-form-item label="设置调制速率">
          <el-input v-model="ruleForm.set_modulate_rate" />
        </el-form-item>
        <el-form-item label="设置频偏">
          <el-input v-model="ruleForm.set_modulate_depth" />
        </el-form-item>
        <el-form-item label="设置调制深度">
          <el-input v-model="ruleForm.set_modulate_depth" />
        </el-form-item>
        <el-form-item label="获取频率" prop="get_freq">
          <el-input v-model="ruleForm.get_freq" />
        </el-form-item>
        <el-form-item label="获取强度" prop="get_level">
          <el-input v-model="ruleForm.get_level" />
        </el-form-item>
        <el-form-item label="获取码速率">
          <el-input v-model="ruleForm.get_bitrate" />
        </el-form-item>
        <el-form-item label="获取滤波器">
          <el-input v-model="ruleForm.get_filter" />
        </el-form-item>
        <el-form-item label="获取调制速率">
          <el-input v-model="ruleForm.get_modulate_rate" />
        </el-form-item>
        <el-form-item label="获取频偏">
          <el-input v-model="ruleForm.get_freq_offset" />
        </el-form-item>
        <el-form-item label="获取调制深度">
          <el-input v-model="ruleForm.get_modulate_depth" />
        </el-form-item>
        <el-form-item label="信号源名称" prop="name">
          <el-input v-model="ruleForm.name" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="submitForm(ruleFormRef)">确定 </el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
const dialogVisible = ref(false)



const formSize = ref('default')
const ruleFormRef = ref(null)


const ruleForm = reactive({
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
})




// const ruleForm = reactive({
//   name: 'Hello',
//   region: '',
//   count: '',
//   date1: '',
//   date2: '',
//   delivery: false,
//   type: [],
//   resource: '',
//   desc: '',
// })

const rules = reactive({
  name: [
    { required: true, message: '请输入信号源名称', trigger: 'blur' },
    { min: 3, max: 20, message: '最小输入三位数名称', trigger: 'blur' },
  ],
  ip: [
    {
      required: true,
      message: '请输入ip',
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
  set_freq: [
    {
      required: true,
      message: '请输入设置频率指令',
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
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
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

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}))
































function beforeDialog(done) {
  console.log("关闭弹窗")
  done()
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