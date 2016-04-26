var Experiment = require('./js-adapt/experimentControl2')
  , mturk_helpers = require('./js-adapt/mturk_helpers')
  , ui = require('./js-adapt/ui.js')
  , $ = require('jquery')
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
            $.ajax({
                dataType: 'json',
                url: 'condition',
                data: e.urlparams,
                async: true
            })
                .done(function(conditions) {
                    console.log('Received condition:', conditions);
                    var vwb = require('./blocks/visworld.js')(conditions);
                    e.addBlock({block: vwb,
                                onPreview: false});
                    e.nextBlock();
                })
                .fail(function(err) {
                    ui.errorMessage(err.responseJSON.error);
                });
        } else {
            // run the experiment
            e.nextBlock();
        }

        
    });
