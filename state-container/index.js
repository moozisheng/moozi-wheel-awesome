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


