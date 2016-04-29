// /condition route: handle assignment of workers to conditions
// responds with JSON of condition data, or an error.

var db = require('./db.js')
  , ListBalancer = require('./list_balancer.js')
  , R = require('ramda')
  , Assignment = require('./assignment.js')
  ;

/*
 * 1. Look up workerId in db
 * 2. If exists, return error message
 * 3. If doesn't exist, send JSON with condition and save in db
 */


function WorkerRecordError(msg) {
    this.message = msg;
};
WorkerRecordError.prototype = Object.create(Error.prototype);


// test whether a status is bad. add other forbidden statuses in array
var bad_status = R.contains(R.__, ['started', 'finished', 'abandoned', 'submitted']);
var status_of = R.pluck('status');
function check_workers(workers) {
    if (workers.length > 1) {
        throw new WorkerRecordError('Multiple records for worker');
    } else if (R.any(bad_status, status_of(workers))) {
        throw new WorkerRecordError('Existing record with status: ' + 
                                    status_of(workers));
    }
}

var get_first_list_id = R.pipe(R.pluck('list_id'), R.head);

// exports condition assigning middleware
module.exports = function(config) {

    var lists = config.lists;
  
    var get_balanced_list = ListBalancer(lists);
    var lists_by_id = R.indexBy(R.prop('list_id'), lists);

    // given a request with a query string, send a JSON object with condition 
    // information for this assignment
    return function assign_condition(req, res, next) {
        // check for existing record for this worker
        req.query.workerId || next({ error: 'Missing workerId in request' });

        var send_list_condition = function(list) {res.json(list.condition);};

        db('assignments')
            .select()
            .where('workerId', req.query.workerId)
            .tap(check_workers)
            .then(function(workers) {
                var list;
                if (workers.length) {
                    // old worker (with okay status): return assigned list
                    var list_id = get_first_list_id(workers);
                    list = lists_by_id[list_id];
                } else {
                    // new assignment: get balanced list and save
                    list = get_balanced_list();
                    list
                        .get('list_id')
                        .then(function(list_id) {
                            return db('assignments')
                                .returning('workerId')
                                .insert(R.merge({list_id: list_id,
                                                 experiment: config.experiment,
                                                 batch: config.batch,
                                                 startTime: new Date()}, 
                                                Assignment(req.query))
                                       );
                        });
                }
                return list;
            })
            .tap(send_list_condition)
            .get('list_id')
            .tap(R.curryN(4, console.log)('Worker',
                                          req.query.workerId, 
                                          'assigned list'))
            .catch(WorkerRecordError, function(err) {
                // existing record for worker
                console.error("existing record for worker:", 
                              req.query.workerId, err.message);
                throw { error: err.message }; // don't need stack trace etc.
            })
            .catch(next);
    };

};