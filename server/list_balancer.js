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



module.exports = function list_balancer_factory(lists) {
    // generate a function to yield conditions that balance lists.
    //
    // lists is an array of objects with id, condition obj, and optional number
    // of repetitions:
    // { list_id: <n>, condition: {...}[, repetitions: <n>] }

};


assignments_per_list_id().then(console.log).catch(console.log);
