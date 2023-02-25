"use strict";
exports.__esModule = true;
var _a = require('graphql'), graphql = _a.graphql, GraphQLSchema = _a.GraphQLSchema, GraphQLObjectType = _a.GraphQLObjectType, GraphQLString = _a.GraphQLString;
var parse = require('graphql/language/parser').parse;
function Magnicache(schema) {
    this.schema = schema;
    this.cache = new Map();
    this.query = this.query.bind(this);
}
Magnicache.prototype.query = function (req, res, next) {
    var _this = this;
    var query = req.body.query;
    var AST = parse(query); // parse() gives us an abstract syntax tree
    var definitions = AST.definitions;
    var ast = definitions[0];
    if (ast.operation === 'query') {
        var queries_2 = this.magniParser(ast.selectionSet.selections);
        console.log('queries', queries_2);
        var queryResponses_1 = [];
        // this compileQueries function needs work -> currently it is not compiling all of our queries because each messageById value is an array?
        var compileQueries_1 = function () {
            console.log('compiling queries....');
            // console.log(Object.assign({}, ...queryResponses));
            var response = {};
            // maybe try lodash
            for (var _i = 0, queryResponses_2 = queryResponses_1; _i < queryResponses_2.length; _i++) {
                var queryResponse = queryResponses_2[_i];
                response = Object.assign(response, queryResponse);
                console.log(JSON.stringify(response));
            }
            res.locals.queryResponse = response;
            console.log(_this.cache);
            return next();
        };
        var _loop_1 = function (query_1) {
            if (this_1.cache.has(query_1)) {
                console.log('cache hit');
                queryResponses_1.push(this_1.cache.get(query_1));
                if (queries_2.length === queryResponses_1.length) {
                    // console.log(queryResponses);
                    compileQueries_1();
                }
            }
            else {
                console.log('cache miss');
                graphql({ schema: this_1.schema, source: query_1 })
                    .then(function (result) {
                    console.log('qRes;', queryResponses_1);
                    console.log('result;', result);
                    _this.cache.set(query_1, result);
                    queryResponses_1.push(result);
                    if (queries_2.length === queryResponses_1.length) {
                        compileQueries_1();
                    }
                })["catch"](function (err) {
                    console.log(err);
                    return next({
                        log: err
                    });
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, queries_1 = queries_2; _i < queries_1.length; _i++) {
            var query_1 = queries_1[_i];
            _loop_1(query_1);
        }
        // not a query!!
    }
    else {
        console.log('this is a mutation');
    }
};
Magnicache.prototype.magniParser = function (selections, queryArray, queries) {
    var _a;
    if (queryArray === void 0) { queryArray = []; }
    if (queries === void 0) { queries = []; }
    console.log('parsing');
    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
        var selection = selections_1[_i];
        queryArray.push(selection.name.value);
        if (((_a = selection.arguments) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            var argumentArray = [];
            for (var _b = 0, _c = selection.arguments; _b < _c.length; _b++) {
                var argument = _c[_b];
                argumentArray.push("".concat(argument.name.value, ":").concat(argument.value.value));
            }
            //['id:4','name:john']
            queryArray.push([argumentArray.join(',')]);
        }
        if (selection.selectionSet) {
            this.magniParser(selection.selectionSet.selections, queryArray, queries);
        }
        else {
            var string = "";
            //{allMessages(id:4){message}}
            console.log('queryArray:', queryArray);
            // Ex:  ['messageById', ['id:4'], ['name:yousuf'], 'message']
            // would give {messageById(id:4,name:yousuf){message}}
            for (var i = queryArray.length - 1; i >= 0; i--) {
                if (Array.isArray(queryArray[i])) {
                    string = "(".concat(queryArray[i][0], ")").concat(string);
                }
                else {
                    string = "{".concat(queryArray[i] + string, "}");
                }
            }
            queries.push(string);
        }
        queryArray.pop();
    }
    return queries;
};
module.exports = Magnicache;
