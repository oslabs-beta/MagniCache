const { parse } = require('graphql/language/parser');
import * as mergeWith from 'lodash.mergewith';

function MagniClient(maxSize: number = 40): void {
  this.maxSize = maxSize;
  // bind the method contexts
  this.query = this.query.bind(this);
  this.set = this.set.bind(this);
  this.get = this.get.bind(this);

  // instatiate our cache;
  const cache = localStorage.getItem('MagniClient');
  if (cache === null) {
    this.cache = [];
    localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  } else {
    this.cache = JSON.parse(cache);
  }
}

MagniClient.prototype.set = function (query: string, value: {}): void {
  // add query to cache array (most recent is the back of the array)
  this.cache.push(query);
  // add value to localstorage
  localStorage.setItem(query, JSON.stringify(value));
  // check cache length, prune if nessesary
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
  // .splice(start, deleteCount, item1)
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
        resolve(response);
      };

      for (const query of queries) {
        // check if query is already cached
        if (this.cache.includes(query)) {
          console.log('Client side cache hit');
          //store cached response

          queryResponses.push(this.get(query));

          // check if all queries have been fetched
          if (queries.length === queryResponses.length) {
            compileQueries();
          }
        } else {
          // if query is not cached
          console.log('client side cache miss');
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
                console.log('this is the final compile queries');
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

export default MagniClient;

const cachePromiseFunction = (get) => {
  const cache = {};
  return (...args) => {
    return new Promise((resolve, reject) => {
      const stArgs = JSON.stringify(args);
      if (cache.hasOwnProperty(stArgs)) {
        resolve(cache[stArgs]);
      } else {
        get(...args)
          .then((data) => {
            cache[stArgs] = data;
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  };
};
