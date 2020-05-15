require('dotenv').config()
module.exports = 
{
  development: {
    username: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: "budget_tracker",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false
  },
  production: {
    username: process.env.PG_USER,
    password: process.env.PG_PASS,
    database: "budget_tracker",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  }
}
