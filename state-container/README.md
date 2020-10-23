# 前端手写方法系列之统一状态管理



## 状态管理

不管是Vue，还是 React，都需要管理状态（state），比如组件之间都有共享状态的需要。什么是共享状态？比如一个组件需要使用另一个组件的状态，或者一个组件需要改变另一个组件的状态，都是共享状态。

> 状态管理，就是把组件之间需要共享的状态抽取出来，遵循特定的约定，统一来管理，让状态的变化可以预测

要实现状态统一管理，需要满足以下几点要求：
- 单一数据源 : 就是状态数据统一放在一起
- 数据修改使用纯函数 : 修改数据的方法也要统一管理，这样容易回退，记录复现、时间旅行
- 状态通知 : 状态修改可以得到通知

## 功能实现
我们实现一个 createStore 函数，用于状态统一管理，在函数里实现以下的功能：
1. 状态的更改通过 dispatch 来触发
2. 状态变更后可以触发变更通知

```js
module.exports.createStore = (reducer, preloadedState) => {
  // reducer 函数
  let currentReducer = reducer;
  // 默认 state
  let currentState = preloadedState;
  let effective = null;
  return {
    getState() {
      return currentState
    },
    dispatch(action) {
      currentState = currentReducer(currentState, action);
      // 触发通知
      effective()
    },
    effect(fn) {
      effective = fn
    }
  }
}
```

## 测试用例

```js
describe("统一状态管理", () => {
  const reducer = (state = { num: 100 }, action) => {
    switch (action.type) {
      case "clear":
        return { num: 0 };
      case "add":
        return { num: state.num + action.payload };
      default:
        return state;
    }
  };
  it("基本功能 订阅通知 改变状态", () => {
    const { createStore } = require("../index");
    const mockFn = jest.fn();
    const store = createStore(reducer);
    // 建立响应订阅
    store.effect(mockFn);
    store.dispatch({
      type: "clear",
    });
    // store.dispatch({ type: "add", payload: 1 });
    const calls = mockFn.mock.calls;
    // 断言 mock方法只调用一次
    expect(calls.length).toBe(1);
    expect(store.getState().num).toBe(0);
  });
  it("改变状态 带载荷Payload", () => {
    const { createStore } = require("../index");
    const mockFn = jest.fn();
    const store = createStore(reducer);
    // 建立响应订阅
    store.effect(mockFn);
    store.dispatch({ type: "add", payload: 1 });
    const calls = mockFn.mock.calls;
    // 断言 mock方法只调用一次
    expect(calls.length).toBe(1);
    expect(store.getState().num).toBe(101);
  });
  it("多Action", () => {
    const { createStore } = require("../index");
    const mockFn = jest.fn();
    const store = createStore(reducer);
    // 建立响应订阅
    store.effect(mockFn);
    store.dispatch({ type: "clear" });
    store.dispatch({ type: "add", payload: 1 });
    const calls = mockFn.mock.calls;
    // 断言 mock方法只调用两次
    expect(calls.length).toBe(2);
    expect(store.getState().num).toBe(1);
  });
});
```
## 测试结果
执行  jest state-container --watchAll 命令，结果如下：

![](/assets/state-container.png)

> 参考文档：https://juejin.im/post/6886002492577234952