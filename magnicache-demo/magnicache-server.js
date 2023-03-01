"use strict";
exports.__esModule = true;
var _a = require('graphql'), graphql = _a.graphql, GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLString = _a.GraphQLString;
var parse = require('graphql/language/parser').parse;
var mergeWith = require("lodash/mergeWith");
// Cache Class, for removing the LRU item in the cache
// Magnicache class for creating a queryable cache
function Magnicache(schema, maxSize) {
    if (maxSize === void 0) { maxSize = 100; }
    // save the provided schema
    this.schema = schema;
    this.maxSize = maxSize;
    // bind the query method for use in other functions
    this.query = this.query.bind(this);
    this.cache = new Cache(maxSize);
}
// Class constructors for the linked list and the nodes for the list
var EvictionNode = /** @class */ (function () {
    function EvictionNode(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    return EvictionNode;
}());
var Cache = /** @class */ (function () {
    function Cache(maxSize) {
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
    Cache.prototype.create = function (key, value) {
        // Create a new instance of eviction cache. Max size can be determined later..........
        // const cache = new Cache<string>(size);
        // Create a new node to add
        var newNode = new EvictionNode(key, value);
        // IF there is no head of the linked list create one, same with the tai;
        this.map.set(key, newNode);
        if (!this.head) {
            this.head = newNode;
            if (!this.tail)
                this.tail = newNode;
        }
        // else we want to add a next node to our newNode, which should be the head of the Cache
        else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        // Check if the size of our eviction cache's cache is greater than the largest value. If so, delete the tail
        if (this.map.size > this.maxSize)
            this.deleteNode(this.tail);
        return newNode;
    };
    // Update the node when it is used and add it to the queue to be further from eviction(possibly not needed)
    Cache.prototype.deleteNode = function (node) {
        if (node === null)
            throw new Error('node is null');
        if (node.next === null) {
            node.prev.next = null;
            this.tail = node.prev;
        }
        else if (node.prev === null) {
            node.next.prev = null;
            this.head = node.next;
        }
        else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        this.map["delete"](node.key);
    };
    // Get a specific node from the linked list(to return from the cache)
    Cache.prototype.get = function (key) {
        var node = this.map.get(key);
        // if (this.head === null) return node;
        console.log(node);
        //if the node is at the head, simply return the value
        if (this.head === node)
            return node.value;
        //if node is at the tail, remove it from the tail
        if (this.tail === node) {
            this.tail = node.prev;
            node.prev.next = null;
            // if node is neither, remove it
        }
        else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        //move the current head down one in the LL, move the current node to the head
        this.head.prev = node;
        node.prev = null;
        node.next = this.head;
        this.head = node;
        return node.value;
    };
    //check if the cache has the key, only prupose if for semantic sugar
    Cache.prototype.includes = function (key) {
        return this.map.has(key);
    };
    return Cache;
}());
// Query method takes request, response and next callbacks
// as its arguments
Magnicache.prototype.query = function (req, res, next) {
    var _this = this;
    // get the body of the requested query
    var query = req.body.query;
    // parse the query into an AST
    var ast = parse(query).definitions[0];
    if (ast.selectionSet.selections[0].name.value === 'clearCache') {
        this.cache = new Cache(this.maxSize);
        res.locals.queryResponse = { cacheStatus: 'cacheCleared' };
        return next();
    }
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
                // console.log(this.cache);
                // proceed to execute the next callback
                return next();
            };
            var _loop_1 = function (query_1) {
                // check if query is already cached
                if (this_1.cache.includes(query_1)) {
                    // output message indicating that the query is cached
                    console.log('cache hit');
                    res.cookie('cacheStatus', 'hit');
                    console.log('cachestatus set hit on res');
                    // store the cached response
                    console.log('query response', this_1.cache.get(query_1));
                    queryResponses_1.push(this_1.cache.get(query_1));
                    // console.log(this.cache)
                    // check if all queries have been fetched
                    if (queries_2.length === queryResponses_1.length) {
                        // if yes, compile all queries
                        compileQueries_1();
                    }
                }
                else {
                    res.cookie('cacheStatus', 'miss');
                    console.log('cachestatsus set miss on Res');
                    // output message indicating that the query is missing
                    console.log('cache miss');
                    // execute the query against graphql
                    graphql({ schema: this_1.schema, source: query_1 })
                        .then(function (result) {
                        // cache the newest response
                        _this.cache.create(query_1, result);
                        // this.cache.set(Cache.prototype.createHead())
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
        this.cache = new Cache(this.maxSize);
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
