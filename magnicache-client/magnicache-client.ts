const { parse } = require('graphql/language/parser');
const mergeWith = require('lodash.mergewith');
// import * as mergeWith from 'lodash.mergewith';

function MagniClient(this: any, maxSize: number = 40): void {
  this.maxSize = maxSize;
  // bind the method contexts
  this.query = this.query.bind(this);
  this.set = this.set.bind(this);
  this.get = this.get.bind(this);

  // instantiate our cache;
  const cache = localStorage.getItem('MagniClient');
  if (cache === null) {
    this.cache = [];
    localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  } else {
    // make sure there are no duplicate in our cache array
    this.cache = Array.from(new Set(JSON.parse(cache)));
  }
}

MagniClient.prototype.set = function (query: string, value: {}): void {
  // add query to cache array (most recent is the back of the array)
  this.cache.push(query);

  // add value to localstorage
  localStorage.setItem(query, JSON.stringify(value));
  // check cache length, prune if necessary
  while (this.cache.length > this.maxSize) {
    // remove least recent from front of array
    const itemToRemove = this.cache.shift();
    localStorage.removeItem(itemToRemove);
  }
  localStorage.setItem('MagniClient', JSON.stringify(this.cache));
};

MagniClient.prototype.get = function (query: string): {} {
  // get value from localstorage
  const value = localStorage.getItem(query);
  if (value === null) return {};
  // move the key to the end of the cache array
  const index = this.cache.indexOf(query);
  this.cache.splice(index, 1);
  this.cache.push(query);
  localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  // return value
  return JSON.parse(value);
};

MagniClient.prototype.query = function (query: string, endpoint: string) {
  return new Promise((resolve, reject) => {
    // parse query to obtain AST
    const {
      definitions: [ast],
    } = parse(query);

    // check that the operation is a query
    if (ast.operation === 'query') {
      // get the selection set
      const queries: string[] = this.magniParser(ast.selectionSet.selections);

      //store the query results
      const queryResponses: {}[] = [];

      // compile all individual query responses
      const compileQueries = () => {
        let response: {} = {};

        for (const queryResponse of queryResponses) {
          response = mergeWith(response, queryResponse);
        }
        //whereas in server we saved response on res.locals to send back to client, here we just update the client side cache
        console.log(response);
        resolve([response, { uncached }]);
      };
      let uncached = false; // cache hit

      for (const query of queries) {
        // check if query is already cached
        if (this.cache.includes(query)) {
          console.log('Client-side cache hit');
          //store cached response

          queryResponses.push(this.get(query));

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            compileQueries();
          }
        } else {
          // if query is not cached

          console.log('Client-side cache miss');
          uncached = true; // cache miss

          fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ query }),
            headers: {
              'content-type': 'application/json',
            },
          })
            .then((data) => data.json())
            .then((result: { err?: {}; data?: {} }) => {
              if (!result.err) this.set(query, result);
              queryResponses.push(result);

              if (queries.length === queryResponses.length) {
                compileQueries();
              }
            })
            .catch((err: {}) => {
              console.log(err);
              reject(err);
            });
        }
      }
    }
  });
};

MagniClient.prototype.magniParser = function (
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
    if (selection.arguments?.length > 0) {
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
      let string = ``;
      // if query array looks like this: ['messageById', ['id:4'], 'message']
      // formated query will look like this: {allMessages(id:4){message}}

      // looping through the query array in reverse to build the query string
      for (let i = queryArray.length - 1; i >= 0; i--) {
        // arguments are put into an array and need to be formatted differently
        if (Array.isArray(queryArray[i])) {
          string = `(${queryArray[i][0]})${string}`;
        } else {
          string = `{${queryArray[i] + string}}`;
        }
      }
      // adding the completed query to the queries array
      queries.push(string);
    }
    // remove last element, as it's not wanted on next iteration
    queryArray.pop();
  }
  // returning the array of individual querys
  return queries;
};

// export default MagniClient;

module.exports = MagniClient;
