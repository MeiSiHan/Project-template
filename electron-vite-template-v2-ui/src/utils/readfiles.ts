let path = require('path');
let fs = require('fs');
let crypto = require('crypto');
export function getAll (dir: any) {
  console.log("获取应用路径",path.join(process.cwd()))
    var filesNameArr = []
    let orders = 0
    let rootDir=dir
    function readdirs(dir:any, folderName:any, myroot?:any) {
      const relativePaths = path.relative(rootDir, dir);
      let torelativePaths = relativePaths.replace(/\\/g, "/")
      if(torelativePaths!=""&&torelativePaths.charAt(torelativePaths.length - 1)!="/"){
        torelativePaths+="/"
      }
      var result:any = { //构造文件夹数据
        "id":orders,
        "path": dir,
        "name": path.basename(dir),
        "dir_name":path.basename(dir),
        "type": 1,
        //"url":dir,
        "pack_dir":torelativePaths,
        "deploy_dir":"",//部署相对路径
        "show_deploy_path":"",//显示部署路径
        "priority":775,
        "deploy_folder":false,//部署文件生成目录
        "check_deploy_folder":false,//打包勾选部署文件生成目录
        "check_soft_link":false,//批量软连接后缀勾选
        "show_soft_link":true,//显示软连接后缀
        "is_base_path":false,//是否设置目标目录
        //"check_pack":false,//是否检查打包
        "runtime_base_path":"",//部署目标目录
        "deploy_type":"",//部署方式
      }
      orders++;
      var files = fs.readdirSync(dir) //同步拿到文件目录下的所有文件名
      result.children = files.map(function (file:any) {
        var subPath = path.resolve(dir, file) //拼接为绝对路径
        
        let Path = path.join(dir, file) //拼接为相对路径
        let relativePath = path.relative(rootDir, Path);
        let torelativePath = relativePath.replace(/\\/g, "/")
        torelativePath=torelativePath.slice(0,relativePath.length-file.length)
        if(torelativePath!=""&&torelativePath.charAt(torelativePath.length - 1)!="/"){
          torelativePath+="/"
        }
        var stats = fs.statSync(Path) //拿到文件信息对象
        if (stats.isDirectory()) { //判断是否为文件夹类型
          return readdirs(Path, file, file) //递归读取文件夹
        }
        //构造文件数据
        let fileInfo:any={
            "id": orders,
            "file_name": file,
            "name": file,
            //"url":subPath,
            "path": Path,
            "type": 0,
            "pack_dir":torelativePath,
            "deploy_dir":"",//部署相对路径
            "show_deploy_path":"",//显示部署路径
            "md5_sum":calculateMD5(Path),
            "priority":775,
            "soft_link_subfix":"",//软连接后缀
            "check_soft_link":false,//批量软连接后缀勾选
            "show_soft_link":true,//显示软连接后缀
            "is_deploy_file":false,//是否部署文件
            "show_deploy_file":false,//显示部署文件
            "is_ssh_file":false,//显示sh文件
            "run_by":"",//是否由更新库执行
            "delect_after_exe":""//脚本执行是否删除
        }
        if(file.indexOf(".sh")>-1||file.indexOf(".cmd")>-1){
          fileInfo.is_ssh_file=true
          fileInfo.run_by=0
          fileInfo.delect_after_exe=0
        }
        if(file=="deploy.json"){
          fileInfo.is_deploy_file=true
          fileInfo.show_deploy_file=false
          fileInfo.show_soft_link=false
        }
        orders++;
        return fileInfo
      })
      return result //返回数据
    }
    let treeArr=readdirs(dir, dir)
    treeArr.children.sort((a:any, b:any) => b.type - a.type);
    filesNameArr.push(treeArr)
    filesNameArr[0].maxorder=orders
    return filesNameArr
  }

// 计算文件的 MD5 哈希值
function calculateMD5(filePath:string) {
  const hash = crypto.createHash('md5');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}
//读取文件
export function readFile(dir: string) {
  let fileUrl = path.join(process.cwd(), dir)
  return new Promise((resolve, reject) => {
    fs.readFile(fileUrl, 'utf-8', (err: any, data: any) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(data)
    })
  })
}
//写入多个json文件
export function writeJSONFiles(dataObjects:any) {
  return new Promise((resolve, reject) => {
    try {
        // 遍历数据对象数组
        for (const obj of dataObjects) {
            const { deploy_info, deploy_dir } = obj; // 解构数据对象中的数据和文件路径
            let writecont={
              "deploy_info":deploy_info
            }
            let writePath=deploy_dir+"\\deploy.json"
            var datas=JSON.stringify(writecont,null,2);
            // 写入 JSON 数据到文件
            fs.writeFileSync(writePath, datas, 'utf-8');
        }
        // 所有文件都写入成功，返回成功
        resolve('All files have been written successfully.')
    } catch (error:any) {
        // 如果有错误发生，返回错误信息
        reject(error);
    }
  })
}

//删除文件
export function delectFiles(filePaths:Array<string>){
  for(let i=0;i<filePaths.length;i++){
    let filePath=filePaths[i]
    let fileName=filePath+"\\deploy.json"
    try {
      fs.unlinkSync(fileName)
      console.log("删除文件成功",fileName)
    } catch (error) {
      console.log("删除文件失败",error)
    }
  }
}

//日期格式化
export function getData(n:number) {
  let now = new Date(n),
    y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate();
  return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + now.toTimeString().substr(0, 8);
}