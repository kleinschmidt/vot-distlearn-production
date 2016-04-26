var db = require('./db.js')
  , R = require('ramda')
  ;

// Returns a promise which resolves to an array of list id counts:
// { list_id: <n>, count: <n> }
function assignments_per_list_id() {
    return db('assignments')
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
    // console.log('Count to go', target_count-db_count, 'list:', list);
    return target_count - db_count;
});

module.exports = function list_balancer_factory(lists) {
    // generate a function to yield conditions that balance lists.
    //
    // lists is an array of objects with id, condition obj, and optional count 
    // (number of repetitions:
    // { list_id: <n>, condition: {...}[, count: <n>] }
    return function list_balancer(optional_list_id) {
        if (typeof(optional_list_id) !== 'undefined') {
            return R.filter(R.propEq('list_id', optional_list_id), lists);
        } else {
            return assignments_per_list_id()
                .then(function(db_counts) {
                    // find the list with the biggest gap between number of
                    // assignments in the db with that list_id and the request
                    // number of assignments.
                    return R.reduce(R.maxBy(count_to_go(db_counts)), R.head(lists), R.tail(lists));
                    // TODO: pre-compute count to go?
                });
        }
    };
};

assignments_per_list_id().then(console.log);
