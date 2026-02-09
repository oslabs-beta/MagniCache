const MagniCache = require('../magnicache-server/magnicache-server.ts');
const schema = require('../magnicache-server/schema.js');
import { NextFunction, Request, Response } from 'express';
const { IntrospectionQuery } = require('./IntrospectionQuery');
const { graphql } = require('graphql');

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

  it('responds when missing query property', async () => {
    const expectedRes = {
      queryResponse: 'Invalid query',
    };

    mockReq = {
      body: {},
    };

    await magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    expect(mockRes.locals!.queryResponse).toBe(expectedRes.queryResponse);
  });

  it('responds with a message when query value is empty', () => {
    const expectedRes = {
      queryResponse: 'Invalid query',
    };

    mockReq = {
      body: { query: '' },
    };

    magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    expect(mockRes.locals!.queryResponse).toBe(expectedRes.queryResponse);
  });

  it('responds with a schema when query value is the Introspection query', async () => {
    const expectedRes = {
      queryResponse: { data: { __schema: {} } },
    };

    mockReq = {
      body: { query: IntrospectionQuery },
    };

    await magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    expect(mockRes.locals!.queryResponse.data).toHaveProperty('__schema');
  });

  it('returns the right data when the query is one field ', async () => {
    // let data = await graphql(schema, 'query{customers{name}}');

    const expectedRes = {
      locals: { queryResponse: 'data' },
    };

    const mockReq: Partial<Request> = {
      body: { query: 'query{customers{name}}' },
    };

    const mockRes: any = {
      json: jest.fn(),
      cookie: jest.fn(),
      locals: { queryResponse: '' },
    };

    await magnicache.query(mockReq as Request, mockRes as Response, nextFn);
    expect(mockRes.locals.queryResponse).toEqual(
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
