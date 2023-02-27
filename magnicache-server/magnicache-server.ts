const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');
const { parse } = require('graphql/language/parser');
import { Response, Request, NextFunction } from 'express';

function Magnicache(this: any, schema: any): void {
  this.schema = schema;
  this.cache = new Map();
  this.query = this.query.bind(this);
}

Magnicache.prototype.query = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { query } = req.body;
  const AST = parse(query); // parse() gives us an abstract syntax tree
  const { definitions } = AST;
  const [ast] = definitions;

  if (ast.operation === 'query') {
    const queries: string[] = this.magniParser(ast.selectionSet.selections);
    console.log('queries', queries);
    const queryResponses: {}[] = [];

    // this compileQueries function needs work -> currently it is not compiling all of our queries because each messageById value is an array?
    const compileQueries = () => {
      console.log('compiling queries....');
      // console.log(Object.assign({}, ...queryResponses));
      let response = {};
      // maybe try lodash
      for (const queryResponse of queryResponses) {
        response = Object.assign(response, queryResponse);
        // console.log(JSON.stringify(response));
      }

      res.locals.queryResponse = response;
      // console.log(this.cache);
      return next();
    };

    for (const query of queries) {
      if (this.cache.has(query)) {
        console.log('cache hit');
        res.cookie('cacheStatus', 'hit');
        console.log('cacheStatus set hit on Res');

        queryResponses.push(this.cache.get(query));
        if (queries.length === queryResponses.length) {
          // console.log(queryResponses);
          compileQueries();
        }
      } else {
        console.log('cache miss');
        res.cookie('cacheStatus', 'miss');
        console.log('cacheStatus set miss on Res');
        graphql({ schema: this.schema, source: query })
          .then((result: {}) => {
            this.cache.set(query, result);
            queryResponses.push(result);
            if (queries.length === queryResponses.length) {
              compileQueries();
            }
          })
          .catch((err: {}) => {
            console.log(err);
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
};

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
  console.log('parsing');
  for (const selection of selections) {
    queryArray.push(selection.name.value);
    if (selection.arguments?.length > 0) {
      const argumentArray: string[] = [];

      for (const argument of selection.arguments) {
        argumentArray.push(`${argument.name.value}:${argument.value.value}`);
      }
      //['id:4','name:john']
      queryArray.push([argumentArray.join(',')]);
    }
    if (selection.selectionSet) {
      this.magniParser(selection.selectionSet.selections, queryArray, queries);
    } else {
      let string = ``;
      //{allMessages(id:4){message}}
      // console.log('queryArray:', queryArray);

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
  return queries;
};

module.exports = Magnicache;
