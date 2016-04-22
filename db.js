var env = process.env.NODE_ENV || 'development'
  , config = require('./knexfile.js')
  , knex = require('knex')(config[env])
  ;

knex.migrate.latest([config]);

module.exports = knex;

