const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');
const { parse } = require('graphql/language/parser');

const magni = {};

magni.MagniCache = class {
  constructor(schema) {
    this.schema = schema;
    this.cache = new Map();
    this.query = this.query.bind(this);
  }

  /*
{allMessages(id:4){message}}
{messageById(id:21,name:john){message}}
*/

  // use parse() to deconstruct queries and execute them asyncronously
  // store each individial query in cache
  // reconstruct response and send it back to the client
  // profit $$$

  query(req, res, next) {
    const { query } = req.body;
    const AST = parse(query); // parse() gives us an abstract syntax tree
    const { definitions } = AST;
    const [ast] = definitions;

    if (ast.operation === 'query') {
      const queries = [];
      // parser function will create individual, normalized queries
      const parser = (selection, queryArray = []) => {
        for (const el of selection) {
          queryArray.push(el.name.value);
          if (el.arguments?.length > 0) {
            const argumentArray = [];

            for (const argument of el.arguments) {
              argumentArray.push(
                `${argument.name.value}:${argument.value.value}`
              );
            }
            //['id:4','name:john']
            queryArray.push([argumentArray.join(',')]);
          }
          if (el.selectionSet) {
            parser(el.selectionSet.selections, queryArray);
          } else {
            let string = ``;
            //{allMessages(id:4){message}}
            console.log('queryArray:', queryArray);

            // Ex:  ['messageById', ['id:4'], ['name:yousuf'], 'message']
            // would give {messageById(id:4,name:yousuf){message}}
            for (let i = queryArray.length - 1; i >= 0; i--) {
              if (Array.isArray(queryArray[i])) {
                string = `(${queryArray[i][0]})${string}`;
              } else {
                string = `{${queryArray[i] + string}}`;
              }
            }
            queries.push(string);
          }
          queryArray.pop();
        }
      };

      parser(ast.selectionSet.selections);
      console.log('queries:', queries);
      const queryResponses = [];

      // this compileQueries function needs work -> currently it is not compiling all of our queries because each messageById value is an array?
      const compileQueries = () => {
        // console.log(Object.assign({}, ...queryResponses));
        let response = {};
        // maybe try lodash
        for (const el of queryResponses) {
          response = Object.assign(response, el);
          console.log(JSON.stringify(response));
        }

        res.locals.queryResponse = response;
        console.log(this.cache);
        return next();
      };

      for (const query of queries) {
        if (this.cache.has(query)) {
          console.log('cache hit');
          queryResponses.push(this.cache.get(query));
          if (queries.length === queryResponses.length) {
            // console.log(queryResponses);
            compileQueries();
          }
        } else {
          console.log('cache miss');
          graphql({ schema: this.schema, source: query })
            .then((result) => {
              this.cache.set(query, result);
              queryResponses.push(result);
              if (queries.length === queryResponses.length) {
                // console.log(queryResponses);
                compileQueries();
              }
            })
            .catch((err) => {
              return next({
                log: err,
              });
            });
        }
      }

      // not a query!!
    } else {
      console.log('this is a mutation');
    }
  }
};

module.exports = magni;
