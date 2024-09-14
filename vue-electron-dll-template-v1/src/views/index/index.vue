<template>
  <div class="page-box">
    shouye
   
    <div class="name"> {{ names }}</div>
    <p>路径{{ pageData.route }}</p>
  </div>
</template>
<script setup>
import { ref,reactive,onMounted } from 'vue'
import { ElMessageBox, ElMessage, ElLoading, ElNotification } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import userStore from '@/store/index.js';
import { storeToRefs } from 'pinia'
const store = userStore()
const { name } = storeToRefs(store)
const router = useRouter()
const route = useRoute()
const pageData=reactive({
  route:""
})
onMounted(()=>{
  console.log(route)
  pageData.route=route
})
const names=ref('hellos')
names.value=store.name
</script>
<style scoped lang="scss">
.page-box{
  width: 100%;
  height: 100%;
  .name{
    color:red;
  }
}
</style>