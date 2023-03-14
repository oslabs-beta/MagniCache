const MagniCache = require('../magnicache-server/magnicache-server.ts');
const schema = require('../magnicache-server/schema.js');
import { NextFunction, Request, Response } from 'express';

let data;

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

describe('MagniCache Setup', () => {
  let magnicache: any;
  beforeEach((done) => {
    magnicache = new MagniCache(schema);
    done();
  });

  it('Should return a new magnicache object of type magnicache-server when invoked with a valid schema', () => {
    expect(magnicache).toBeInstanceOf(MagniCache);
  });

  it('Should have a query function on its prototype', () => {
    expect(typeof magnicache.query).toBe('function');
  });

  it('Should have a schemaParser function on its prototype', () => {
    expect(typeof magnicache.schemaParser).toBe('function');
  });
});

describe('Magnicache.query execution', () => {
  let magnicache: any;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction = jest.fn();

  beforeEach((done) => {
    magnicache = new MagniCache(schema);
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      cookie: jest.fn(),
      locals: {},
    };
    done();
  });

  xit('responds when missing query property', async () => {
    const expectedRes = {
      queryResponse: 'missing query body',
    };

    mockReq = {
      body: { query: '{customers{name}}' },
    };

    await magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    expect(mockRes.locals!.queryResponse).toBe(expectedRes.queryResponse);
  });

  xit('responds with a message when query body is empty', () => {});

  it('returns the right data when the query is one field ', async () => {
    const data = {};
    const expectedRes = {
      locals: { queryResponse: '{<returned db data via graphql>}' },
    };

    const mockReq = {
      body: { query: 'query{customers{name}}' },
    };

    await magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    console.log(mockRes);
    expect(mockRes.locals!.queryResponse).toEqual(
      expectedRes.locals.queryResponse
    );
  });
});

describe('MagniParser', () => {
  let magnicache: any;
  beforeEach(() => {
    magnicache = new MagniCache(schema);
  });

  it('should parse a simple query without arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'allMessages',
        },
        arguments: [],
      },
    ];

    const result = magnicache.magniParser(selections);
    expect(result).toEqual(['{allMessages}']);
  });

  it('should parse a simple query with arguments', () => {
    const selections = [
      {
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'messageById',
        },
        arguments: [
          {
            kind: 'Argument',
            name: {
              kind: 'Name',
              value: 'id',
            },
            value: {
              kind: 'IntValue',
              value: '4',
            },
          },
        ],
      },
    ];

    const result = magnicache.magniParser(selections);
    expect(result).toEqual(['{messageById(id:4)}']);
  });
});
