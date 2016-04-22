// configuration for database connection via knex

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'bp_adapt_dev'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'bp_adapt'
    }
  }
  
};
