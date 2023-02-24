const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require('graphql');

const magni = {};

magni.MagniCache = class {
  //class, constructor fn; and then we have methods

  constructor(schema) {
    this.schema = schema;
    this.query = this.query.bind(this);
  }

  query(req, res, next) {
    console.log('query', req.body);
    graphql({ schema: this.schema, source: req.body.query })
      .then((result) => {
        // console.log(result);
        res.locals.queryResponse = result;
        // res.locals.queryResponse = 'test';

        return next();
      })
      .catch((err) => {
        // console.log(err);
        return next({
          log: err,
          // message: { err: err },
        });
      });
    // console.log(req.body.query);
    // res.locals.queryResponse = req.body.query;
    // return next();
  }
};

module.exports = magni;
