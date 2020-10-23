# 前端手写方法系列之模板引擎


## 模板引擎
模板引擎（这里特指用于Web开发的模板引擎）是为了使用户界面与业务数据（内容）分离而产生的，它可以生成特定格式的文档，用于网站的模板引擎就会生成一个标准的HTML文档。就是将模板文件和数据通过 模板引擎 的解析生成一个HTML代码。
## {{}} 表达式
比如我们有这样的模板：
```js
<div>{{ name }}</div>
```
我们要将其解析为标准的 HTML 代码:

```js
<div>jack</div>
```

又比如对字符进行大小写转换的一个模板:
```js
<div>{{ name.toUpperCase() }}</div>
```
转换为标准的HTML代码:

```js
<div>JACK</div>
```
## forEach 循环

模板：
```js
{%arr.forEach(item => {%}
    <li>{{item}}</li>
{%})%}
```

经过模板引擎解析后生成的结果：
```js
<li>aaa</li>
<li>bbb</li>
<li>ccc</li>
```

## if判断
模板文件：
```js
{% if(isShow) { %} <div>{{ name }}</div> {% } %}
```

经过模板引擎解析后的结果：
```js
<div>jack</div>
```
## 实现思路
模板引擎的解析我们分为两个步骤：

1. 利用正则表达式和 Function 构造函数将模板编译为一个 Generate 函数
2. 执行 Generate 函数，输出编译结果

## 具体实现
### 第一步 {{ xxx }}表达式 转换
利用正则表达式将 {{ xxx }} 表达式转换成 ES6 模板字符串 `${xxx}`
```js
// [^}] 匹配除了 } 以外的所有字符
template = template.replace(/\{\{([^}]+)\}\}/g, function () {
  // arguments 对象  replace 回调函数的 参数
  let key = arguments[1].trim();
  return "${" + key + "}"   // 将模板字符串 <b>{{ name }}</b> 转换成 <b>${name}</b>
})
```

上面的代码，将输入的模板<div>{{ name }}</div>转换成了<div>${name}</div>的形式

### 第二步 {% %}表达式 转换

同样是利用正则将 {% %} 表达式转换成 js 语句：
```js
  // [^%] 匹配除了 % 以外的任意字符
  template = template.replace(/\{\%([^%]+)\%\}/g, function () {
    return "`\r\n" + arguments[1] + "\r\nstr+=`\r\n"
  })
```
例如我们输入的模板是：

```js
{% if(isShow) { %} <div>{{ name }}</div> {% } %}
```

则经过上面代码解析后输出的结果是:
```js
`
 if(isShow) { 
    str+=`
 <div>${name}</div>`
 } 
str+=`
```

### 第三步 创建 Generate 函数

利用 Function 构造函数创建一个 Generate 函数
```js
new Function('obj', body)
```

其中 obj 为传递给 Generate 函数的参数，body 为 Generate 函数的函数体。
我们仍然以模板 {% if(isShow) { %} <div>{{ name }}</div> {% } %} 为例：

```js
// head 为函数的函数体
let head = `let str = '';\r\n with(obj){\r\n`;
head += "str+=`";
// 模板解析
template = template.replace(/\{\%([^%]+)\%\}/g, function () {
  return "`\r\n" + arguments[1] + "\r\nstr+=`\r\n";
});
let tail = "`}\r\n return str;";
const body = head + template + tail
```

使用 new Function('obj', body) 后生成的函数如下：

```js
function anonymous(obj) {
  let str = '';
   with(obj) {
  str+=``
   if(isShow) {
  str+=`
   <b>${name}</b> `
   }
  str+=`
  `}
   return str;
  }
```
### 第四步 执行 Generate 函数

```js
const ret = generate({name : 'tom'})
// 输出结果: <div>jack</div>
```

## 完整代码实现
```js
module.exports.compile = (template) => {
  // [^}] 匹配除了 } 以外的所有字符
  template = template.replace(/\{\{([^}]+)\}\}/g, function () {
    // arguments 对象   replace 回调函数的 参数
    let key = arguments[1].trim();
    return "${" + key + "}"   // 将模板字符串 <div>{{ name }}</div>  转换成 <div>${name}</div>
  })
    // head 为函数体
  let head = `let str = '';\r\n with(obj) {\r\n`
  head += "str+=`";
  // [^%] 匹配除了 % 以外的任意字符
  template = template.replace(/\{\%([^%]+)\%\}/g, function () {
    return "`\r\n" + arguments[1] + "\r\nstr+=`\r\n"
  })
  let tail = "`}\r\n return str;"
  // 利用 Function 构造函数创建一个新的函数
  return new Function('obj', head + template + tail)
}
```
## 测试用例
```js
const { compile } = require("../index");
describe("模板编译", () => {
  it("{{}} 表达式", () => {
    const output = compile("<div>{{ name }}</div>")({ name: "jack" });
    expect(output).toBe(`<div>jack</div>`);
  });
  it("{{}} toUpperCase 表达式", () => {
    const output = compile("<div>{{ name.toUpperCase() }}</div>")({ name: "jack" });
    expect(output).toBe(`<div>JACK</div>`);
  });
  it("{{}} +连接", () => {
    const output = compile("<div>{{ '[' + name + ']' }}</div>")({ name: "jack" });
    expect(output).toBe(`<div>[jack]</div>`);
  });
  it("forEach 遍历", () => {
    const output = compile(
      `{%arr.forEach(item => {%}
    <li>{{item}}</li>
{%})%}`
    )
      ({
        arr: ["aaa", "bbb"],
      });
    expect(output).toBe(
      `
    <li>aaa</li>
    <li>bbb</li>
`);
  });
  it("if 表达式", () => {
    const output = compile(`{% if(isShow) { %} <div>{{ name }}</div> {% } %}`
    )({ isShow: true, name: "jack" });
    expect(output).toBe(
      `
 <div>jack</div>
`);
  });
});
```
## 测试结果
运行 jest template --watchAll 命令，结果如下
![](assets/template.png)
参考文章
https://juejin.im/post/6884138429181870093
