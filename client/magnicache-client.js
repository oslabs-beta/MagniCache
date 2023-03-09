'use strict';
exports.__esModule = true;
var parse = require('graphql/language/parser').parse;
var mergeWith = require('lodash.mergeWith');
function MagniClient(maxSize) {
  if (maxSize === void 0) {
    maxSize = 40;
  }
  this.maxSize = maxSize;
  // bind the method contexts
  this.query = this.query.bind(this);
  this.set = this.set.bind(this);
  this.get = this.get.bind(this);
  // instatiate our cache;
  var cache = localStorage.getItem('MagniClient');
  if (cache === null) {
    this.cache = [];
    localStorage.setItem('MagniClient', JSON.stringify(this.cache));
  } else {
    this.cache = JSON.parse(cache);
  }
}
MagniClient.prototype.set = function (query, value) {
  // add query to cache array (most recent is the back of the array)
  this.cache.push(query);
  // add value to localstorage
  localStorage.setItem(query, JSON.stringify(value));
  // check cache length, prune if nessesary
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
  // .splice(start, deleteCount, item1)
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
        resolve(response);
      };
      var _loop_1 = function (query_1) {
        // check if query is already cached
        if (_this.cache.includes(query_1)) {
          console.log('Client side cache hit');
          //store cached response
          queryResponses_1.push(_this.get(query_1));
          // check if all queries have been fetched
          if (queries_2.length === queryResponses_1.length) {
            compileQueries_1();
          }
        } else {
          // if query is not cached
          console.log('client side cache miss');
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
              _this.set(query_1, result);
              queryResponses_1.push(result);
              if (queries_2.length === queryResponses_1.length) {
                console.log('this is the final compile queries');
                compileQueries_1();
              }
            })
            ['catch'](function (err) {
              console.log(err);
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
  //Logging that the parser is running
  console.log('parsing');
  // Looping through the selections to build the queries array
  for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
    var selection = selections_1[_i];
    queryArray.push(selection.name.value);
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
      //['id:4','name:john']
      queryArray.push([argumentArray.join(',')]);
    }
    // Checking for a selection set in the selection
    if (selection.selectionSet) {
      this.magniParser(selection.selectionSet.selections, queryArray, queries);
    } else {
      var string = '';
      //{allMessages(id:4){message}}
      // Ex:  ['messageById', ['id:4'], ['name:yousuf'], 'message']
      // would give {messageById(id:4,name:yousuf){message}}
      // Looping through the query array to build the string
      for (var i = queryArray.length - 1; i >= 0; i--) {
        if (Array.isArray(queryArray[i])) {
          string = '('.concat(queryArray[i][0], ')').concat(string);
        } else {
          string = '{'.concat(queryArray[i] + string, '}');
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
module.exports = MagniClient;
