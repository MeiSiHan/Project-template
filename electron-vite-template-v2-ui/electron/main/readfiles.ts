import { promises } from "original-fs";

let path = require('path');
let fs = require('fs');
// 读取 JSON 文件
function readJSONFile(filepath) {
  try {
    const data = fs.readFileSync(filepath, 'utf-8');
    return data;
  } catch (error) {
    console.error(error);
    return "error01"
  }
}

// 判断文件是否存在并读取 JSON 内容（如果存在）
export function checkAndReadJSONFile(filepath:string): Promise<void> {
  return new Promise((resolve,reject)=>{
    fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist');
        let data={
          "files_list":[]
        }
        var content=createJSONFile(filepath,data); // 如果文件不存在，则创建该文件
        resolve(content)
      } else {
        var conten=readJSONFile(filepath);
        resolve(conten)
      }
    });
  })
  
}

// 创建 JSON 文件
function createJSONFile(filepath,data) {
  var datas=JSON.stringify(data,null,2);
  try {
    fs.writeFileSync(filepath, datas, 'utf-8');
    console.log('File created: ' + filepath);
    var contents=readJSONFile(filepath); // 创建文件后进行读取操作
    return contents;
  } catch (error) {
    console.error(error);
    return "error02"
  }
}
export function writeJSONFile(filepath,data) {
  let files=path.join(process.cwd(),'/localfile/pathjson/'+filepath)
  var datas=JSON.stringify(data);
  return new Promise((resolve,reject)=>{
    try {
      fs.writeFileSync(files, datas, 'utf-8');
      console.log('File created: ' + filepath);
      return resolve(files)
    } catch (error) {
      console.error(error);
      reject(error)
    }
  })
  
}