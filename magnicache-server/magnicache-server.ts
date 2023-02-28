const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');
const { parse } = require('graphql/language/parser');
import { Response, Request, NextFunction } from 'express';

import * as mergeWith from 'lodash/mergeWith';

// Cache Class, for removing the LRU item in the cachce

// Magnicache class for creating a queryable cache
function Magnicache(this: any, schema: any, maxSize: number = 100): void {
  // save the provided schema
  this.schema = schema;

  // create a map for caching query responses

  // bind the query method for use in other functions
  this.query = this.query.bind(this);
  
  this.cache = new Cache(maxSize)
}
// Class constructors for the linked list and the nodes for the list
class EvictionNode<T> {
  key: string;
  value: any;
  next: EvictionNode<any> | null;
  prev: EvictionNode<any> | null;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

class Cache<T> {
  maxSize: number;
  map: Map<string, any>;
  head: EvictionNode<any> | null;
  tail: EvictionNode<any> | null;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.map = new Map();
    this.head = null;
    this.tail = null;
    // Function binding
    this.create = this.create.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
    this.get = this.get.bind(this);
    this.includes = this.includes.bind(this);
  }

  // Insert a node at the head of the list/evict least recently used node
  create(key: string, value: object): EvictionNode<string> {
    // Create a new instance of eviction cache. Max size can be determined later..........
    // const cache = new Cache<string>(size);
    // Create a new node to add
    const newNode = new EvictionNode<any>(key, value);
    // IF there is no head of the linked list create one, same with the tai;
    this.map.set(key, newNode);

    if (!this.head) {
      this.head = newNode;
      if (!this.tail) this.tail = newNode;
    }
    // else we want to add a next node to our newNode, which should be the head of the Cache
    else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    // Check if the size of our eviction cache's cache is greater than the largest value. If so, delete the tail
    if (this.map.size > this.maxSize) this.deleteNode(this.tail);
    return newNode;
  }

  // Update the node when it is used and add it to the queue to be further from eviction(possibly not needed)
  deleteNode(node): void {
    if (node === null) throw new Error('node is null');
    
    if (node.next === null) {
      node.prev.next = null;
      this.tail = node.prev;
    } else if (node.prev === null) {
      node.next.prev = null;
      this.head = node.next;
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    this.map.delete(node.key);
  }

  // Get a specific node from the linked list(to return from the cache)
  get(key: string): EvictionNode<T> {
    // if (this.head === null) return null;
    const node = this.map.get(key);

    node.prev.next = node.next;
    node.next.prev = node.prev;

    this.head.prev = node;
    node.prev = null;
    node.next = this.head;
    this.head = node;

    return node;
  }
  includes(key: string) {
    return this.map.has(key);
  }
}
// Query method takes request, response and next callbacks
// as its arguments
Magnicache.prototype.query = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // get the body of the requested query
  const { query } = req.body;

  // parse the query into an AST
  const {
    definitions: [ast],
  } = parse(query);

  // check if the operation is a query
  // and not some other type of mutation
  if (ast.operation === 'query') {
    if (ast.selectionSet.selections[0].name.value === '__schema') {
      // execute the graphl query against the schema
      graphql({ schema: this.schema, source: query })
        .then((result: {}) => {
          // assign the result to the response locals
          res.locals.queryResponse = result;

          // proceed to execute the next callback
          return next();
        })
        .catch((err: {}) => {
          console.log(err);

          // throw an error to the next callback
          return next({
            log: err,
          });
        });
    } else {
      // get the selection set
      const queries: string[] = this.magniParser(ast.selectionSet.selections);

      // store the query results
      const queryResponses: {}[] = [];

      // compile all individual query responses
      const compileQueries = () => {
        let response1: {} = {};

        for (const queryResponse of queryResponses) {
          response1 = mergeWith(response1, queryResponse);
        }

        // assign the combined result to the response locals
        res.locals.queryResponse = response1;

        console.log(this.cache);

        // proceed to execute the next callback
        return next();
      };

      // loop through the individual queries and execute them in turn
      for (const query of queries) {
        // check if query is already cached
        if (this.cache.includes(query)) {
          // output message indicating that the query is cached
          console.log('cache hit');
          res.cookie('cachestatus', 'hit');
          console.log('cachestatus set hit on res');

          // store the cached response
          queryResponses.push(this.cache.get(query));

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            // if yes, compile all queries
            compileQueries();
          }
        } else {
          res.cookie('cachestatus', 'miss');
          console.log('cachestatsus set miss on Res');
          // output message indicating that the query is missing
          console.log('cache miss');

          // execute the query against graphql
          graphql({ schema: this.schema, source: query })
            .then((result: {}) => {
              // cache the newest response
              this.cache.create(query, result);
              // this.cache.set(Cache.prototype.createHead())

              // store the query response
              queryResponses.push(result);

              // check if all queries have been fetched
              if (queries.length === queryResponses.length) {
                // if yes, compile all queries
                compileQueries();
              }
            })
            .catch((err: {}) => {
              console.log(err);

              // throw an error to the next callback
              return next({
                log: err,
              });
            });
        }
      }
    }
    // not a query!!
  } else if (ast.operation === 'mutation') {
    console.log('this is a mutation');
    // Logic for mutation goes here
    this.cache = new Cache(this.maxSize);
    console.log(this.cache);
    graphql({ schema: this.schema, source: query })
      .then((result: {}) => {
        res.locals.queryResponse = result;
        return next();
      })
      .catch((err) => {
        console.log(err);
        return next({
          log: err,
        });
      });
  }
};

// Function that takes an array of selections and generates an array of strings based off of them
Magnicache.prototype.magniParser = function (
  selections: {
    kind: string;
    name: {
      kind: string;
      value: string;
    };
    arguments: {
      kind: string;
      name: {
        kind: string;
        value: string;
      };
      value: {
        kind: string;
        value: string;
      };
    }[];
    selectionSet?: {
      kind: string;
      selections: typeof selections;
    };
  }[],
  queryArray: (string | string[])[] = [],
  queries: string[] = []
): string[] {
  //Logging that the parser is running
  console.log('parsing');

  // Looping through the selections to build the queries array
  for (const selection of selections) {
    queryArray.push(selection.name.value);
    if (selection.arguments?.length > 0) {
      const argumentArray: string[] = [];

      // looping through the arguments to add them to the argument array
      for (const argument of selection.arguments) {
        argumentArray.push(`${argument.name.value}:${argument.value.value}`);
      }
      //['id:4','name:john']
      queryArray.push([argumentArray.join(',')]);
    }
    // Checking for a selection set in the selection
    if (selection.selectionSet) {
      this.magniParser(selection.selectionSet.selections, queryArray, queries);
    } else {
      let string = ``;
      //{allMessages(id:4){message}}
      // Ex:  ['messageById', ['id:4'], ['name:yousuf'], 'message']
      // would give {messageById(id:4,name:yousuf){message}}
      // Looping through the query array to build the string
      for (let i = queryArray.length - 1; i >= 0; i--) {
        if (Array.isArray(queryArray[i])) {
          string = `(${queryArray[i][0]})${string}`;
        } else {
          string = `{${queryArray[i] + string}}`;
        }
      }
      // Adding the final string to the queries array
      queries.push(string);
    }
    // Removing the element from the query array
    queryArray.pop();
  }
  // Returning the queries array with all strings
  return queries;
};



module.exports = Magnicache;
