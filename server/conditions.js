// /condition route: handle assignment of workers to conditions
// responds with JSON of condition data, or an error.

var db = require('./db.js')
  , balancer = require('./list_balancer.js')
  , R = require('ramda')
  ;

/*
 * 1. Look up workerId in db
 * 2. If exists, return error message
 * 3. If doesn't exist, send JSON with condition and save in db
 */

var conditions = {
    0: {
        'mean_vots': {'b': 0, 'p': 60},
        'supunsup': 'unsupervised'
    }
};

// TODO: replace this with bookcase.js Model.extend
function Assignment(obj) {
    var a = R.pickAll(['workerId', 'assignmentId', 'hitId', 'list_id'], obj);
    a.startTime = new Date();
    return a;
}



// given a request with a query string, send a JSON object with condition 
// information for this assignment
module.exports = function condition_middleware(req, res) {
    if (req.preview_mode) {
        res.json({ "preview": true });
    } else {
        // check for existing record for this worker
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
                    res
                        .status(500)
                        .json({'error': true, 
                               'message': "Existing record for worker"
                              });
                } else {
                    // TODO: pick condition to actually balance lists
                    var condition_id = 0;
                    res.json(conditions[condition_id]);
                    db('assignments')
                        .returning('workerId')
                        .insert(new Assignment(R.merge({list_id: condition_id}, 
                                                       req.query)
                                              ))
                        .then(function(id) {
                            console.log("saved record for worker:", id);
                        })
                        .catch(function(err) {
                            console.log("ERROR!!", err);
                        });
                }
            });
    }
};


