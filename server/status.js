
// route to handle status updates

var db = require('./db.js')
  , Assignment = require('./assignment.js')
  , R = require('ramda')
  ;

var valid_status = ['assigned',  // condition assigned
                    'started',   // trials started
                    'finished',  // trials finished
                    'submitted', // submitted to amazon
                    'accepted',  // NOT USED: HIT approved
                    'returned',  // NOT USED: HIT returned
                    'abandoned', // window reloaded or closed
                    'rejected']; // NOT USED: HIT rejected

var status_is_valid = R.contains(R.__, valid_status);

module.exports = function(req, res, next) {
    var asgn = Assignment(req.body);
    var new_status = req.params.status;

    console.log('Request to update status to', new_status, 
                'received with body', asgn);

    if (status_is_valid(new_status)) {
    
        db('assignments')
            .where(asgn)
            .returning('status')
            .update('status', new_status)
            .then(function(status) {res.send(status);})
            .catch(next);
        
    } else {
        next({ error: 'invalid_status_update', 
               message: 'Invalid status:' + new_status,
               status: new_status });
    }

};
