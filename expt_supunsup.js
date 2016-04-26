var Experiment = require('./js-adapt/experimentControl2')
  , mturk_helpers = require('./js-adapt/mturk_helpers')
  , ui = require('./js-adapt/ui.js')
  , $ = require('jquery')
  , Promise = require('bluebird')
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
        
        // set up status handler
        var update_status = require('./client/status.js')(e);
        // update_status('testing');

        e.submit_callback = function() {
            update_status('submitted')
                .finally(function() {
                    e.prototype.submit_callback();
                });
        };
        
        PubSub.subscribe('familiarization_completed', function() {
            console.log('Familiarization completed');
        });

        PubSub.subscribe('trials_starting', function() {
            console.log('Trials starting');
            update_status('started')
                .then(function(d) {console.log(d);});
        });

        PubSub.subscribe('trials_ended', function() {
            console.log('Trials ended');
            update_status('finished');
        });

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
