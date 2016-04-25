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

var lists = [
    {
        'list_id': 0,
        'condition': {
            'mean_vots': {'b': 0, 'p': 60},
            'supunsup': 'unsupervised'
        }
    }, 
    {
        'list_id': 1,
        'condition': {
            'mean_vots': {'b': 10, 'p': 60},
            'supunsup': 'unsupervised'
        }
    }, 
    {
        'list_id': 2,
        'condition': {
            'mean_vots': {'b': 10, 'p': 70},
            'supunsup': 'unsupervised'
        }
    }
];


// TODO: replace this with bookcase.js Model.extend
function Assignment(obj) {
    var a = R.pickAll(['workerId', 'assignmentId', 'hitId', 'list_id'], obj);
    a.startTime = new Date();
    return a;
}

var list_balancer = ListBalancer(lists);

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
                    var list_id = 0;
                    var list = R.filter(R.propEq('list_id', list_id), lists);

                    list_balancer()
                        .then(function(list) {
                            res.json(list.condition);
                            return list.list_id;
                        })
                        .then(function(list_id) {
                            console.log('Worker', req.query.workerId, 'assigned list', list_id);
                            return db('assignments')
                                .returning('workerId')
                                .insert(new Assignment(R.merge({list_id: list_id}, 
                                                               req.query)
                                                      ));
                        })
                        .catch(function(err) {
                            console.log("ERROR!!", err);
                        });
                }
            });
    }
};


