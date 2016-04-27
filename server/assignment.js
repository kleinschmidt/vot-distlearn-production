var R = require('ramda');

// TODO: replace this with bookcase.js Model.extend
module.exports = function Assignment(obj) {
    var a = R.pick(['workerId', 'assignmentId', 'hitId', 'list_id'], obj);
    return a;
};
