"use strict";
exports.__esModule = true;
var _a = require('graphql'), graphql = _a.graphql, GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLString = _a.GraphQLString;
var parse = require('graphql/language/parser').parse;
var mergeWith = require("lodash/mergeWith");
// EvictionCache Class, for removing the LRU item in the cachce
// Magnicache class for creating a queryable cache
function Magnicache(schema) {
    // save the provided schema
    this.schema = schema;
    // create a map for caching query responses
    this.cache = new Map();
    // bind the query method for use in other functions
    this.query = this.query.bind(this);
}
// Class constructors for the linked list and the nodes for the list
var EvictionCache = /** @class */ (function () {
    function EvictionCache(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.head = null;
        this.tail = null;
    }
    return EvictionCache;
}());
var EvictionNode = /** @class */ (function () {
    function EvictionNode(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    return EvictionNode;
}());
// If getting setting or looking up, time complex should be O(1)
// Insert a node at the head of the list
Magnicache.prototype.changeHead = function () { };
// Evict node at the end of the list
Magnicache.prototype.evictEnd = function () { };
// Create and add a node to the cache(possibly not needed)
Magnicache.prototype.createNode = function () { };
// Update the node when it is used and add it to the queue to be evicted(possibly not needed)
Magnicache.prototype.updateEvictionNode = function () { };
// Set the new node and add it to the list(may be implemenmted through create node instead or vice versa)
Magnicache.prototype.setNode = function () { };
// Get a specific node from the linked list(to return from the cache)
Magnicache.prototype.getNode = function () { };
// Query method takes request, response and next callbacks
// as its arguments
Magnicache.prototype.query = function (req, res, next) {
    var _this = this;
    // get the body of the requested query
    var query = req.body.query;
    // parse the query into an AST
    var ast = parse(query).definitions[0];
    // check if the operation is a query
    // and not some other type of mutation
    if (ast.operation === 'query') {
        if (ast.selectionSet.selections[0].name.value === '__schema') {
            // execute the graphl query against the schema
            graphql({ schema: this.schema, source: query })
                .then(function (result) {
                // assign the result to the response locals
                res.locals.queryResponse = result;
                // proceed to execute the next callback
                return next();
            })["catch"](function (err) {
                console.log(err);
                // throw an error to the next callback
                return next({
                    log: err
                });
            });
        }
        else {
            // get the selection set
            var queries_2 = this.magniParser(ast.selectionSet.selections);
            // store the query results
            var queryResponses_1 = [];
            // compile all individual query responses
            var compileQueries_1 = function () {
                var response1 = {};
                for (var _i = 0, queryResponses_2 = queryResponses_1; _i < queryResponses_2.length; _i++) {
                    var queryResponse = queryResponses_2[_i];
                    response1 = mergeWith(response1, queryResponse);
                }
                // assign the combined result to the response locals
                res.locals.queryResponse = response1;
                console.log(_this.cache);
                // proceed to execute the next callback
                return next();
            };
            var _loop_1 = function (query_1) {
                // check if query is already cached
                if (this_1.cache.has(query_1)) {
                    // output message indicating that the query is cached
                    console.log('cache hit');
                    res.cookie('cachestatus', 'hit');
                    console.log('cachestatus set hit on res');
                    // store the cached response
                    queryResponses_1.push(this_1.cache.get(query_1));
                    // check if all queries have been fetched
                    if (queries_2.length === queryResponses_1.length) {
                        // if yes, compile all queries
                        compileQueries_1();
                    }
                }
                else {
                    res.cookie('cachestatus', 'miss');
                    console.log('cachestatsus set miss on Res');
                    // output message indicating that the query is missing
                    console.log('cache miss');
                    // execute the query against graphql
                    graphql({ schema: this_1.schema, source: query_1 })
                        .then(function (result) {
                        // cache the newest response
                        _this.cache.set(query_1, result);
                        // store the query response
                        queryResponses_1.push(result);
                        // check if all queries have been fetched
                        if (queries_2.length === queryResponses_1.length) {
                            // if yes, compile all queries
                            compileQueries_1();
                        }
                    })["catch"](function (err) {
                        console.log(err);
                        // throw an error to the next callback
                        return next({
                            log: err
                        });
                    });
                }
            };
            var this_1 = this;
            // loop through the individual queries and execute them in turn
            for (var _i = 0, queries_1 = queries_2; _i < queries_1.length; _i++) {
                var query_1 = queries_1[_i];
                _loop_1(query_1);
            }
        }
        // not a query!!
    }
    else if (ast.operation === 'mutation') {
        console.log('this is a mutation');
        // Logic for mutation goes here
        this.cache = new Map();
        console.log(this.cache);
        graphql({ schema: this.schema, source: query })
            .then(function (result) {
            res.locals.queryResponse = result;
            return next();
        })["catch"](function (err) {
            console.log(err);
            return next({
                log: err
            });
        });
    }
};
// Function that takes an array of selections and generates an array of strings based off of them
Magnicache.prototype.magniParser = function (selections, queryArray, queries) {
    var _a;
    if (queryArray === void 0) { queryArray = []; }
    if (queries === void 0) { queries = []; }
    //Logging that the parser is running
    console.log('parsing');
    // Looping through the selections to build the queries array
    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
        var selection = selections_1[_i];
        queryArray.push(selection.name.value);
        if (((_a = selection.arguments) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            var argumentArray = [];
            // looping through the arguments to add them to the argument array
            for (var _b = 0, _c = selection.arguments; _b < _c.length; _b++) {
                var argument = _c[_b];
                argumentArray.push("".concat(argument.name.value, ":").concat(argument.value.value));
            }
            //['id:4','name:john']
            queryArray.push([argumentArray.join(',')]);
        }
        // Checking for a selection set in the selection
        if (selection.selectionSet) {
            this.magniParser(selection.selectionSet.selections, queryArray, queries);
        }
        else {
            var string = "";
            //{allMessages(id:4){message}}
            // Ex:  ['messageById', ['id:4'], ['name:yousuf'], 'message']
            // would give {messageById(id:4,name:yousuf){message}}
            // Looping through the query array to build the string
            for (var i = queryArray.length - 1; i >= 0; i--) {
                if (Array.isArray(queryArray[i])) {
                    string = "(".concat(queryArray[i][0], ")").concat(string);
                }
                else {
                    string = "{".concat(queryArray[i] + string, "}");
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
