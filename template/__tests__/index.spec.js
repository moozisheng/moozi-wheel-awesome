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
