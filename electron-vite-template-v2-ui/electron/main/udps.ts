/*
 * @Author: you
 * @Date: 2023-07-12 17:37:05
 * @LastEditors: you
 * @LastEditTime: 2023-08-25 09:38:04
 * @FilePath: \mini-vuef:\Protest\electron\electron-vite-project\electron\udps.ts
 * @Description: 
 * 
 */
import dgram from "dgram" 
import {dialog} from "electron"
import fs from 'fs'
import path from 'node:path'
const server = dgram.createSocket("udp4");
export function createUdp(ips:any,port:any){

    console.log("create-udp");

const serverAddress = ips||'192.168.43.50';
const serverPort = port||9527;
 // 弹出文件夹选择对话框
 
server.on("message", (msg, rinfo) => {
  console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
  console.log(msg.toString());
  var SendBuff = 'Hello';
  var SendLen = SendBuff.length;
  //socket.send(buf, offset, length, port, address, [callback])
  //const message:any= new Buffer.from("你好，upd服务端！")
  //Buffer、Buffer的偏移、Buffer的长度、目标端口、目标地址、发送完成后的回调
//   server.send(SendBuff, 0, SendLen, 41234, 'localhost', (err, bytes) => {
//     console.error(err);
//     console.log(bytes);
//     server.close();
//   });
});

// server.on("listening", () => {
//   console.log("address:" + server.address().address);
//   console.log("port:" + server.address().port);
// });
server.on("close", () => {
    console.log("close");
});
server.on("error", (err) => {
    console.log("server-udp-error",err);
});
// server.bind({
//     address: serverAddress,
//     port: serverPort
// },() => {
//   console.log(`UDP server listening on ${serverPort}`);
// })
return server
}
