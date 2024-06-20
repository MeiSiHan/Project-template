

import { defineStore } from 'pinia'
const userStore = defineStore({
  id: 'userInfo',  // 命名，唯一
  state: () => {
      return {
        userInfo:{} as any
      }
  },
  actions: {
      setUserInfo(data:any) {
          // 可直接通过this访问state属性
          this.userInfo = data;
      }
  },
  getters: {},
  persist: {
    enabled: true,
    strategies: [
      {
        // 自定义名称
        // key: 'login_store',
        // 保存位置，默认保存在sessionStorage localStorage
        storage: localStorage,
        // 指定要持久化的数据，默认所有 state 都会进行缓存，你可以通过 paths 指定要持久化的字段，其他的则不会进行持久化。
        paths: ['userInfo'],
      },
    ],
  }
})

export default userStore