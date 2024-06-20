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
