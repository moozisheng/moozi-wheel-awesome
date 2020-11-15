
# 前端手写方法系列之Mixin 混入
## Mixin 是什么
Mixin 又叫做混入，即可以将任意一个对象的全部或部分属性拷贝到另一个对象上。Mixin 其实就是对多重继承的实现。
<br />

> <strong>多重继承 </strong><br/>
>在面向对象编程语言中，多重继承是指一个类可以同时继承多个父类的行为和特征功能。通过多重继承，一个子类就可以同时获得多个父类的所有功能。

<br />
在其他的一些面向对象编程语言中，提供了对 Mixin 的实现。如 Java 选择了规则继承，也就是使用 interface 实现多重继承。Ruby 选择了实现继承，也就是使用 module 来实现多重继承。
<br />

> 规则继承：指的是一堆方法名的集合<br/>
> 实现继承：除了方法名还允许有方法的实现

<br/>
在 JavaScript 语言中，我们只能继承单个对象，每个对象只能有一个 [[Prototype]]，并且每个类只可以扩展另外一个类。并不能通过继承多个父类获得多个父类的功能。
## JavaScript中Mixin的实现
在 JavaScript 中，所有的对象都有原型，原型可以继承其它对象的原型从而得到更多的属性。因此我们可以通过 JavaScript 特有的原型链属性，将功能引用复制到原型链上，从而实现 Mixin 的功能。
<br />
<br >
```javascript
module.exports = (receivingClass, givingClass) => {
  if (receivingClass && givingClass) {
    for (let key in givingClass) {
      if (receivingClass.prototype.hasOwnProperty(key)) {
        throw new Error(`"Don't allow override  existed prototype method. The method is: ${key}"`)
      }
      receivingClass.prototype[key] = givingClass[key]
    }
  }
}
```

## 测试用例
```javascript
test("Mixin 实现", () => {
  const mixin = require("../index");
  const receivingClass = class {};
  const fn = jest.fn();
  // 小吸血刀
  const givingClass = {
    fn,
  };
  mixin(receivingClass, givingClass);
  const obj = new receivingClass()
  obj.fn("haha");
  const calls = fn.mock.calls;
  expect(calls.length).toBe(1);
  expect(calls[0][0]).toBe("haha");
});
```
## 测试结果
执行 ``jest mixin --watchAll`` 命令，结果如下：<br/>
![mixin](/assets/mixin.png "Mixin 混入")