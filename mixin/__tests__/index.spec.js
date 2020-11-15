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