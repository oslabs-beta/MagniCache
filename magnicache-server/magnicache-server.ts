const { graphql } = require('graphql');
const { parse } = require('graphql/language/parser');
import { Response, Request, NextFunction } from 'express';
import { MagnicacheType } from './../types';
import * as mergeWith from 'lodash.mergewith';
const { IntrospectionQuery } = require('./IntrospectionQuery');
// TODO?: type "this" more specifically
// TODO?: add query type to linked list => refactor mutations
// TODO?: rename EvictionNode => Node
// TODO?: put Cache.validate on Magnicache prototype, only store schema once

function Magnicache(this: MagnicacheType, schema: {}, maxSize = 100): void {
  // save the provided schema
  this.schema = schema;
  // max size of cache in atomized queries
  this.maxSize = maxSize;
  // instantiate doublely linked list to handle caching
  this.cache = new Cache(maxSize, schema);

  this.schemaTree = this.schemaParser(schema);

  this.metrics = {
    cacheUsage: 0,
    sizeLeft: this.maxSize,
    totalHits: 0,
    totalMisses: 0,
    AvgCacheTime: 0, // for atomic queries only, can change to query as a whole later on
    AvgMissTime: 0,
    AvgMemAccTime: 0, // hit rate * cacheTime + miss rate * missTIme, still for atomic queries only
  };
  // bind method(s)
  this.query = this.query.bind(this);
  this.schemaParser = this.schemaParser.bind(this);
}
// linked list node constructor
class EvictionNode<T> {
  key: string; // atomized query
  value: any; // query return value
  next: EvictionNode<any> | null;
  prev: EvictionNode<any> | null;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

// linked list constructor
class Cache<T> {
  maxSize: number;
  map: Map<string, any>; // map stores references to linked list nodes
  head: EvictionNode<any> | null;
  tail: EvictionNode<any> | null;
  schema: {};
  constructor(maxSize: number, schema: {}) {
    this.maxSize = maxSize;
    this.map = new Map();
    this.head = null;
    this.tail = null;
    this.schema = schema;

    // method binding
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
    this.get = this.get.bind(this);
    this.includes = this.includes.bind(this);
  }

  // insert a node at the head of the list && if maxsize is reached, evict least recently used node
  create(key: string, value: object): EvictionNode<T> {
    // Create a new node
    const newNode = new EvictionNode<any>(key, value);

    // add node to map
    this.map.set(key, newNode);

    // if linked list is empty, set at head && tail
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      // otherwise add new node at head of list
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    // check cache size, prune tail if necessary
    if (this.map.size > this.maxSize) this.delete(this.tail);

    return newNode;
  }

