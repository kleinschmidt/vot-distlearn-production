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
        var update_status = require('./client/status.js')(e);
        
        //   1. started (first trial)
        PubSub.subscribe('trials_starting', function() {
            console.log('Trials starting');
            update_status('started')
                .then(function(d) {console.log(d);});
        });

        //   2. finished (last trial)
        PubSub.subscribe('trials_ended', function() {
            console.log('Trials ended');
            update_status('finished');
        });

        //   3. submitted (posted to amazon)
        e.submit_callback = function() {
            // really try hard to update status on server...
            retry(function() {return update_status('submitted');},
                  {interval: 1000, timeout: 5000})
                .finally(function() {
                    // is this a dirty hack
                    Experiment.prototype.submit_callback();
                });
        };

        //   4. abandoned (started but not submitted)
        window.onbeforeunload = function() {
            if (e.status != 'submitted' && e.status != 'initialized') {
                update_status('abandoned', {async: false});
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
                    .catch(function(err) {
                        ui.errorMessage(err.responseJSON.error);
                    });

            // add promise as block
            e.addBlock({block: vwb,
                        onPreview: false});

        }
        
        e.nextBlock();
        
    });
