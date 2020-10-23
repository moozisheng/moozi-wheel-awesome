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