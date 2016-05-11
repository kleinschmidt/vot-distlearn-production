
// route to handle status updates

var db = require('./db.js')
  , Assignment = require('./assignment.js')
  , R = require('ramda')
  , logger = require('./logger')
  ;

var valid_status = ['assigned',  // condition assigned
                    'abandoned_before_start',
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

    logger.info('Updating status to "%s"', new_status, asgn);

    if (status_is_valid(new_status)) {
        // TODO: check for current status, to prevent updating started+ to
        // abandoned_before_start
    
        db('assignments')
            .where(asgn)
            .returning('status')
            .update('status', new_status)
            .tap(function(status) {
                logger.verbose('Updated status in db to "%s"',
                               status, asgn);
            })
            .then(function(status) {res.send(status);})
            .catch(function(err) {
                logger.error('Error updating status in db', err);
                next(err);
            });
        
    } else {
        next({ error: 'invalid_status_update', 
               message: 'Invalid status:' + new_status,
               status: new_status });
    }

};
