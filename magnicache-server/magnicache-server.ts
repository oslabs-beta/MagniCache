const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');
const { parse } = require('graphql/language/parser');
import { Response, Request, NextFunction } from 'express';
import { CacheMetricsType } from './../types';

import * as mergeWith from 'lodash/mergeWith';

// Cache Class, for removing the LRU item in the cache

// Magnicache class for creating a queryable cache
// TODO: delete the 'this' parameter --> doesn't seem to be necessary
function Magnicache(this: any, schema: any, maxSize: number = 100): void {
  // save the provided schema
  this.schema = schema;
  this.maxSize = maxSize;
  // bind the query method for use in other functions
  this.query = this.query.bind(this);

  this.cache = new Cache(maxSize);
  this.metrics = {
    //type this to be a cacheMetrics type
    cacheUsage: 0,
    sizeLeft: this.maxSize,
    totalHits: 0,
    totalMisses: 0,
    AvgCacheTime: 0, //for atomic queries only, can change to query as a whole later on
    AvgMissTime: 0,
    AvgMemAccTime: 0, // hit rate * cacheTime + miss rate * missTIme, still for atomic queries only
  };
}
// Class constructors for the linked list and the nodes for the list
class EvictionNode<T> {
  //TODO learn more about <T>
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
  // TODO: fix return type
  get(key: string): EvictionNode<T> {
    const node = this.map.get(key);
    // if (this.head === null) return node;
    // console.log(node);
    //if the node is at the head, simply return the value
    if (this.head === node) return node.value;
    //if node is at the tail, remove it from the tail
    if (this.tail === node) {
      this.tail = node.prev;
      node.prev.next = null;
      // if node is neither, remove it
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    //move the current head down one in the LL, move the current node to the head
    this.head!.prev = node;
    node.prev = null;
    node.next = this.head;
    this.head = node;

    return node.value;
  }

  //check if the cache has the key, only purpose if for semantic sugar
  includes(key: string) {
    return this.map.has(key);
  }

  count(): number {
    let counter = 0;
    let current = this.head;
    while (current !== null) {
      counter++;
      current = current.next;
    }
    return this.map.size;
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

  if (ast.selectionSet.selections[0].name.value === 'clearCache') {
    this.cache = new Cache(this.maxSize);
    res.locals.queryResponse = { cacheStatus: 'cacheCleared' };
    return next();
  }

  if (ast.selectionSet.selections[0].name.value === 'getMetrics') {
    res.locals.queryResponse = this.metrics;
    return next();
  }

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
        //TODO: clean up -> sematnicize
        for (const queryResponse of queryResponses) {
          response1 = mergeWith(response1, queryResponse);
        }

        // assign the combined result to the response locals
        res.locals.queryResponse = response1;

        // console.log(this.cache);

        // proceed to execute the next callback
        return next();
      };

      //calculate the AMAT
      const calcAMAT = () => {
        //finally, calculate AMAT
        const hitRate =
          this.metrics.totalHits /
          (this.metrics.totalHits + this.metrics.totalMisses);
        this.metrics.AvgMemAccTime = Math.round(
          hitRate * this.metrics.AvgCacheTime +
            (1 - hitRate) * this.metrics.AvgMissTime
        );
        console.log('amat', this.metrics.AvgMemAccTime);
        // Return the calculated average memory access time
        return this.metrics.AvgMemAccTime;
      };

      // loop through the individual queries and execute them in turn
      for (const query of queries) {
        // check if query is already cached
        if (this.cache.includes(query)) {
          // output message indicating that the query is cached
          console.log('cache hit');
          // add a cookie that the cache was hit
          res.cookie('cacheStatus', 'hit');

          //update the metrics with a hit count
          this.metrics.totalHits++;
          //Start a timter
          const hitStart = Date.now();
          // store the cached response
          // console.log('query response', this.cache.get(query));
          queryResponses.push(this.cache.get(query));
          // console.log(this.cache)

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            // if yes, compile all queries
            compileQueries();
          }

          //end the timer and calculate the diff, then update the metrics
          const hitEnd = Date.now();
          const hitTime = Math.floor(hitEnd - hitStart);
          console.log('hit time', hitTime);
          this.metrics.AvgCacheTime = Math.round(
            (this.metrics.AvgCacheTime + hitTime) / this.metrics.totalHits
          );
          console.log('average hit time', this.metrics.AvgCacheTime);
        } else {
          //start the miss timer
          const missStart = Date.now();
          // execute the query against graphql
          graphql({ schema: this.schema, source: query })
            .then((result: {}) => {
              // cache the newest response
              this.cache.create(query, result);
              // this.cache.set(Cache.prototype.createHead())

              //update the metrics with the new size
              this.metrics.cacheUsage = this.cache.count();

              // store the query response
              queryResponses.push(result);
            })
            // the below then block will update thte miss time as well as update the AMAT
            .then(() => {
              res.cookie('cacheStatus', 'miss');
              const missEnd = Date.now();
              //update the metrics with a missCount
              this.metrics.totalMisses++;
              this.sizeLeft = this.maxSize - this.metrics.cacheUsage;
              console.log('header sent', res.headersSent);
              const missTime = missEnd - missStart;
              console.log('missTime', missTime);
              this.metrics.AvgMissTime =
                (this.metrics.AvgMissTime + missTime) /
                this.metrics.totalMisses;
              // output message indicating that the query is missing
              console.log('cache miss');

              console.log('average miss time', this.metrics.AvgMissTime);
              console.log('calc res', calcAMAT());

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
    // console.log(this.cache);
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
