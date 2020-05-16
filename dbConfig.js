require('dotenv').config();

const { Pool } = require('pg');
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPassword}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});


module.exports = { pool };