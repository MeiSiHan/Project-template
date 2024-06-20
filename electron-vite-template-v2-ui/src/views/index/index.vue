<template>
  <div class="content-box">
    hello world
  </div>


</template>
<script setup lang="ts">
import './index.scss'
import { ref,reactive,onMounted } from 'vue'
import { ipcMain, ipcRenderer } from 'electron'
import userStore from '@/store/user'
const { readdir } = require('fs').promises;
const { join } = require('path');
const store = userStore()

</script>



<style scoped>

</style>
