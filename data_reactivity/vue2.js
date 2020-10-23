let effective = null;

const effect = fn => {
  effective = fn
}

// 数组响应式通过重写Array的原型方法来实现
const oldArrayProtoType = Array.prototype
// 创建一个新的原型对象，克隆自 Array 的原型对象
const proto = Object.create(oldArrayProtoType);
// 需要重写的 Array 原型方法
const arrayProtoMethod = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
arrayProtoMethod.forEach(method => {
  // 函数劫持
  proto[method] = function () {
    effective();
    oldArrayProtoType[method].call(this, ...arguments)
  }
})


const reactive = data => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // 数组通过数据劫持实现响应式
  if (Array.isArray(data)) {
    data.__proto__ = proto
  }

  // 遍历对象属性，做响应式处理
  Object.keys(data).forEach(key => {
    let value = data[key];
    // 递归调用，解决深层嵌套对象的响应问题
    reactive(value);

    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: true,
      get: () => {
        return value
      },
      set: newValue => {
        if (newValue !== value) {
          effective()
          value = newValue
        }
      }
    })
  })
  return data
}

module.exports = { effect, reactive }