import fs from 'fs'
import path from 'path'
import { dialog, app, shell } from '@electron/remote'


/**
 * 读取json文件内容
 * @param {*} filePath 
 * @returns 
 */

function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }
  /**
   * 写入json文件
   * @param {*} filePath 
   * @param {*} data 
   * @returns 
   */
  function writeJsonFile(filePath, data) {
    return new Promise((resolve, reject) => {
      const jsonData = JSON.stringify(data);
      fs.writeFile(filePath, jsonData, 'utf-8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }




/* 判断文件是否存在的函数
*https://www.codenong.com/cs106043818/?eqid=b6925fad00012e170000000664634fe0
*@path_way, 文件路径
 */
function isFileExisted(filePath) {
    console.log(`${app.getAppPath()}\\`)
    return new Promise((resolve, reject) => {
      fs.access(filePath, (err) => {
        console.log("检查文件",err)
        if (err) {
            resolve(false);//"不存在"
        } else {
          resolve(true);//"存在"
        }
      })
    }).catch( error => {
        console.log('error', error); //这里会打印捕获的异常是什么，我这里是false
     
     });
}
/* 判断文件是否存在的函数
*@path_way, 文件路径
 */
function isFileCreateExisted(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, (err) => {
        if (err) {
          fs.appendFileSync(filePath, '{"data":[],"total":0}', 'utf-8', (err) => {
            if (err) {
              return console.log('该文件不存在，重新创建失败！')
            }
            console.log("文件不存在，已新创建");
          });
          reject(false);
        } else {
          resolve(true);
        }
      })
    })
  }

/* 用于判断路径是否存在， 如果不存在，则创建一个 */
// async function mkdirPath(pathStr) {
//     var projectPath = path.join(process.cwd())
//     var tempDirArray = pathStr.split('\')
//     for (var i = 0; i < tempDirArray.length; i++) {
//       projectPath = projectPath + '/' + tempDirArray[i];
//       if (await isFileExisted(projectPath)) {
//         var tempstats = fs.statSync(projectPath);
//         if (!(tempstats.isDirectory())) {
//           fs.unlinkSync(projectPath);
//           fs.mkdirSync(projectPath);
//         }
//       }
//       else {
//         fs.mkdirSync(projectPath);
//       }
//     }
//     return projectPath;
//   }
/**
 * 判断检查文件或文件夹，并创建文件夹
 * @param {*} folderPath 文件路径
 */
function createFolderPath(folderPath) {
    const folders = folderPath.split(path.sep);
    console.log("folders",folders)
    let currentPath = '';
  
    folders.forEach((folder) => {
      currentPath = path.join(currentPath, folder);
      try {
        fs.accessSync(currentPath, fs.constants.F_OK);
      } catch (err) {
        if (err.code === 'ENOENT') {
            console.log("创建新文件夹",currentPath)
          fs.mkdirSync(currentPath);
        } else {
          throw err;
        }
      }
    });
  }

/**
 * 删除文件
 * @param {*} filePath 
 */
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}
/**
 * 删除文件夹 递归地删除文件夹内的所有文件和文件夹。你可以使用fs模块中的fs.readdir、fs.unlink和fs.rmdir方法
 * @param {*} folderPath 
 * @returns 
 */
function deleteFolder(folderPath) {
    return new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }
  
        const deleteFilePromises = [];
        files.forEach(file => {
          const filePath = path.join(folderPath, file);
          const filePromise = fs.promises.lstat(filePath)
            .then(stats => {
              if (stats.isDirectory()) {
                return deleteFolder(filePath);
              } else {
                return fs.promises.unlink(filePath);
              }
            });
          deleteFilePromises.push(filePromise);
        });
  
        Promise.all(deleteFilePromises)
          .then(() => {
            fs.rmdir(folderPath, err => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          })
          .catch(reject);
      });
    });
  }
/**
 * 删除空文件夹
 * @param {*} folderPath 
 * @returns 
 */
function deleteEmptyFolder(folderPath) {
    return new Promise((resolve, reject) => {
      fs.rmdir(folderPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
}
  //导出
  export {
    readJsonFile,
    writeJsonFile,
    isFileExisted,
    createFolderPath,
    deleteFile,
    deleteFolder
  }