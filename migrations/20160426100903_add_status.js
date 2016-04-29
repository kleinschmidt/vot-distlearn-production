
exports.up = function(knex, Promise) {
    return knex.schema.table('assignments', function(table) {
        table.string('status');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('assignments', function(table) {
        table.dropColumn('status');
    });
};
