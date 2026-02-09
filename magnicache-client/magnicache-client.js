var parse = require('graphql/language/parser').parse;
var mergeWith = require('lodash.mergewith');
// import * as mergeWith from 'lodash.mergewith';
function MagniClient(maxSize) {
  if (maxSize === void 0) {
    maxSize = 40;
  }
  this.maxSize = maxSize;
  // bind the method contexts
  this.query = this.query.bind(this);
  this.set = this.set.bind(this);
  this.get = this.get.bind(this);
  // instantiate our cache;
  var cache = localStorage.getItem('MagniClient');
  if (cache === null) {
    this.cache = [];
    localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  } else {
    // make sure there are no duplicate in our cache array
    this.cache = Array.from(new Set(JSON.parse(cache)));
  }
}
MagniClient.prototype.set = function (query, value) {
  // add query to cache array (most recent is the back of the array)
  this.cache.push(query);
  // add value to localstorage
  localStorage.setItem(query, JSON.stringify(value));
  // check cache length, prune if necessary
  while (this.cache.length > this.maxSize) {
    // remove least recent from front of array
    var itemToRemove = this.cache.shift();
    localStorage.removeItem(itemToRemove);
  }
  localStorage.setItem('MagniClient', JSON.stringify(this.cache));
};
MagniClient.prototype.get = function (query) {
  // get value from localstorage
  var value = localStorage.getItem(query);
  if (value === null) return {};
  // move the key to the end of the cache array
  var index = this.cache.indexOf(query);
  this.cache.splice(index, 1);
  this.cache.push(query);
  localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  // return value
  return JSON.parse(value);
};
MagniClient.prototype.query = function (query, endpoint) {
  var _this = this;
  return new Promise(function (resolve, reject) {
    // parse query to obtain AST
    var ast = parse(query).definitions[0];
    // check that the operation is a query
    if (ast.operation === 'query') {
      // get the selection set
      var queries_2 = _this.magniParser(ast.selectionSet.selections);
      //store the query results
      var queryResponses_1 = [];
      // compile all individual query responses
      var compileQueries_1 = function () {
        var response = {};
        for (
          var _i = 0, queryResponses_2 = queryResponses_1;
          _i < queryResponses_2.length;
          _i++
        ) {
          var queryResponse = queryResponses_2[_i];
          response = mergeWith(response, queryResponse);
        }
        //whereas in server we saved response on res.locals to send back to client, here we just update the client side cache
        console.log(response);
        resolve([response, { uncached: uncached_1 }]);
      };
      var uncached_1 = false; // cache hit
      var _loop_1 = function (query_1) {
        // check if query is already cached
        if (_this.cache.includes(query_1)) {
          console.log('Client-side cache hit');
          //store cached response
          queryResponses_1.push(_this.get(query_1));
          // check if all queries have been fetched
          if (queries_2.length === queryResponses_1.length) {
            compileQueries_1();
          }
        } else {
          // if query is not cached
          console.log('Client-side cache miss');
          uncached_1 = true; // cache miss
          fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ query: query_1 }),
            headers: {
              'content-type': 'application/json',
            },
          })
            .then(function (data) {
              return data.json();
            })
            .then(function (result) {
              if (!result.err) _this.set(query_1, result);
              queryResponses_1.push(result);
              if (queries_2.length === queryResponses_1.length) {
                compileQueries_1();
              }
            })
            ['catch'](function (err) {
              console.log(err);
              reject(err);
            });
        }
      };
      for (var _i = 0, queries_1 = queries_2; _i < queries_1.length; _i++) {
        var query_1 = queries_1[_i];
        _loop_1(query_1);
      }
    }
  });
};
MagniClient.prototype.magniParser = function (selections, queryArray, queries) {
  var _a;
  if (queryArray === void 0) {
    queryArray = [];
  }
  if (queries === void 0) {
    queries = [];
  }
  // Looping through the selections to build the queries array
  for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
    var selection = selections_1[_i];
    // add current query to queryArray
    queryArray.push(selection.name.value);
    // if a query has arguments, format and add to query array
    if (
      ((_a = selection.arguments) === null || _a === void 0
        ? void 0
        : _a.length) > 0
    ) {
      var argumentArray = [];
      // looping through the arguments to add them to the argument array
      for (var _b = 0, _c = selection.arguments; _b < _c.length; _b++) {
        var argument = _c[_b];
        argumentArray.push(
          ''.concat(argument.name.value, ':').concat(argument.value.value)
        );
      }
      queryArray.push([argumentArray.join(',')]);
    }
    // if there is a selectionSet property, there are more deeply nested queries
    if (selection.selectionSet) {
      // recursively invoke magniParser passing in selections array
      this.magniParser(selection.selectionSet.selections, queryArray, queries);
    } else {
      var string = '';
      // if query array looks like this: ['messageById', ['id:4'], 'message']
      // formated query will look like this: {allMessages(id:4){message}}
      // looping through the query array in reverse to build the query string
      for (var i = queryArray.length - 1; i >= 0; i--) {
        // arguments are put into an array and need to be formatted differently
        if (Array.isArray(queryArray[i])) {
          string = '('.concat(queryArray[i][0], ')').concat(string);
        } else {
          string = '{'.concat(queryArray[i] + string, '}');
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
