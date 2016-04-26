var Experiment = require('./js-adapt/experimentControl2')
  , mturk_helpers = require('./js-adapt/mturk_helpers')
  , ui = require('./js-adapt/ui.js')
  , $ = require('jquery')
  , Promise = require('bluebird')
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
        // parse relevant URL parameters
        e.sandboxmode = mturk_helpers.checkSandbox(e.urlparams);
        e.previewMode = mturk_helpers.checkPreview(e.urlparams);
        e.debugMode = mturk_helpers.checkDebug(e.urlparams);
        
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
