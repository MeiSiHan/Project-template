//拷贝
export function deepCopy(obj:any) {
    // 如果传入的不是对象，则直接返回该值（基本类型数据会被直接返回）
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    // 根据传入对象的类型创建一个新的目标对象或数组
    let newObj:any = Array.isArray(obj) ? [] : {};

    // 遍历原始对象的属性或数组元素
    for (let key in obj) {
        // 只复制对象自身的属性，不复制原型链上的属性
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // 递归调用深拷贝函数，复制每个属性的值
            newObj[key] = deepCopy(obj[key]);
        }
    }

    return newObj;
}
/**
 * 简洁版日期格式化函数
 * @param {Date|string|number} input - 日期输入
 * @param {string} format - 格式字符串，默认'yyyy-MM-dd'
 * @returns {string} 格式化后的日期字符串，输入无效时返回空字符串
 */
export function formatDate(input:any, format = 'yyyy-MM-dd') {
    try {
        const date:any = new Date(input);
        if (isNaN(date.getTime())) return '';
        
        const pad = (n:any) => n.toString().padStart(2, '0');
        
        return format
            .replace(/yyyy/g, date.getFullYear())
            .replace(/MM/g, pad(date.getMonth() + 1))
            .replace(/dd/g, pad(date.getDate()))
            .replace(/hh/g, pad(date.getHours()))
            .replace(/mm/g, pad(date.getMinutes()))
            .replace(/ss/g, pad(date.getSeconds()))
            .replace(/SSS/g, date.getMilliseconds().toString().padStart(3, '0'));
    } catch {
        return '';
    }
}


// 随机色
export function getRandomColor() {
  let r = Math.floor(Math.random() * 256); // 生成0到255之间的随机数
  let g = Math.floor(Math.random() * 256); // 生成0到255之间的随机数
  let b = Math.floor(Math.random() * 256); // 生成0到255之间的随机数
  
  // 将每个颜色通道转换为两位十六进制数，不足的前面补0
  let color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return color;
}

/**
 * 根据强度值生成由浅到深的渐变颜色
 * @param {number} intensity - 当前强度值（需在 [min, max] 区间内，超出会被限制）
 * @param {number} minIntensity - 强度最小值（对应最浅颜色）
 * @param {number} maxIntensity - 强度最大值（对应最深颜色）
 * @param {Object} [options] - 可选配置
 * @param {string} [options.startColor='#f5f5f5'] - 起始色（最浅，对应 minIntensity），支持 HEX/RGB/HSL
 * @param {string} [options.endColor='#333333'] - 结束色（最深，对应 maxIntensity），支持 HEX/RGB/HSL
 * @param {string} [options.format='hex'] - 输出颜色格式，可选 'hex'/'rgb'/'hsl'
 * @returns {string} 渐变后的颜色值（如 #abc123、rgb(123,45,67)、hsl(120,50%,50%)）
 */
export function getGradientColorByIntensity(intensity:number, minIntensity:number, maxIntensity:number, options :any= {}) {
  // 默认配置
  const {
    startColor = '#f5f5f5',
    endColor = '#333333',
    format = 'hex'
  } = options;

  // 1. 处理边界：确保 min < max，避免除以 0
  if (minIntensity >= maxIntensity) {
    console.warn('强度最小值不能大于等于最大值，已自动交换');
    [minIntensity, maxIntensity] = [maxIntensity, minIntensity];
  }
  if (intensity < minIntensity) {
    console.warn('强度值不能小于最小值，已自动限制');
    intensity = minIntensity;
  }
  if(intensity > maxIntensity) {
    console.warn('强度值不能大于最大值，已自动限制');
    intensity = maxIntensity
  }
  // 2. 限制强度值在 [min, max] 区间
  const clampedIntensity = Math.max(minIntensity, Math.min(intensity, maxIntensity));

  // 3. 计算强度比例（0-1 之间）：0 对应起始色，1 对应结束色
  const ratio = (clampedIntensity - minIntensity) / (maxIntensity - minIntensity);

  // 4. 解析起始色和结束色为 RGB 格式（统一计算）
  const startRgb = parseColorToRgb(startColor);
  const endRgb = parseColorToRgb(endColor);

  // 5. 根据比例计算中间色的 RGB 值
  const midR = Math.round(startRgb.r + ratio * (endRgb.r - startRgb.r));
  const midG = Math.round(startRgb.g + ratio * (endRgb.g - startRgb.g));
  const midB = Math.round(startRgb.b + ratio * (endRgb.b - startRgb.b));

  // 6. 转换为目标格式并返回
  switch (format.toLowerCase()) {
    case 'rgb':
      return `rgb(${midR}, ${midG}, ${midB})`;
    case 'hsl':
      return rgbToHsl(midR, midG, midB);
    case 'hex':
    default:
      return rgbToHex(midR, midG, midB);
  }
}


/**
 * 扩展函数：多色渐变（如红→黄→绿，按强度区间分布）
 * @param {number} intensity - 当前强度值
 * @param {number} minIntensity - 强度最小值
 * @param {number} maxIntensity - 强度最大值
 * @param {Object} [options] - 可选配置
 * @param {Array} [options.colorStops=['red', 'yellow', 'green']] - 颜色节点（电磁频谱颜色数组）
 * @param {string} [options.format='hex'] - 输出格式
 * @returns {string} 多色渐变后的颜色值
 */
