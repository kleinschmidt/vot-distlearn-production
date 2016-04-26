// /condition route: handle assignment of workers to conditions
// responds with JSON of condition data, or an error.

var db = require('./db.js')
  , ListBalancer = require('./list_balancer.js')
  , R = require('ramda')
  ;

/*
 * 1. Look up workerId in db
 * 2. If exists, return error message
 * 3. If doesn't exist, send JSON with condition and save in db
 */


// TODO: replace this with bookcase.js Model.extend
function Assignment(obj) {
    var a = R.pickAll(['workerId', 'assignmentId', 'hitId', 'list_id'], obj);
    a.startTime = new Date();
    return a;
}

// given a request with a query string, send a JSON object with condition 
// information for this assignment
module.exports = function(lists) {
    var list_balancer = ListBalancer(lists);
    return function assign_condition(req, res, next) {
        // check for existing record for this worker
        req.query.workerId || next({ error: 'Missing workerId in request' });
        
        db('assignments')
            .select()
            .where('workerId', req.query.workerId)
            .then(function(workers) {
                if (workers.length) {
                    // existing record for worker
                    console.log("existing record for worker:", 
                                req.query.workerId);
                    // TODO: check whether they've actually STARTED the experiment
                    // (add route to signal that and callback in script)
                    next({ error: "Existing record for worker" });
                } else {
                    list_balancer()
                        .then(function(list) {
                            res.json(list.condition);
                            return list.list_id;
                        })
                        .tap(R.curryN(4, console.log)('Worker',
                                                      req.query.workerId, 
                                                      'assigned list'))
                        .then(function(list_id) {
                            return db('assignments')
                                .returning('workerId')
                                .insert(new Assignment(R.merge({list_id: list_id}, 
                                                               req.query)
                                                      ));
                        })
                        .catch(function(err) {
                            next(err);
                        });
                }
            });
    };

};
