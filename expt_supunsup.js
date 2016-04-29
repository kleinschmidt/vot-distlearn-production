var Experiment = require('./js-adapt/experimentControl2')
  , mturk_helpers = require('./js-adapt/mturk_helpers')
  , ui = require('./js-adapt/ui.js')
  , $ = require('jquery')
  , Promise = require('bluebird')
  , retry = require('bluebird-retry')
  , PubSub = require('pubsub-js')
  ;

window.respDelim = ';';

var e;


// create a global variable for the visual world block object
var vwb;

$(document).ready(
    function() {

        // create an experiment object with the necessary RSRB metadata
        e = new Experiment(
            {
                rsrbProtocolNumber: 'RSRB00045955',
                rsrbConsentFormURL: 'https://www.hlp.rochester.edu/consent/RSRB45955_Consent_2015-02-10.pdf'
            }
        );

        e.init();

        ////////////////////////////////////////////////////////////////////////
        // status progression:
        //   0. initialized (on load),
        var status = require('./client/status.js')(e);
        
        //   1. started (first trial)
        PubSub.subscribe('trials_starting', function() {
            console.log('Trials starting');
            status.update('started')
                .then(function(d) {console.log(d);});
        });

        //   2. finished (last trial)
        PubSub.subscribe('trials_ended', function() {
            console.log('Trials ended');
            status.update('finished');
        });

        //   3. submitted (posted to amazon)
        $("#mturk_form").submit(function() {
            var form = this;
            console.log("Submit event intercepted");
            retry(function() {return status.update('submitted');},
                  {interval: 1000, timeout: 5000})
                .finally(function() {
                    console.log("Submitting now");
                    form.submit();
                });
            // block submission until ajax callback.
            return false;
        });
        
        //   4. abandoned (started but not submitted)
        window.onbeforeunload = function() {
            if (e.status != 'submitted' && e.status != 'initialized') {
                status.update('abandoned', {async: false});
            }
        };
        
        ////////////////////////////////////////////////////////////////////////
        // Instructions

        // experiment intro and overall instructions
        var instructions = require('./blocks/instructions.js')(e);

        ////////////////////////////////////////////////////////////////////////
        // add blocks and run
        // only show instructions on non-debug mode
        if (! e.debugMode) {
            e.addBlock({block: instructions,
                        onPreview: true});
        }

        if (! e.previewMode) {
            function getCondition() {
                return Promise.resolve($.ajax({
                    dataType: 'json',
                    url: 'condition',
                    data: e.urlparams,
                    async: true
                }));
            };

            var vwb = getCondition()
                    .then(function(conditions) {
                        console.log('Received condition:', conditions);
                        return require('./blocks/visworld.js')(conditions);
                    })
                    .catch(function(errResp) {
                        var err = errResp.responseJSON;
                        ui.errorMessage(err);
                        if (err.error == 'worker_status_error') {
                            $('div.error > h1').after('<p>' + 
                                                      status.messages[err.data.status] + 
                                                      '</p>');
                        }
                    });

            // add promise as block
            e.addBlock({block: vwb,
                        onPreview: false});

        }
        
        e.nextBlock();
        
    });
