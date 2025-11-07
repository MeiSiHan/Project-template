// scripts/generate-version-info.js

const fs = require('fs');
const path = require('path');
const { version, description } = require('../package.json');
const config = require('../localfile/config/config.json');
// 获取当前日期
const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 生成版本信息
let currentDate=getCurrentDate();
const versionInfo = {
  version,
  description,
  build_date: currentDate,
  buildTime: new Date().toISOString()
};

// 保存到版本信息文件
const versionFilePath = path.join(__dirname, '..', 'localfile', 'version.json');
const configPath=path.join(__dirname, '..', 'localfile/config','config.json');
config.version_info={
  version,
  build_date: currentDate,
}
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2));
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Version info generated:', versionFilePath);
