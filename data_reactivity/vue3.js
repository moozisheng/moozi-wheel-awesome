
let effective = null;

const effect = fn => {
  effective = fn
}

const reactive = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const observed = new Proxy(data, {
    // 获取属性值
    get(target, key, receiver) {
      let result = Reflect.get(target, key, receiver)
      return typeof result !== 'object' ? result : reactive(result)
    },
    // 设置属性值
    set(target, key, value, receiver) {
      effective();
      const result = Reflect.set(target, key, value, receiver);
      return result
    },
    // 删除属性
    deleteProperty(target, key) {
      effective();
      const result = Reflect.deleteProperty(target, key)
      return result
    }
  })

  return observed

}

module.exports = { effect, reactive }