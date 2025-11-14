import * as net from 'net';

interface Message {
  message: string;
  needsReply: boolean;
}

export class TCPNet {
  private client: net.Socket | null;
  private messageQueue: Message[];
  private isWaitingForReply: boolean;
  private readonly host: string;
  private readonly port: number;
  private onDataCallback: ((data: string) => void) | null;
  private onTimeoutCallback: (() => void) | null;
  private onErrorCallback: ((error: Error) => void) | null;
  private onEndCallback: (() => void) | null;
  private onConnectCallback: (() => void) | null;
  private savedEvents: string[];
  private currentSend:Object;
  private receivedBuffer:Buffer|null;
  private static readonly TIMEOUT = 5000; // 5秒超时
  private sptmLength: number;
  private asciiLength:number;
  private waitCout:number;
  private buffer: Buffer;
  private frameHeader: Buffer;
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.client = null;
    this.messageQueue = [];
    this.isWaitingForReply = false;
    this.onDataCallback = null;
    this.onTimeoutCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onConnectCallback = null;
    this.savedEvents = [];
    this.currentSend={
      message:"",
      code:""
    }
    this.receivedBuffer=null;
    this.sptmLength=0;
    this.asciiLength=0;
    this.waitCout=0;
    this.buffer = Buffer.alloc(0);
    this.frameHeader = Buffer.from();
  }

  public connect(): void {
    // 创建与服务器的连接
    this.client = net.createConnection({ host: this.host, port: this.port }, () => {
      console.log('net server success');
      if (this.onConnectCallback) {
        this.onConnectCallback();
      }
    });
    //console.log('net connect',this.client);
    // 监听连接成功事件
    // 监听从服务器接收到的数据
    this.client.on('data', (data) => {
      console.log('net data', data.toString().slice(0,10));
      //转换字符
      //console.log('net data messageQueue',this.messageQueue)
      //console.log('net data currentSend',this.currentSend)
      let isNext=true;
      if (this.onDataCallback) {
        var sendInfo:any=this.currentSend
        
        //处理数据
        if(sendInfo.code==="0007"){
          //频谱数据
          this.waitCout=this.waitCout+1;
          let bufferString=data.toString()
          let regex = /^[1-9]$/;
          if(bufferString.slice(0,1)=="#"&& regex.test(bufferString.slice(1,2))){
            this.receivedBuffer=null
            this.sptmLength=0
            this.asciiLength=0
            let pointLength=parseInt(bufferString.slice(1,2))
            let asciiLength=pointLength+2
            this.asciiLength=asciiLength;
            let pointNumber=parseInt(bufferString.slice(2,this.asciiLength))
            let sptmHeader = data.toString('ascii', 0, asciiLength);
            this.sptmLength=asciiLength+pointNumber
            //console.log("net point header",this.sptmLength,sptmHeader,pointLength,pointNumber)
            
            this.receivedBuffer=data
          }else{
            //第二段频谱
            this.receivedBuffer=Buffer.concat([this.receivedBuffer, data]);
          }
          if(this.sptmLength==this.receivedBuffer.length){
            //数据接收完成
          // console.log("net#11111#",this.sptmLength,this.receivedBuffer.length)
            
            let hexData = this.receivedBuffer.slice(this.asciiLength); // 剩余部分是十六进制数据的 Buffer
            let sptmHeader = data.toString('ascii', 0, this.asciiLength);
            // 将十六进制数据转换为十进制数值
            let declittleData:any=[sptmHeader];
            for (let i = 0; i < hexData.length; i += 2) {
                const hexByte = hexData.slice(i, i + 2);
                let newhex=this.littleToDec(hexByte)
                declittleData.push(newhex);
            }
            hexData=null
            this.receivedBuffer=null
            this.sptmLength=0
            this.asciiLength=0
            var reqdata=this.returnData(sendInfo.message,sendInfo.code,sendInfo.type,true,declittleData)
            this.onDataCallback(reqdata);
            declittleData=null
          }else if(this.sptmLength<this.receivedBuffer.length||this.waitCout>5){
            this.receivedBuffer=null
            this.sptmLength=0
            this.asciiLength=0
            console.log("net data sptm error",this.waitCout)
          }else{
            isNext=false
            console.log("net wait for data")
          }
        }else{
          // var reqdata=this.returnData(sendInfo.message,sendInfo.code,sendInfo.type,true,data)
          // this.onDataCallback(reqdata);
          let header=data.readUint16LE(0)
          let dataLength=data.readUint32LE(2);
          console.log("net data header",header,dataLength)
          let newData=this.parseDataStructures(data,6)
          var reqdata=this.returnData(sendInfo.message,sendInfo.code,sendInfo.type,true,newData)
          this.onDataCallback(reqdata);
          data=null;
        }
      }
      if(isNext){
        this.isWaitingForReply = false;
        this.processNextMessage();
        this.waitCout=0;
      }
    });

    // 监听连接关闭事件
    this.client.on('end', () => {
      console.log('net end');
      if (this.onEndCallback) {
        this.onEndCallback();
      }
      this.client = null;
    });

    // 监听连接错误事件
    this.client.on('error', (err) => {
      console.error('net error:net error:net error:net error:port'+this.port, err);
      if (this.onErrorCallback) {
        this.onErrorCallback(err);
      }
      this.client = null;
    });
  }

  public sendMessage(message: string,code:string,type:string, needsReply: boolean): void {
    if (this.client) {
      if (needsReply) {
        this.isWaitingForReply = true;
      }
      // 发送消息给服务器
      this.client.write(message, (err) => {
        if (err) {
          console.error('net send error:', err);
          if (this.onErrorCallback) {
            this.onErrorCallback(err);
          }
          if (needsReply) {
            this.isWaitingForReply = false;
          }
          this.processNextMessage();
        } else {
          console.log("net send success",message)
          this.saveEvent(message);
          this.currentSend={
            message,
            code,
            type
          }
        }
      });
    } else {
      const error = new Error('客户端未连接');
      console.error(error.message);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  private littleToDec(hexByte:Buffer):any{
    let buf = Buffer.from(hexByte, 'hex');
    try {
      let newnumb=buf.readInt16LE(0)
      return newnumb
    } catch (error) {
      console.log("main buf error",hexByte)
    }
    buf=null
    
  }
  private saveEvent(event: string): void {
    // 保存发送的事件
    this.savedEvents.push(event);
    //console.log('net sava event:', event);
  }

  private returnData(message:string,code:string,type:string,success:boolean,data:any):any{
    var data:any={
      message:message,
      code:code,
      type:type,
      data:data,
      success:success,
      msg:""
    }
    return data
  }
  public queueMessage(needsReply: boolean,data:any,type:string): void {
    // 将消息加入队列
    let messageData={
      "needsReply":needsReply,
      "message":data.message,
      "code":data.code,
      "type":type
    }
    this.messageQueue.push(messageData);
    //console.log("net Queue",this.isWaitingForReply,this.messageQueue)
    if (!this.isWaitingForReply) {
      this.processNextMessage();
    }
  }
  public clearQueueMessage():void{
    this.messageQueue=[]
    this.isWaitingForReply=false
    console.log("clearmessage-----",this.isWaitingForReply)
  }
  public getQueueMessage():Message[]{
    return this.messageQueue
  }
  private processNextMessage(): void {
    // 处理下一条待发送的消息
    if (this.messageQueue.length > 0 && !this.isWaitingForReply) {
      const nextMessage:any = this.messageQueue.shift();
      if (nextMessage) {
        this.sendMessage(nextMessage.message,nextMessage.code,nextMessage.type, nextMessage.needsReply);
      }
    }
  }

  public onData(callback: (data: string) => void): void {
    // 设置数据接收回调函数
    this.onDataCallback = callback;
  }

  public onTimeout(timeout: number, callback: () => void): void {
    // 设置超时回调函数，并启动超时计时器
    this.onTimeoutCallback = callback;
    this.startTimeout(timeout);
  }

  private startTimeout(timeout: number): void {
    // 启动超时计时器
    setTimeout(() => {
      if (this.isWaitingForReply && this.onTimeoutCallback) {
        console.log('net out times超时，未收到回复');
        this.onTimeoutCallback();
        this.isWaitingForReply = false;
        this.processNextMessage();
      }
    }, timeout);
  }

  public onError(callback: (error: Error) => void): void {
    // 设置错误处理回调函数
    this.onErrorCallback = callback;
  }

  public onEnd(callback: () => void): void {
    // 设置连接结束回调函数
    this.onEndCallback = callback;
  }

  public onConnect(callback: () => void): void {
    // 设置连接成功回调函数
    this.onConnectCallback = callback;
  }
  public on(event: string, callback: (...args: any[]) => void): void {
    switch (event) {
      case 'data':
        this.onDataCallback = callback;
        break;
      case 'timeout':
        this.onTimeoutCallback = callback;
        break;
      case 'error':
        this.onErrorCallback = callback;
        break;
      case 'end':
        this.onEndCallback = callback;
        break;
      case 'connect':
        this.onConnectCallback = callback;
        break;
      default:
        throw new Error(`Unsupported event: ${event}`);
    }
  }
  public close(): void {
    // 关闭与服务器的连接
    if (this.client) {
      this.client.removeAllListeners();
      this.client.destroy();
      this.client.end();
    }
  }

  public getSavedEvents(): string[] {
    // 获取保存的事件列表
    return this.savedEvents;
  }
  // 批量解析数据结构
 parseDataStructures(buffer:Buffer,startOffset=5) {
    const data:any = [];
    let offset = startOffset;
    while (offset + 20 <= buffer.length) { // 假设每个结构至少20字节
        let item:any = {};
        item = this.parseDFData(buffer,offset);
        offset=item.bytesProcessed
        data.push(item);
    }
    return data;
  }
  /**
     * 解析DFData结构体
     * 对应C++结构体：
     * typedef struct _DFData {
     *     uint32_t   dataType = BDDataType_DFLine;
     *     uint64_t   freq = INVALID_FREQ;
     *     uint16_t   angle = INVALID_ANGLE;
     *     int16_t    resultLev = INVALID_STRENGTH;
     *     uint64_t   timeMs = 0;
     *     PositionInfo posInfo = _PositionInfo();
     * } DFData;
     * @param {Buffer} buffer - 数据缓冲区
     * @returns {Object} 解析后的数据对象
     */
    public parseDFData(buffer: Buffer,startoffset:number): any {
        let result:any = {};
        let offset = startoffset;
        let dataType = buffer.readUInt8(offset);//0 测向线 1 路径点
        // 解析数据类型 (uint8_t，1字节)
        if (offset + 1 <= buffer.length) {
            result.type = dataType;
            offset += 1;
        }
        // 解析频率 (uint64_t，8字节)
        if (offset + 8 <= buffer.length) {
            // Node.js没有原生64位整数读取方法，使用组合方式读取
            // const low:any = buffer.readUInt32LE(offset);
            // const high:any  = buffer.readUInt32LE(offset + 8);
            // result.freq = (BigInt(high) << 32n) | BigInt(low);
            const low = BigInt(buffer.readUInt32LE(offset));
            const high = BigInt(buffer.readUInt32LE(offset + 4));
            result.freq=parseFloat(low + (high << 32n));
            offset += 8;
        }

        // 解析角度 (uint16_t，2字节)
        if (offset + 2 <= buffer.length&&dataType===0) {
            result.angle = buffer.readUInt16LE(offset);
            offset += 2;
        }

        // 解析结果强度 (int16_t，2字节，有符号)
        if (offset + 2 <= buffer.length) {
            result.value = buffer.readInt16LE(offset);
            offset += 2;
        }

        // 解析时间 (uint64_t，8字节)
        if (offset + 8 <= buffer.length) {
            const timeLow = buffer.readUInt32LE(offset);
            const timeHigh = buffer.readUInt32LE(offset + 4);
            result.time = parseFloat((BigInt(timeHigh) << 32n) | BigInt(timeLow));
            offset += 8;
        }
        // 解析位置信息
        if (offset < buffer.length) {
            const position = this.PositionInfoParser(buffer, offset);
            result = {...result,...position};
            offset += 10;
        }
        buffer=null;
        result.bytesProcessed = offset;
        // console.log("line data",result)
        return result;
    }
    /** 解析PositionInfo结构体
     * 对应C++结构体：
     * typedef struct _PositionInfo
    */
    public PositionInfoParser(buffer, offset = 0) {
        let result:any = {};
        // 解析经度 (int32_t，4字节)
        if (offset + 4 <= buffer.length) {
            result['longitude'] = buffer.readInt32LE(offset)/10000000;
            offset += 4;
        }

        // 解析纬度 (int32_t，4字节)
        if (offset + 4 <= buffer.length) {
            result['latitude'] = buffer.readInt32LE(offset)/10000000;
            offset += 4;
        }

        // 解析高度 (int16_t，2字节)
        if (offset + 2 <= buffer.length) {
            result['altitude'] = buffer.readInt16LE(offset);
            offset += 2;
        }

        result['bytesRead'] = offset;
        return result;
    }
    // 使用BigInt精确解析uint64_t小端序
    readUInt64LEBigInt(buffer, offset) {
        const low = BigInt(buffer.readUInt32LE(offset));
        const high = BigInt(buffer.readUInt32LE(offset + 4));
        return low + (high << 32n);
    }
}
