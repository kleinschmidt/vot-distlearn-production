var PubSub = require('pubsub-js')
  , $ = require('jquery')
  , Promise = require('bluebird')
  , R = require('ramda')
  ;

// wrap jquery ajax in a bluebird promise
function ajax(params) {
    return Promise.resolve($.ajax(params));
}

// notify server of changes in status

// takes experiment as context
module.exports = function(e) {

    e.status = 'initialized';

    return function update_status(status, params) {
        // store status on experiment object
        e.status = status;
        // update status via PUT status/:status?workerId=...
        return ajax(R.merge({
            url: 'status/' + status,
            data: e.urlparams,
            async: true,
            method: 'PUT'
        }, params));
    };
    
};
