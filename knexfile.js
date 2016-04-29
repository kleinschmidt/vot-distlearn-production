// configuration for database connection via knex

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'dkleinschmidt_dev'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'dkleinschmidt',
      user: 'dkleinschmidt'
    }
  }
  
};
