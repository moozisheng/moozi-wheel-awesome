
module.exports.compile = (template) => {
  // [^}] 匹配除了 } 以外的所有字符
  template = template.replace(/\{\{([^}]+)\}\}/g, function () {
    // arguments 对象   replace 回调函数的 参数
    // [Arguments] {
    //   '0': '{{ name }}',
    //   '1': ' name ',
    //   '2': 3,
    //   '3': '<div>{{ name }}</div>'
    // }
    let key = arguments[1].trim();
    return "${" + key + "}"   // 将模板字符串 <div>{{ name }}</div>  转换成 <div>${name}</div>
  })

  let head = `let str = '';\r\n with(obj) {\r\n`
  head += "str+=`";

  // [^%] 匹配除了 % 以外的任意字符
  template = template.replace(/\{\%([^%]+)\%\}/g, function () {
    return "`\r\n" + arguments[1] + "\r\nstr+=`\r\n"
  })

  let tail = "`}\r\n return str;"

  return new Function('obj', head + template + tail)

}
