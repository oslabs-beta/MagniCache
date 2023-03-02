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

const queryResponses = [
  {data: {messageById: [{ message:
            "\n\nHey there everyone! I've been having such a great time getting to know all of you",},],
    },
  },
  { data: { messageById: [{ sender_id: 1 }] } },
];
