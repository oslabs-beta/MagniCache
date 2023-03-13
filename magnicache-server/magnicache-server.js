"use strict";
exports.__esModule = true;
var graphql = require('graphql').graphql;
var parse = require('graphql/language/parser').parse;
var mergeWith = require("lodash.mergewith");
var IntrospectionQuery = require('./IntrospectionQuery').IntrospectionQuery;
// TODO?: type "this" more specifically
// TODO?: add query type to linked list => refactor mutations
// TODO?: rename EvictionNode => Node
// TODO?: put Cache.validate on Magnicache prototype, only store schema once
function Magnicache(schema, maxSize) {
    if (maxSize === void 0) { maxSize = 100; }
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
        AvgCacheTime: 0,
        AvgMissTime: 0,
        AvgMemAccTime: 0
    };
    // bind method(s)
    this.query = this.query.bind(this);
    this.schemaParser = this.schemaParser.bind(this);
}
// linked list node constructor
var EvictionNode = /** @class */ (function () {
    function EvictionNode(key, value) {
        this.key = key;
        this.value = value;
        this.next = null;
        this.prev = null;
    }
    return EvictionNode;
}());
// linked list constructor
var Cache = /** @class */ (function () {
    function Cache(maxSize, schema) {
        this.maxSize = maxSize;
        this.map = new Map();
        this.head = null;
        this.tail = null;
        this.schema = schema;
        // method binding
        this.create = this.create.bind(this);
        this["delete"] = this["delete"].bind(this);
        this.get = this.get.bind(this);
        this.includes = this.includes.bind(this);
    }
    // insert a node at the head of the list && if maxsize is reached, evict least recently used node
    Cache.prototype.create = function (key, value) {
        // Create a new node
        var newNode = new EvictionNode(key, value);
        // add node to map
        this.map.set(key, newNode);
        // if linked list is empty, set at head && tail
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            // otherwise add new node at head of list
        }
        else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        // check cache size, prune tail if necessary
        if (this.map.size > this.maxSize)
            this["delete"](this.tail);
        return newNode;
    };
    // remove node from linked list
    Cache.prototype["delete"] = function (node) {
        // SHOULD NEVER RUN: delete should only be invoked when node is known to exist
        if (node === null)
            throw new Error('ERROR in MagniCache.cache.delete: node is null');
        if (node.next === null && node.prev === null) {
            this.head = null;
            this.tail = null;
            // if node is at tail
        }
        else if (node.next === null) {
            node.prev.next = null;
            this.tail = node.prev;
            // if node is at head
        }
        else if (node.prev === null) {
            node.next.prev = null;
            this.head = node.next;
            // if node is not head of tail;
        }
        else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        // remove node from map
        this.map["delete"](node.key);
    };
    // retrieve node from linked list
    Cache.prototype.get = function (key) {
        var node = this.map.get(key);
        // SHOULD NEVER RUN: get should only be invoked when node is known to exist
        if (node === null)
            throw new Error('ERROR in MagniCache.cache.get: node is null');
        // if the node is at the head, simply return the value
        if (this.head === node)
            return node.value;
        // if node is at the tail, remove it from the tail
        if (this.tail === node) {
            this.tail = node.prev;
            node.prev.next = null;
            // if node is neither, remove it
        }
        else {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }
        // move the current head down one in the LL, move the current node to the head
        this.head.prev = node;
        node.prev = null;
        node.next = this.head;
        this.head = node;
        return node.value;
    };
    Cache.prototype.validate = function (node) {
        var _this = this;
        if ((node === null || node === void 0 ? void 0 : node.key) === null)
            throw new Error('ERROR in MagniCache.cache.validate: invalid node');
        graphql({ schema: this.schema, source: node.key })
            .then(function (result) {
            if (!result.error) {
                node.value = result;
            }
            else {
                _this["delete"](node);
            }
        })["catch"](function (err) {
            throw new Error('ERROR in MagniCache.cache.validate: error executing graphql query');
        });
        return;
    };
    // syntactic sugar to check if cache has a key
    Cache.prototype.includes = function (key) {
        return this.map.has(key);
    };
    // syntactic sugar to get linked list length
    Cache.prototype.count = function () {
        return this.map.size;
    };
    return Cache;
}());
// used in middleware chain
Magnicache.prototype.query = function (req, res, next) {
    var _this = this;
    // get graphql query from request body
    var query = req.body.query;
    // parse the query into an AST, deconstructing the part we use
    var ast = parse(query).definitions[0];
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
                .then(function (result) {
                res.locals.queryResponse = result;
                return next();
            })["catch"](function (err) {
                throw new Error('ERROR executing graphql query' + JSON.stringify(err));
            });
        }
        else {
            // parse the ast into usable graphql querys
            var queries_2 = this.magniParser(ast.selectionSet.selections);
            var queryResponses_1 = [];
            // compile all queryResponses into one object that is return to requester
            var compileQueries_1 = function () {
                // merge all responses into one object
                var response = {};
                for (var _i = 0, queryResponses_2 = queryResponses_1; _i < queryResponses_2.length; _i++) {
                    var queryResponse = queryResponses_2[_i];
                    response = mergeWith(response, queryResponse);
                }
                // assign the combined result to the response locals
                res.locals.queryResponse = response;
                return next();
            };
            // calculate the average memory access time
            var calcAMAT_1 = function () {
                // calculate cache hit rate
                var hitRate = _this.metrics.totalHits /
                    (_this.metrics.totalHits + _this.metrics.totalMisses);
                // calculate average memory access time and update metrics object
                _this.metrics.AvgMemAccTime = Math.round(hitRate * _this.metrics.AvgCacheTime +
                    (1 - hitRate) * _this.metrics.AvgMissTime);
                // Return the calculated metric
                return _this.metrics.AvgMemAccTime;
            };
            var _loop_1 = function (query_1) {
                // check if query is already cached
                if (this_1.cache.includes(query_1)) {
                    // add a cookie indicating that the cache was hit
                    // will be overwritten by any following querys
                    res.cookie('cacheStatus', 'hit');
                    // update the metrics with a hit count
                    this_1.metrics.totalHits++;
                    // Start a timter
                    var hitStart = Date.now();
                    // retrieve the data from cache and add to queryResponses array
                    queryResponses_1.push(this_1.cache.get(query_1));
                    // check if all queries have been fetched
                    if (queries_2.length === queryResponses_1.length) {
                        // compile all queries
                        compileQueries_1();
                    }
                    // calculate the hit time
                    var hitTime = Math.floor(Date.now() - hitStart);
                    // update the metrics object
                    this_1.metrics.AvgCacheTime = Math.round((this_1.metrics.AvgCacheTime + hitTime) / this_1.metrics.totalHits);
                }
                else {
                    // start the miss timer
                    var missStart_1 = Date.now();
                    // execute the query
                    graphql({ schema: this_1.schema, source: query_1 })
                        .then(function (result) {
                        // if no error, cache response
                        if (!result.err)
                            _this.cache.create(query_1, result);
                        // update the metrics with the new size
                        _this.metrics.cacheUsage = _this.cache.count();
                        // store the query response
                        queryResponses_1.push(result);
                    })
                        // update miss time as well as update the average memory access time
                        .then(function () {
                        // add a cookie indicating that the cache was missed
                        res.cookie('cacheStatus', 'miss');
                        // update the metrics with a missCount
                        _this.metrics.totalMisses++;
                        _this.sizeLeft = _this.maxSize - _this.metrics.cacheUsage;
                        var missTime = Date.now() - missStart_1;
                        _this.metrics.AvgMissTime =
                            (_this.metrics.AvgMissTime + missTime) /
                                _this.metrics.totalMisses;
                        console.log('calc res', calcAMAT_1());
                        // check if all queries have been fetched
                        if (queries_2.length === queryResponses_1.length) {
                            // compile all queries
                            compileQueries_1();
                        }
                    })["catch"](function (err) {
                        throw new Error('ERROR executing graphql query' + JSON.stringify(err));
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
        // if not a query
    }
    else if (ast.operation === 'mutation') {
        // first execute mutation normally
        graphql({ schema: this.schema, source: query })
            .then(function (result) {
            res.locals.queryResponse = result;
            return next();
        })
            .then(function () {
            // get all mutation types, utilizing a set to avoid duplicates
            var mutationTypes = new Set();
            for (var _i = 0, _a = ast.selectionSet.selections; _i < _a.length; _i++) {
                var mutation = _a[_i];
                var mutationName = mutation.name.value;
                mutationTypes.add(_this.schemaTree.mutations[mutationName]);
            }
            // for every mutation type, get every corresponding query type
            mutationTypes.forEach(function (mutationType) {
                var userQueries = new Set();
                for (var query_2 in _this.schemaTree.queries) {
                    var type = _this.schemaTree.queries[query_2];
                    if (mutationType === type)
                        userQueries.add(query_2);
                }
                userQueries.forEach(function (query) {
                    for (var currentNode = _this.cache.head; currentNode !== null; currentNode = currentNode.next) {
                        if (currentNode.key.includes(query)) {
                            _this.cache.validate(currentNode);
                        }
                    }
                });
            });
        })["catch"](function (err) {
            throw new Error('ERROR executing graphql mutation' + JSON.stringify(err));
        });
    }
};
// invoked with AST as an argument, returns an array of graphql schemas
Magnicache.prototype.magniParser = function (selections, queryArray, queries) {
    if (queryArray === void 0) { queryArray = []; }
    if (queries === void 0) { queries = []; }
    // Looping through the selections to build the queries array
    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
        var selection = selections_1[_i];
        // add current query to queryArray
        queryArray.push(selection.name.value);
        // if a query has arguments, format and add to query array
        if (selection.arguments.length > 0) {
            var argumentArray = [];
            // looping through the arguments to add them to the argument array
            for (var _a = 0, _b = selection.arguments; _a < _b.length; _a++) {
                var argument = _b[_a];
                argumentArray.push("".concat(argument.name.value, ":").concat(argument.value.value));
            }
            queryArray.push([argumentArray.join(',')]);
        }
        // if there is a selectionSet property, there are more deeply nested queries
        if (selection.selectionSet) {
            // recursively invoke magniParser passing in selections array
            this.magniParser(selection.selectionSet.selections, queryArray, queries);
        }
        else {
            var queryString = "";
            // if query array looks like this: ['messageById', ['id:4'], 'message']
            // formated query will look like this: {allMessages(id:4){message}}
            // looping through the query array in reverse to build the query string
            for (var i = queryArray.length - 1; i >= 0; i--) {
                // arguments are put into an array and need to be formatted differently
                if (Array.isArray(queryArray[i])) {
                    queryString = "(".concat(queryArray[i][0], ")").concat(queryString);
                }
                else {
                    queryString = "{".concat(queryArray[i] + queryString, "}");
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
    // refactor to be able to take on nested types (GraphQLListType)
    /*
    {
    queries:{
     fieldName:[types],
     allMessages:[Messages,Users]
    }
    mutations:
    }
    */
    var schemaTree = {
        queries: {},
        mutations: {}
    };
    var typeFinder = function (type) {
        console.log('field', type);
        if (type.name === null)
            return typeFinder(type.ofType);
        return type.name;
    };
    // TODO: Type the result for the schema
    graphql({ schema: this.schema, source: IntrospectionQuery })
        .then(function (result) {
        // console.log(result.data.__schema.queryType);
        for (var _i = 0, _a = result.data.__schema.queryType.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            schemaTree.queries[field.name] = typeFinder(field.type);
        }
        for (var _b = 0, _c = result.data.__schema.mutationType.fields; _b < _c.length; _b++) {
            var field = _c[_b];
            schemaTree.mutations[field.name] = typeFinder(field.type);
        }
    })
        .then(function () {
        console.log('schemaTree', schemaTree);
    })["catch"](function (err) {
        throw new Error("ERROR executing graphql query" + JSON.stringify(err));
    });
    return schemaTree;
};
module.exports = Magnicache;
