const { Pool } = require('pg');
const PG_URI =
  'postgres://cnnwoeyo:KbB0LqwnuaMtc8mLx26otpKQCgEl823N@salt.db.elephantsql.com/cnnwoeyo';

const pool = new Pool({
  connectionString: PG_URI,
});

module.exports = {
  query: (text, params, callback) => {
    // console.log(`executed query`, text);
    return pool.query(text, params, callback);
  },
};