export function getMultiSpectrumColorByIntensity(intensity:number, minIntensity:number, maxIntensity:number, options:any = {}) {
  let {
    colorStops = ['red', 'yellow', 'green'] as string[],
    format = 'hex'
  } = options;

  // 颜色节点至少2个
  if (colorStops.length < 2) {
    console.warn('颜色节点至少需要2个，已默认使用 ["red", "green"]');
    colorStops = ['red', 'green'];
  }

  // 边界处理
  if (minIntensity >= maxIntensity) {
    [minIntensity, maxIntensity] = [maxIntensity, minIntensity];
  }
  const clampedIntensity = Math.max(minIntensity, Math.min(intensity, maxIntensity));
  const ratio = (clampedIntensity - minIntensity) / (maxIntensity - minIntensity);

  // 计算当前处于哪个颜色区间
  const segmentCount = colorStops.length - 1;
  const segmentRatio = 1 / segmentCount;
  const segmentIndex = Math.min(Math.floor(ratio / segmentRatio), segmentCount - 1);
  const segmentProgress = (ratio - segmentIndex * segmentRatio) / segmentRatio;

  // 定义颜色节点的色相
  const spectrumHue:any = { red: 0, orange: 30, yellow: 60, green: 120, blue: 210, indigo: 240, violet: 270 };
  const startHue = spectrumHue[colorStops[segmentIndex]];
  const endHue = spectrumHue[colorStops[segmentIndex + 1]];

  // 计算当前色相（线性插值）
  let currentHue;
  if (startHue <= endHue) {
    currentHue = startHue + segmentProgress * (endHue - startHue);
  } else {
    currentHue = startHue - segmentProgress * (startHue - endHue);
  }

  // 生成颜色（饱和度70%，亮度60%固定）
  const hslColor = `hsl(${currentHue}, 70%, 60%)`;

  // 转换格式
  switch (format.toLowerCase()) {
    case 'rgb':
      return hslToRgbStr(currentHue, 0.7, 0.6);
    case 'hex':
      const rgb = hslToRgb(currentHue, 0.7, 0.6);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    default:
      return hslColor;
  }
}
/**
 * 辅助函数：将任意格式颜色解析为 RGB 对象
 * @param {string} color - 颜色值（HEX/RGB/HSL）
 * @returns {Object} { r: number, g: number, b: number }
 */
function parseColorToRgb(color: any) {
  // 处理 HEX 格式（支持 #fff、#ffffff）
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    const hex = color.slice(1);
    const len = hex.length;
    return {
      r: parseInt(len === 3 ? hex.slice(0,1).repeat(2) : hex.slice(0,2), 16),
      g: parseInt(len === 3 ? hex.slice(1,2).repeat(2) : hex.slice(2,4), 16),
      b: parseInt(len === 3 ? hex.slice(2,3).repeat(2) : hex.slice(4,6), 16)
    };
  }

  // 处理 RGB 格式（rgb(123,45,67)、rgba(123,45,67,0.5)）
  if (/^rgb(a)?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)?\)$/i.test(color)) {
    const match = color.match(/\d+/g);
    return {
      r: parseInt(match[0]),
      g: parseInt(match[1]),
      b: parseInt(match[2])
    };
  }

  // 处理 HSL 格式（hsl(120,50%,50%)、hsla(120,50%,50%,0.5)）
  if (/^hsl(a)?\((\d+),\s*(\d+)%,\s*(\d+)%(,\s*\d+(\.\d+)?)?\)$/i.test(color)) {
    const match = color.match(/\d+/g);
    const h = parseInt(match[0]);
    const s = parseInt(match[1]) / 100;
    const l = parseInt(match[2]) / 100;
    return hslToRgb(h, s, l);
  }

  // 默认返回白色（解析失败时）
  console.warn(`不支持的颜色格式：${color}，已返回白色 #ffffff`);
  return { r: 255, g: 255, b: 255 };
}

/**
 * 辅助函数：RGB 转 HEX
 * @param {number} r - 红色通道（0-255）
 * @param {number} g - 绿色通道（0-255）
 * @param {number} b - 蓝色通道（0-255）
 * @returns {string} HEX 颜色值
 */
function rgbToHex(r: number, g: number, b: number) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * 辅助函数：RGB 转 HSL
 * @param {number} r - 红色通道（0-255）
 * @param {number} g - 绿色通道（0-255）
 * @param {number} b - 蓝色通道（0-255）
 * @returns {string} HSL 颜色值
 */
function rgbToHsl(r:number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h:any, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 灰度
  } else {
    const diff = max - min;
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
      case g: h = (b - r) / diff + 2; break;
      case b: h = (r - g) / diff + 4; break;
    }
    h *= 60;
  }

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * 辅助函数：HSL 转 RGB
 * @param {number} h - 色相（0-360）
 * @param {number} s - 饱和度（0-1）
 * @param {number} l - 亮度（0-1）
 * @returns {Object} { r: number, g: number, b: number }
 */
function hslToRgb(h:number, s:number, l:number) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // 灰度
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    h /= 360;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// ---------------------- 辅助函数 ----------------------


/**
 * HSL 转 RGB 字符串
 * @returns {string} rgb(xxx, xxx, xxx)
 */
function hslToRgbStr(h:number, s: number, l:number) {
  const rgb = hslToRgb(h, s, l);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

