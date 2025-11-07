
// 定义 WebSocket 消息的结构
interface WebSocketMessage {
  jsonrpc?: string; // 固定属性
  id?: number | string; // 请求的唯一标识符
  method?: string; // 方法名
  [key: string]: any; // 其他消息内容，可以是任意的键值对
}
  
  class WebSocketService {
    private static instance: WebSocketService | null = null; // 静态实例，用于实现单例模式
    private sockets: Map<string, WebSocket> = new Map(); // 存储多个 WebSocket 连接实例，key 为连接 ID，value 为 WebSocket 实例
    private listeners: Map<string, Map<string,  Array<(message: WebSocketMessage) => void>>> = new Map(); // 存储每个 WebSocket 连接的消息类型监听器，key 为连接 ID，value 为消息类型与回调函数的映射
    private reconnectInterval: number = 3000; // WebSocket 连接断开后的重连间隔时间（单位：毫秒）
    private reconnectTimers: Map<string, any> = new Map(); // 存储每个连接的重连定时器
    private reconnectMaxCout: Map<string, any> = new Map(); // 存储每个连接的重连次数

    // 构造函数为私有，防止外部直接创建实例，确保使用单例模式
    private constructor() {
        console.log('WebSocketService 实例已创建');
    }
  
    // 获取单例实例，如果实例不存在则创建一个新的实例
    static getInstance(): WebSocketService {
      if (WebSocketService.instance === null) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance; // 返回唯一的实例
    }
  
    // 连接 WebSocket，并为每个连接分配一个唯一标识符
    connect(url: string, id: string): void {
      if(!url) return
      const status = this.getConnectionStatus(id)
      if (this.sockets.has(id) && status) {
        console.log(`WebSocket 连接已存在，ID: ${id}`);
        return; // 如果已经有该 ID 的连接，则不重新连接
      }
      

      const socket = new WebSocket(url); // 创建新的 WebSocket 实例
      this.sockets.set(id, socket); // 将 WebSocket 实例存储在 sockets 中
  
      // 连接成功时的回调
      socket.onopen = () => {
        console.log(`WebSocket 连接成功: ${id}`);
        const messages={"data": true,"type": "connect"}
        this.handleMessage(id, messages);
        if (this.reconnectTimers.has(id)) {
          console.log(`重连成功----: ${id}`);
          clearTimeout(this.reconnectTimers.get(id)); // 清除重连定时器
          this.reconnectTimers.delete(id); // 删除重连定时器
          this.reconnectMaxCout.delete(id); // 删除重连次数记录
        }
      };
  
      // 监听服务器发送的消息
      socket.onmessage = (event: MessageEvent) => {
        try {
          let message: any = JSON.parse(event.data)
          message.type="message"
          this.handleMessage(id, message); // 处理收到的消息
        }catch (error) {
          console.log('error==>>',error)
          console.error('WebSocket 收到非 JSON 数据:', event.data);
        }
      };
  
      // 连接关闭时的回调
      socket.onclose = () => {
        // console.log(`WebSocket onclose连接关闭: ${id}`);
        const messages={"data": false,"type": "connect"}
        this.handleMessage(id, messages);
        this.attemptReconnect(id, url); // 连接关闭时尝试重新连接
      };
  
      // 监听错误事件
      socket.onerror = (error: Event) => {
        // console.log(`WebSocket 错误: ${id}`, error);
        //this.attemptReconnect(id, url); // 错误发生时尝试重新连接

        socket.close(); // 错误发生时关闭连接并触发重连
      };
    }
  
    // 尝试重连逻辑，等待一定时间后重新连接 WebSocket
    private attemptReconnect(id: string, url: string): void {
      if (!this.reconnectTimers.has(id)) {
        // console.log(`尝试重新连接 WebSocket: ${id}`);
        
        
        const timer = setInterval(() => {
          this.connect(url, id); // 重新发起连接
          let maxReconnects = this.reconnectMaxCout.get(id) || 0; // 最大重连次数
          // console.log(`当前重连次数: ${maxReconnects}`,id);
          if (maxReconnects >= 50) { // 达到最大重连次数后停止重连
            console.log(`达到最大重连次数，停止重连: ${id}`);
            clearTimeout(this.reconnectTimers.get(id)); // 清除重连定时器
            this.reconnectTimers.delete(id); // 删除重连定时器
            this.reconnectMaxCout.delete(id); // 删除重连次数记录
          }
          this.reconnectMaxCout.set(id, maxReconnects + 1); // 增加重连次数
        }, this.reconnectInterval); // 使用定时器控制重连时间间隔
        this.reconnectTimers.set(id, timer); // 存储重连定时器
        
        
        
      }else{
        
        let maxReconnects = this.reconnectMaxCout.get(id) || 0;
        //console.log(`已有重连定时器，等待重连: ${id}，当前重连次数: ${maxReconnects}`);
        if (maxReconnects >= 2) { // 达到最大重连次数后停止重连
            console.log(`达到最大重连次数，停止重连: ${id}`);
            clearTimeout(this.reconnectTimers.get(id)); // 清除重连定时器
            this.reconnectTimers.delete(id); // 删除重连定时器
            this.reconnectMaxCout.delete(id); // 删除重连次数记录
          }
      }
    }
  
    // 处理接收到的消息，按照类型分发给相应的监听器
    private handleMessage(id: string, message: WebSocketMessage): void {
      if (this.listeners.has(id) && this.listeners.get(id)!.has(message.type)) {
        const idListeners = this.listeners.get(id)!.get(message.type); // 获取消息类型对应的回调函数
        // if (callback) {
        //   callback(message); // 调用回调函数，处理消息
        // }
        if (idListeners) {
          idListeners.forEach((callback: (message: WebSocketMessage) => void) => callback(message)); // 确保每个回调都符合类型签名
        }
      }else if (this.listeners.has(id)) {
        const idListeners = this.listeners.get(id)!
        for (const [type, callback] of idListeners.entries()) {
          if (type=="messagestr") {
            console.log(`回调字符串消息`, message);
            callback.forEach((callback) => {
              callback(message);
            })
          }
        }
      }
    }
  
    // 为指定连接的特定消息类型添加监听器
    on(id: string, type: string, callback: (message: WebSocketMessage) => void): void {
      // 如果该连接没有监听器，则初始化一个空的 Map
      if (!this.listeners.has(id)) {
        this.listeners.set(id, new Map());
      }
      const listenersForId = this.listeners.get(id)!;
  
      // 如果没有该类型的监听器，则添加新的监听器
      if (!listenersForId.has(type)) {
        listenersForId.set(type, [callback]);
      }else{
        const listenersForType = listenersForId.get(type)!;
        listenersForType.push(callback);
      }
      //console.log(`为连接 ${id} 添加了 ${type} 类型的监听器`,this.listeners);
    }
  
    // 向指定连接的 WebSocket 发送消息
    send(id: string, message: WebSocketMessage): void {
      const socket = this.sockets.get(id); // 获取指定 ID 的 WebSocket 实例
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message)); // 发送消息（需将对象转换为 JSON 字符串）
      } else {
        console.error(`WebSocket 连接未建立或已关闭: ${id}`);
      }
    }
  
    // 广播消息到所有已连接的 WebSocket
    broadcast(message: WebSocketMessage): void {
      for (const socket of this.sockets.values()) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message)); // 向每个连接的 WebSocket 发送消息
        }
      }
    }
    // 广播接收到的消息给所有回调
    private broadcastMessage(message: any): void {
      for (const [id, listenerSet] of this.listeners.entries()) {
        // 遍历所有 id 对应的回调集合
        for (const [type, callback] of listenerSet.entries()) {
          if (callback) {
            //callback(message); // 调用回调函数，处理消息
            callback.forEach((callback) => {
              callback(message);
            })
          }
        }
      }
    }
    // 关闭指定 ID 的 WebSocket 连接
    close(id: string): void {
      const socket = this.sockets.get(id); // 获取指定 ID 的 WebSocket 实例
      if (socket) {
        socket.close(); // 关闭连接
        this.sockets.delete(id); // 从存储中移除该连接
      }
    }
    // 更新连接地址并重新连接
    updateUrl(newUrl: string, id: string): void {
      if (this.sockets.get(id)) {
        console.log(`更新 WebSocket 连接地址: ${newUrl}`);
        this.close(id); // 关闭当前连接
        this.connect(newUrl,id); // 使用新地址重新连接
      }
    }
    // 从指定的 id 中移除回调函数
    removeListener(id: string,type:string="all", callback: (message: any) => void): void {
      const listenerSet = this.listeners.get(id);
      if (listenerSet&&type==="all") {
        this.listeners.delete(id); // 移除整个回调集合
      }else if (listenerSet&&listenerSet.has(type)) {
        listenerSet.delete(type); // 从回调集合中移除指定的回调函数
      }
    }
    isValidJSON(str: string) {
      const regex = /^[\],:{}\s]*$/;
      return regex.test(str.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
    }
    // 清除所有的回调监听器
    clearListeners(): void {
      this.listeners.clear();
    }
    // 获取指定 ID 的 WebSocket 连接是否处于打开状态
    getConnectionStatus(id: string): boolean {
      const socket = this.sockets.get(id); // 获取指定 ID 的 WebSocket 实例
      return socket ? socket.readyState === WebSocket.OPEN : false; // 返回连接的状态
    }
  }
  
  export default WebSocketService.getInstance(); // 导出 WebSocketService 类确保 WebSocketService 是单例模式
  