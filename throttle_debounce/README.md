# 前端手写方法系列之防抖与节流


## 函数防抖与函数节流

防抖与节流：优化高频率执行js代码的一种手段，js中的一些事件如浏览器的resize、scroll，鼠标的mousemove、mouseover，input输入框的keypress等事件在触发时，会不断地调用绑定在事件上的回调函数，极大地浪费资源，降低前端性能。为了优化体验，需要对这类事件进行调用次数的限制。

## 函数防抖

> 某个函数在一段时间内，无论触发多少次回调，都执行最后一次

例如用户拖拽改变窗口大小，触发了resize 事件，会导致页面重新布局，在不断触发 resize 事件的过程中，只有最后一次调用 resize 事件才是有意义的。

### 实现原理

利用定时器，函数第一次执行时设定一个定时器，新调用发生时发现已经设定过定时器就清空之前的定时器，并重新设定一个新的定时器，如果存在没有被清空的定时器，当定时器计时结束后触发函数执行。

```js
/**
 * 防抖 Debounce
 * fn 需要做防抖处理的函数
 * wait 时间间隔
*/
module.exports.debounce = (fn, wait) => {
  // 通过闭包缓存一个定时器 id
    let timer = null;
  
  return (...args) => {
    // 如果已经设定过定时器，就清空上一次的定时器
    if (timer) clearTimeout(timer);
    
    // 重新设定定时器，定时器计时结束后执行传入的函数 fn
    timer = setTimeout(() => {
        fn.apply(this, args)
    }, wait)
  }
}
```

### 测试用例

```js
it("防抖Debounce", (done) => {
  const { debounce } = require("../index");
  const mockFn = jest.fn();
  // 封装一个防抖函数
  const fn = debounce(mockFn, 10);
  // 连续两次调用
  fn(1);
  fn(2);
  setTimeout(() => {
    const calls = mockFn.mock.calls;
    // 断言只调用一次
    expect(calls.length).toBe(1);
    // 断言以最后一次调用为准
    expect(calls[0][0]).toBe(2);
    done();
  }, 50);
});
```

## 函数节流

> 在一段时间内，无论触发多少次回调，都只执行一次回调函数

函数节流适用于函数被频繁调用的场景，如 window.resize() 事件、mouseMove 事件等。

### 实现原理

利用时间戳来判断是否已到执行时间，每次调用判断和上一次调用的时间差异确定是否调用，如果时间间隔已经达到时间差，则执行，并更新上次执行的时间戳。throttle实际是一个工厂函数，可以将一个函数封装为一个带有节流功能的函数。

```js
/**
 * throttle 函数节流
 * fn 需要执行的函数
 * 时间间隔
*/
module.exports.throttle = (fn, wait) => {
  // 定义上一次执行函数的时间
    let previous = 0
  // 将 throttle 处理结果当做函数返回
  return (...args) => {
    // 获取当前时间戳
    const now = + Date.now();
    // 时间差大于 时间间隔 wait，则将 previous 设为当前时间，并执行 fn
    if (now - previous > wait) {
      previous = now;
      fn.apply(this, args)
    }
  }
}
```

### 测试用例
```js
it("节流Throttle", (done) => {
  const { throttle } = require("../index");
  // 定义一个Mock函数
  const mockFn = jest.fn();
  // 封装为节流方法
  const fn = throttle(mockFn, 10);
  // 同步调用两次
  fn(1);
  fn(2);
  setTimeout(() => {
    const calls = mockFn.mock.calls;
    // 断言 mock方法只调用一次
    expect(calls.length).toBe(1);
    // 根据参数判断以第一次调用为准
    expect(calls[0][0]).toBe(1);
    done();
  }, 50);
});
```

## 测试结果

执行 jest throttle_debounce --watchAll 命令，其测试结果如下：
![throttle-debounce](https://cdn.nlark.com/yuque/0/2020/png/427411/1603188181827-80918b79-6664-40d2-b0fc-7fe391e02d97.png?x-oss-process=image%2Fresize%2Cw_348)

## 总结

- 函数防抖和函数节流都是防止某一时间频繁触发，但是这两兄弟之间的原理却不一样。
- 函数防抖是某一段时间内只执行一次，而函数节流是间隔时间执行。

### 应用场景

- debounce
    - search搜索联想，用户在不断输入值时，用防抖来节约请求资源。
    - window触发resize的时候，不断的调整浏览器窗口大小会不断的触发这个事件，用防抖来让其只触发一次
- throttle
    - 鼠标不断点击触发，mousedown(单位时间内只触发一次)
    - 监听滚动事件，比如是否滑到底部自动加载更多，用throttle来判断

参考文章：<br/>
https://juejin.im/post/6885250789825052679<br/>
https://juejin.im/post/6844903669389885453