
// route to handle status updates

var db = require('./db.js')
  , Assignment = require('./assignment.js')
  ;

module.exports = function(req, res, next) {
    var asgn = Assignment(req.body);
    var new_status = req.params.status;
    console.log('Request to update status to', new_status, 
                'received with body', asgn);

    db('assignments')
        .where(asgn)
        .returning('status')
        .update('status', new_status)
        .then(function(status) {res.send(status);})
        .catch(next);
    
};
