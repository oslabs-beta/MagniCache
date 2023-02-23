const { graphql } = require('graphql');

const magni = {};

magni.MagniCache = class {
  constructor(schema) {
    this.schema = schema;
    this.cache = new Map();
    this.query = this.query.bind(this);
  }

  query(req, res, next) {
    const { query } = req.body;
    if (this.cache.has(query)) {
      console.log('cache hit');
      res.locals.queryResponse = this.cache.get(query);
      return next();
    } else {
      console.log('cache miss');
      graphql({ schema: this.schema, source: query })
        .then((result) => {
          this.cache.set(query, result);
          res.locals.queryResponse = result;
          return next();
        })
        .catch((err) => {
          return next({
            log: err,
          });
        });
    }
    // console.log(req.body.query);
    // res.locals.queryResponse = req.body.query;
    // return next();
  }
};

module.exports = magni;
