const { Pool } = require("pg");
const connectionString =
  "postgres://cinyujcx:lJx4kqZRMvoIVg12Z8WcnKSojzfDQPUt@isilo.db.elephantsql.com/cinyujcx";
const pool = new Pool({
  connectionString,
  max: 5,
});

module.exports = {
  query: (text, params, callback) => {
    console.log("executed query", text);
    return pool.query(text, params, callback);
  },
};
