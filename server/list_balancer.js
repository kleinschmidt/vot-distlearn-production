var db = require('./db.js')
  , R = require('ramda')
  , logger = require('./logger')
  ;

// status codes for assignments that are NOT occupying a list item
var excluded_statuses = ['returned', 'abandoned', 'abandoned_before_start',
                         'rejected'];

// Returns a promise which resolves to an array of list id counts:
// { list_id: <n>, count: <n> }
function assignments_per_list_id(where_obj) {
    if (typeof where_obj === 'undefined') {
        where_obj = {};
    }
    return db('assignments')
        .where('status', 'not in', excluded_statuses)
        .where(where_obj)
        .select('list_id')
        .groupBy('list_id')
        .count()
        .map(function(result) {
            // postgres uses a BigInt type which knex treats as a string
            result.count = parseInt(result.count);
            return result;
        });
}

// get count-to-go for one list, based on counts returned from the db.
var count_to_go = R.curry(function(db_counts, list) {
    var id = list.list_id;
    var db_res = R.filter(R.propEq('list_id', list.list_id), db_counts);
    var db_count = db_res[0] ? db_res[0].count : 0;
    var target_count = list.count ? list.count : 0;
    logger.debug('Count to go %d (list: %j)', target_count-db_count, list);
    return target_count - db_count;
});

module.exports = function list_balancer_factory(lists, assignment_filters) {

    assignments_per_list_id(assignment_filters).then(function(counts) {
        logger.info('List balancer:');
        logger.info('  Running lists:');
        R.map(function(l) {logger.info('   ', l);}, lists);
        logger.info('  Using assignment filters:', assignment_filters);
        logger.info('  Assignment counts in database:', counts);
    });

    // generate a function to yield conditions that balance lists.
    //
    // lists is an array of objects with id, condition obj, and optional count 
    // (number of repetitions:
    // { list_id: <n>, condition: {...}[, count: <n>] }
    return function list_balancer() {
        return assignments_per_list_id(assignment_filters)
            .then(function(db_counts) {
                // find the list with the biggest gap between number of
                // assignments in the db with that list_id and the request
                // number of assignments.
                return R.reduce(R.maxBy(count_to_go(db_counts)), R.head(lists), R.tail(lists));
                // TODO: pre-compute count to go?
            });
    };

};

