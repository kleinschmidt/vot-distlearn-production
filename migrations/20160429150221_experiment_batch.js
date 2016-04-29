
exports.up = function(knex, Promise) {
    return knex.schema.table('assignments', function(table) {
        table.string('experiment');
        table.string('batch');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('assignments', function(table) {
        table.dropColumn('experiment');
        table.dropColumn('batch');
    });
};
