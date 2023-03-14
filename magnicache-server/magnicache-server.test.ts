// import Magnicache from './magnicache-server';

const MagniCache = require('./magnicache-server.js');
const schema = require('./schema');
// describe('MagniCache set up', () => {
//   it('Should return an "invalid schema" error when invoked with an invalid schema', () => {
//     // expect(new MagniCache('invalid~schema')).toThrow(Error);

//     // const testThrowingError = () => {
//     //   new MagniCache('invalid~schema');
//     // };

//     // expect(() => testThrowingError()).toThrowError();
//   });
//   // it('Should return an Magnicache object when invoked with an invalid schema', () => {
//   //   expect(new MagniCache('invalid~schema')).toBeInstanceOf(MagniCache);
//   // });
// });

describe('MagniCache execution', () => {
  let magnicache: any;
  beforeEach((done) => {
    magnicache = new MagniCache(schema);
    done();
  });

  it('Should return a new magnicache object of type magnicache-server when invoked with a valid schema', () => {
    expect(typeof magnicache).toBe(MagniCache);
  });

  // it('Should have a query function on its prototyep', () => {
  //   expect(typeof magnicache.query).toBe('function');
  // });
  // it('the query function should be a middle ware, taking in req, res, next returning next ', () => {
  //   expect(typeof magnicache.query).toBe('function');
  // });
});
