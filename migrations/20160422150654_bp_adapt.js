
exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTable('assignments', function(table) {
      table.string('assignmentId');
      table.string('workerId');
      table.string('hitId');
      table.dateTime('startTime');
      table.integer('list_id');
      table.timestamps();         // created_at and updated_at timestamps
      table.increments();
    })

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.dropTable('assignments')

  ]);
};
