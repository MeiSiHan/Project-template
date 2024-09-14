import { defineStore } from "pinia";


// 第一个参数是应用程序中 store 的唯一 id
const appStore = defineStore("users", {
  state: () => {
    return {
      name: "小猪课堂"
    };
  },
  getters: {
    getAddAge: (state) => {
      return (num) => state.name + num;
    }
  },
  actions: {
    setName(name) {
      this.name = name;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        // 自定义名称
        // key: 'login_store',
        // 保存位置，默认保存在sessionStorage localStorage
        storage: localStorage,
        // 指定要持久化的数据，默认所有 state 都会进行缓存，你可以通过 paths 指定要持久化的字段，其他的则不会进行持久化。
        paths: ['name'],
      },
    ],
  }
});
export default appStore