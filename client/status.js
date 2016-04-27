var PubSub = require('pubsub-js')
  , $ = require('jquery')
  , Promise = require('bluebird')
  ;

// wrap jquery ajax in a bluebird promise
function ajax(params) {
    return Promise.resolve($.ajax(params));
}

// notify server of changes in status

// takes experiment as context
module.exports = function(e) {

    // update status via PUT status/:status?workerId=...
    return function update_status(status) {
        return ajax({
            url: 'status/' + status,
            data: e.urlparams,
            async: true,
            method: 'PUT'
        });
    };
    
};
