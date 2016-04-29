// configuration for database connection via knex

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'dkleinschmidt_dev',
      user: 'dkleinschmidt',
      password: require('./dkleinschmidt_pw'),
      host: '127.0.0.1'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'dkleinschmidt',
      user: 'dkleinschmidt',
      password: require('./dkleinschmidt_pw'),
      host: '127.0.0.1'
    }
  }
  
};