  // remove node from linked list
  delete(node): void {
    // SHOULD NEVER RUN: delete should only be invoked when node is known to exist
    if (node === null)
      throw new Error('ERROR in MagniCache.cache.delete: node is null');
    if (node.next === null && node.prev === null) {
      this.head = null;
      this.tail = null;
      // if node is at tail
    } else if (node.next === null) {
      node.prev.next = null;
      this.tail = node.prev;
      // if node is at head
    } else if (node.prev === null) {
      node.next.prev = null;
      this.head = node.next;
      // if node is not head of tail;
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    // remove node from map
    this.map.delete(node.key);
  }

  // retrieve node from linked list
  get(key: string): string {
    const node = this.map.get(key);
    // SHOULD NEVER RUN: get should only be invoked when node is known to exist
    if (node === null)
      throw new Error('ERROR in MagniCache.cache.get: node is null');
    // if the node is at the head, simply return the value
    if (this.head === node) return node.value;
    // if node is at the tail, remove it from the tail
    if (this.tail === node) {
      this.tail = node.prev;
      node.prev.next = null;
      // if node is neither, remove it
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    // move the current head down one in the LL, move the current node to the head
    this.head!.prev = node;
    node.prev = null;
    node.next = this.head;
    this.head = node;

    return node.value;
  }

  validate(node): void {
    if (node?.key === null)
      throw new Error('ERROR in MagniCache.cache.validate: invalid node');
    graphql({ schema: this.schema, source: node.key })
      .then((result: { error?: {}; data?: {} }) => {
        if (!result.error) {
          node.value = result;
        } else {
          this.delete(node);
        }
      })
      .catch((err: {}) => {
        throw new Error(
          'ERROR in MagniCache.cache.validate: error executing graphql query'
        );
      });
    return;
  }

  // syntactic sugar to check if cache has a key
  includes(key: string): boolean {
    return this.map.has(key);
  }
  // syntactic sugar to get linked list length
  count(): number {
    return this.map.size;
  }
}

// used in middleware chain
Magnicache.prototype.query = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // get graphql query from request body
  const { query } = req.body;
  // if query is null, send back a 400 code
  if (query === null || query === '') {
    res.send(400);
  }
  // parse the query into an AST
  const {
    definitions: [ast],
  } = parse(query);

  // if query is for 'clearCache', clear the cache and return next
  if (ast.selectionSet.selections[0].name.value === 'clearCache') {
    this.cache = new Cache(this.maxSize, this.schema);
    res.locals.queryResponse = { cacheStatus: 'cacheCleared' };
    return next();
  }

  // if query is for metrics, attach metrics to locals and return next
  if (ast.selectionSet.selections[0].name.value === 'getMetrics') {
    res.locals.queryResponse = this.metrics;
    return next();
  }

  // check if the operation type is a query
  if (ast.operation === 'query') {
    // if query is for the schema, bypass cache and execute query as normal
    if (ast.selectionSet.selections[0].name.value === '__schema') {
      graphql({ schema: this.schema, source: query })
        .then((result: {}) => {
          res.locals.queryResponse = result;
          return next();
        })
        // throw error to express global error handler
        .catch((err: {}) => {
          throw new Error(
            'ERROR executing graphql query' + JSON.stringify(err)
          );
        });
    } else {
      // parse the ast into usable graphql querys
      const queries: string[] = this.magniParser(ast.selectionSet.selections);

      const queryResponses: {}[] = [];
      // compile all queryResponses into one object that is return to requester
      const compileQueries = () => {
        // merge all responses into one object
        let response: {} = {};
        for (const queryResponse of queryResponses) {
          response = mergeWith(response, queryResponse);
        }

        // assign the combined result to the response locals
        res.locals.queryResponse = response;
        return next();
      };

      // calculate the average memory access time
      const calcAMAT = () => {
        // calculate cache hit rate
        const hitRate =
          this.metrics.totalHits /
          (this.metrics.totalHits + this.metrics.totalMisses);

        // calculate average memory access time and update metrics object
        this.metrics.AvgMemAccTime = Math.round(
          hitRate * this.metrics.AvgCacheTime +
            (1 - hitRate) * this.metrics.AvgMissTime
        );

        // Return the calculated metric
        return this.metrics.AvgMemAccTime;
      };

      // loop through the individual queries and execute them in turn
      for (const query of queries) {
        // check if query is already cached
        if (this.cache.includes(query)) {
          // add a cookie indicating that the cache was hit
          // will be overwritten by any following querys
          res.cookie('cacheStatus', 'hit');
          // update the metrics with a hit count
          this.metrics.totalHits++;
          // Start a timter
          const hitStart = Date.now();
          // retrieve the data from cache and add to queryResponses array
          queryResponses.push(this.cache.get(query));

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            // compile all queries
            compileQueries();
          }

          // calculate the hit time
          const hitTime = Math.floor(Date.now() - hitStart);
          // update the metrics object
          this.metrics.AvgCacheTime = Math.round(
            (this.metrics.AvgCacheTime + hitTime) / this.metrics.totalHits
          );
        } else {
          // start the miss timer
          const missStart = Date.now();
          // execute the query
          graphql({ schema: this.schema, source: query })
            .then((result: { err?: {}; data?: {} }) => {
              // if no error, cache response
              if (!result.err) this.cache.create(query, result);

              // update the metrics with the new size
              this.metrics.cacheUsage = this.cache.count();

              // store the query response
              queryResponses.push(result);
            })
            // update miss time as well as update the average memory access time
            .then(() => {
              // add a cookie indicating that the cache was missed
              res.cookie('cacheStatus', 'miss');
              // update the metrics with a missCount
              this.metrics.totalMisses++;
              this.sizeLeft = this.maxSize - this.metrics.cacheUsage;
              const missTime = Date.now() - missStart;
              this.metrics.AvgMissTime = Math.round(
                (this.metrics.AvgMissTime + missTime) / this.metrics.totalMisses
              );
              this.metrics.AvgMissTime == Math.round(this.metrics.AvgMissTime);
              console.log('calc res', calcAMAT());
              // check if all queries have been fetched
              if (queries.length === queryResponses.length) {
                // compile all queries
                compileQueries();
              }
            })
            .catch((err: {}) => {
              throw new Error(
                'ERROR executing graphql query' + JSON.stringify(err)
              );
            });
        }
      }
    }
    // if not a query
  } else if (ast.operation === 'mutation') {
    // first execute mutation normally
    graphql({ schema: this.schema, source: query })
      .then((result: {}) => {
        res.locals.queryResponse = result;
        return next();
      })
      .then(() => {
        // get all mutation types, utilizing a set to avoid duplicates
        const mutationTypes: Set<string> = new Set();
        for (const mutation of ast.selectionSet.selections) {
          const mutationName = mutation.name.value;
          mutationTypes.add(this.schemaTree.mutations[mutationName]);
        }
        // for every mutation type, get every corresponding query type
        mutationTypes.forEach((mutationType) => {
          const userQueries: Set<string> = new Set();

          for (const query in this.schemaTree.queries) {
            const type = this.schemaTree.queries[query];
            if (mutationType === type) userQueries.add(query);
          }

          userQueries.forEach((query) => {
            for (
              let currentNode = this.cache.head;
              currentNode !== null;
              currentNode = currentNode.next
            ) {
              if (currentNode.key.includes(query)) {
                this.cache.validate(currentNode);
              }
            }
          });
        });
      })
      .catch((err) => {
        console.error(err);
        return err;
      });
  }
};

// invoked with AST as an argument, returns an array of graphql schemas
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
  // Looping through the selections to build the queries array
  for (const selection of selections) {
    // add current query to queryArray
    queryArray.push(selection.name.value);

    // if a query has arguments, format and add to query array
    if (selection.arguments.length > 0) {
      const argumentArray: string[] = [];

      // looping through the arguments to add them to the argument array
      for (const argument of selection.arguments) {
        argumentArray.push(`${argument.name.value}:${argument.value.value}`);
      }

      queryArray.push([argumentArray.join(',')]);
    }
    // if there is a selectionSet property, there are more deeply nested queries
    if (selection.selectionSet) {
      // recursively invoke magniParser passing in selections array
      this.magniParser(selection.selectionSet.selections, queryArray, queries);
    } else {
      let queryString = ``;
      // if query array looks like this: ['messageById', ['id:4'], 'message']
      // formated query will look like this: {allMessages(id:4){message}}

      // looping through the query array in reverse to build the query string
      for (let i = queryArray.length - 1; i >= 0; i--) {
        // arguments are put into an array and need to be formatted differently
        if (Array.isArray(queryArray[i])) {
          queryString = `(${queryArray[i][0]})${queryString}`;
        } else {
          queryString = `{${queryArray[i] + queryString}}`;
        }
      }
      // adding the completed query to the queries array
      queries.push(queryString);
    }
    // remove last element, as it's not wanted on next iteration
    queryArray.pop();
  }
  // returning the array of individual querys
  return queries;
};

Magnicache.prototype.schemaParser = function (schema) {
  // TODO :refactor to be able to store multiple types for each query

  const schemaTree = {
    queries: {
      //Ex: allMessages:Messages
    },
    mutations: {},
  };

  const typeFinder = (type) => {
    console.log('field', type);
    if (type.name === null) return typeFinder(type.ofType);
    return type.name;
  };

  // TODO: Type the result for the schema
  graphql({ schema: this.schema, source: IntrospectionQuery })
    .then((result: any) => {
      // console.log(result.data.__schema.queryType);
      if (result.data.__schema.queryType) {
        for (const field of result.data.__schema.queryType.fields) {
          schemaTree.queries[field.name] = typeFinder(field.type);
        }
      }
      if (result.data.__schema.mutationType) {
        for (const field of result.data.__schema.mutationType.fields) {
          schemaTree.mutations[field.name] = typeFinder(field.type);
        }
      }
    })
    .then(() => {
      console.log('schemaTree', schemaTree);
    })
    // throw error to express global error handler
    .catch((err: {}) => {
      console.error(err);
      // throw new Error(`ERROR executing graphql query` + JSON.stringify(err));
      return err;
    });

  return schemaTree;
};

module.exports = Magnicache;
