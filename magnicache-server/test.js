const obj = {
  name: 'John',
  sayName: () => {
    console.log(this.name);
    return this.name;
  },
  invoke: function () {
    console.log(this);
    console.log(this.sayName).sayName();
  },
};

console.log(obj.invoke()); // undefined
