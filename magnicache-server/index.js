const graphql = require('graphql');

const magni = {};

magni.MagniCache = class {
  //class, constructor fn; and then we have methods
  constructor(schema) {
    this.schema = schema;
    this.query = this.query.bind(this);
  }

  query(req, res, next) {
    console.log('schema', this.schema);
    graphql({ schema: this.schema, source: req.body.query })
      .then((result) => {
        console.log(result);
        res.locals.queryResponse = result;
        return next();
      })
      .catch((err) => {
        return next({
          err: err,
        });
      });
    // console.log(req.body.query);
    // res.locals.queryResponse = req.body.query;
    // return next();
  }
};

module.exports = magni;
