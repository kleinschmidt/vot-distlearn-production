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

    this.update = function(status, params) {
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

    this.messages = {
        'abandoned': 'It looks like you started this experiment and then closed or reloaded the page. Unfortunately, we can\'t accept your data at this point, so please return the HIT and contact us.',
        'submitted': 'It looks like you\'ve already submitted a version of this experiment. Thanks for participating!',
        'started': 'It looks like you\'ve already started this experiment before. Unfortunately, we can\'t accept your data at this point. If the HIT is still active, please return it and contact us.',
        'finished': 'It looks like you\'ve already started this experiment before. Unfortunately, we can\'t accept your data at this point. If the HIT is still active, please return it and contact us.'
    };

    return this;
    
};
