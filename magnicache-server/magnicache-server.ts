const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');
const { parse } = require('graphql/language/parser');
import { Response, Request, NextFunction } from 'express';

import * as mergeWith from 'lodash/mergeWith';

// EvictionCache Class, for removing the LRU item in the cachce

// Magnicache class for creating a queryable cache
function Magnicache(this: any, schema: any): void {
  // save the provided schema
  this.schema = schema;

  // create a map for caching query responses
  this.cache = new Map();

  // bind the query method for use in other functions
  this.query = this.query.bind(this);
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

class EvictionCache<T> {
  maxSize: number;
  cache: Map<string, any>;
  head: EvictionNode<any> | null;
  tail: EvictionNode<any> | null;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
    this.createNode = this.createNode.bind(this);
    this.evictEnd = this.evictEnd.bind(this);
    this.updateEvictionNode = this.updateEvictionNode.bind(this);
    this.setNode = this.setNode.bind(this);
    this.deleteNode = this.deleteNode.bind(this);
  }

  // Insert a node at the head of the list/evict least recently used node 
  createNode(key: string, value: object): EvictionNode<string> {
    // Create a new instance of eviction cache. Max size can be determined later..........
    const evictionCache = new EvictionCache<string>(20);
    // Create a new node to add
    const newNode = new EvictionNode<any > (key, value);
    // IF there is no head of the linked list create one, same with the tai;
    this.cache.set(key, newNode);
    
    if (!evictionCache.head) {
      evictionCache.head = newNode;
      if (!evictionCache.tail) evictionCache.tail = newNode;
    }
    // else we want to add a next node to our newNode, which should be the head of the evictionCache
    else {
      newNode.next = evictionCache.head;
      evictionCache.head.prev = newNode;
      evictionCache.head = newNode;
    }
    // Check if the size of our eviction cache's cache is greater than the largest value. If so, delete the tail
    if (evictionCache.cache.size > evictionCache.maxSize) {
      // Create a node, reassign the tail, set next to null, delete the evicted node returning evict end
      evictionCache.cache.delete(evictionCache.tail.key);
      evictionCache.tail = evictionCache.tail.prev;
      evictionCache.tail.next = null;
    }
    return newNode;
  }
  // Evict node at the end of the list
  evictEnd(): EvictionNode<T> | void {
    // Evict tail of the linked list so long as the tail is not null
    this.cache.delete(this.tail.key);
    this.tail.prev.next = null;
    this.tail = this.tail.prev;
  }

  // Update the node when it is used and add it to the queue to be further from eviction(possibly not needed)
  updateEvictionNode(): EvictionNode<T> {
    // We want to check if a node has been used. If it has, move it to the head of the list. This way, if a node is unsused it will slowly make its way to the tail
  }

  // Set the new node and add it to the list(may be implemented through create node instead or vice versa)
  setNode(): EvictionNode<T> {
    // ...
  }
  
  deleteNode(node): EvictionNode<T> {

  }

  // Get a specific node from the linked list(to return from the cache)
  getNode(key: string): EvictionNode<T> {
    // ...
    const node = this.cache.get(key);
    this.deleteNode(node);
    this.createNode(node.key, node.value);
  
    return node;
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
        if (this.cache.has(query)) {
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
              this.cache.set(query, result);
              // this.cache.set(EvictionCache.prototype.createHead())

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
    this.cache = new Map();
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
