var Experiment = require('./js-adapt/experimentControl2')
  , mturk_helpers = require('./js-adapt/mturk_helpers')
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


        // getting the conditions:
        // method one: URL parameters:

        var bvot_condition = e.urlparams['bvot'];
        var bvot = parseInt(bvot_condition);
        var pboffset = 40;
        var pvot_condition = e.urlparams['pvot'];
        var pvot;
        if (typeof pvot_condition === 'undefined') {
            pvot = bvot + pboffset;
        } else {
            pvot = parseInt(pvot_condition);
        }

        var conditions = {
            mean_vots: {'b': bvot, 'p': pvot},
            supunsup: e.urlparams['supunsup']
        };

        // method two: AJAX call to /condition endpoint.
        $.ajax({
            dataType: 'json',
            url: 'condition',
            data: e.urlparams,
            success: function(data) {
                console.log('Received condition:', data);
                // conditions = data;
            },
            async: false
        });

        // either way: pass conditions to visworld block constructor
        var vwb = require('./blocks/visworld.js')(conditions);
        
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
        e.addBlock({block: vwb,
                    onPreview: false});

        // run the experiment
        e.nextBlock();

        
    });
