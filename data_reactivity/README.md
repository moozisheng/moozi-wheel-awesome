# 前端手写方法系列之数据响应式

## 前言
Vue的数据响应式，其原理是利⽤了JS语⾔特性`Object.defineProperty()`，通过重新定义对象属性的`getter/setter` 方法来监听数据的变化，从⽽将数据的变化转换为UI的变化。
<br/>
Vue 中的数据响应分为两种，一种是 Object 类型的数据响应，另一种是 Array 类型的数据响应。Object 类型的数据响应是通过 Object.defineProperty 来重新定义 getter/setter 方法来实现的。而 Array 类型是数据响应则是通过重写数组的原型方法来实现。

## Object 类型数据响应式
在 Vue2 中，通过 Object.defineProperty 重新定义对象的 getter/setter 方法来实现 Object 类型的数据响应式
```js
let effective = null;
const effect = fn => {
  effective = fn
}
const reactive = data => {
  if (typeof data !== 'object' || data === null) {
    return data;
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
```

## Array 类型数据响应式

在 Vue2 中，Array 类型的数据通过重写 Array 的原型方法 ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'] 来实现数据响应式

```js
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
```

## Proxy 实现数据响应式

在 Vue3 中，使用 ES6 的 Proxy 和 Reflect 来实现数据响应化，能更好的解决Vue2数据响应化过程的问题。Proxy 既可以监听整个Object对象，包括深层嵌套的对象，也可以监听数组。

Proxy可以更好的拦截对象行为，Reflect可以更优雅的操纵对象。 优势在于：

- 针对整个对象定制而不是对象的某个属性，所以也就不需要对keys进行遍历。
- 支持数组，这个DefineProperty不具备。这样就省去了重载数组方法这样的Hack过程。
- Proxy 的第二个参数可以有 13 种拦截方法，这比起 Object.defineProperty() 要更加丰富
- Proxy 作为新标准受到浏览器厂商的重点关注和性能优化，相比之下 Object.defineProperty() 是一个已有的老方法
- 可以通过递归方便的进行对象嵌套。

```js
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
```

## 测试用例

我们使用 Jest 测试框架来编写测试用例。在这里，我们假定数据 data 发生变化时会触发 fn 函数，也就是数据data 作出了响应。我们这里使用 jest 来Mock 一个函数来检测数据是否发生了响应。expect(fn).toBeCalled()有效则代表测试通过也就是作出了响应。

### Object 类型数据响应
```js
it('测试数据改变时 是否被响应', () => {
  const data = reactive({
    name: 'abc',
    age: {
      n: 5
    }
  })
  // Mock一个响应函数
  const fn = jest.fn()
  const result = fn()
  // 设置响应函数
  effect(fn)
  // 改变数据
  data.name = 'efg'
  // 确认fn生效
  expect(fn).toBeCalled()
})
```
### 深层嵌套对象数据响应

```js
it('测试多层数据中改变时 是否被响应', () => {
  const data = reactive({
    age: {
      n: 5
    }
  })
  // Mock一个响应函数
  const fn = jest.fn()
  // 设置响应函数
  effect(fn)
  // 改变多层数据
  data.age.n = 1
  // 确认fn生效
  expect(fn).toBeCalled()
})
Array 类型数据响应
it('测试数组中数据改变时 是否被响应', () => {
  const data = reactive({
    ary: [
      'a'
    ]
  })
  // Mock一个响应函数
  const fn = jest.fn()
  // 设置响应函数
  effect(fn)
  // 改变多层数据
  data.ary.push('b')
  // 确认fn生效
  expect(fn).toBeCalled()
})
```
### 测试结果
执行 jest data_reactivity --watchAll 命令，结果如下：
![reactivity](/assets/reactivity.png "数据响应式")

参考文档：<br/>
https://juejin.im/post/6885546581438201869