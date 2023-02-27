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
class EvictionCache<T> {
  maxSize: number;
  cache: Map<string, T>;
  head: EvictionNode<T> | null;
  tail: EvictionNode<T> | null;
  constructor(maxSize: number) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }
}

class EvictionNode<T> {
  key: string;
  value: T;
  next: EvictionNode<T> | null;
  prev: EvictionNode<T> | null;
  constructor(key: string, value: T) {
    this.key = key;
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}
// If getting setting or looking up, time complex should be O(1)
// Insert a node at the head of the list
Magnicache.prototype.changeHead = (): EvictionNode<T> => {};

// Evict node at the end of the list
Magnicache.prototype.evictEnd = (): EvictionNode<T> => {};

// Create and add a node to the cache(possibly not needed)
Magnicache.prototype.createNode = (): EvictionNode<T> => {};

// Update the node when it is used and add it to the queue to be evicted(possibly not needed)
Magnicache.prototype.updateEvictionNode = (): EvictionNode<T> => {};

// Set the new node and add it to the list(may be implemenmted through create node instead or vice versa)
Magnicache.prototype.setNode = (): EvictionNode<T> => {};

// Get a specific node from the linked list(to return from the cache)
Magnicache.prototype.getNode = (): EvictionNode<T> => {};


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

          // store the cached response
          queryResponses.push(this.cache.get(query));

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            // if yes, compile all queries
            compileQueries();
          }
        } else {
          // output message indicating that the query is missing
          console.log('cache miss');

          // execute the query against graphql
          graphql({ schema: this.schema, source: query })
            .then((result: {}) => {
              // cache the newest response
              this.cache.set(query, result);

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
