/*
 * Author: Dave F. Kleinschmidt
 *
 *    Copyright 2012 Dave Kleinschmidt and
 *        the University of Rochester BCS Department
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License version 2.1 as
 *    published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with this program.
 *    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
 *
 */

// Modernizer tests:
require('browsernizr/test/audio');
require('browsernizr/test/video');

var ui = require('./ui')
  , utils = require('./utilities.js')
  , continueButton = ui.continueButton
  , mturk_helpers = require('./mturk_helpers')
  , Modernizr = require('browsernizr')
  , querystring = require('querystring')
  , $ = require('jquery')
  , Promise = require('bluebird')
  ;



// update experimental control script.  defines Experiment object.

// convenience variable for debugging (block of experiment currently being executed)
var _curBlock;

function Experiment(baseobj) {
    // add any properties passed as object to this, overriding defaults
    $.extend(this, baseobj);
}

// functionality needed for this object:
//   add new block to experiment
//   link up end of block n with beginning of block n-1
//   initialize/wrap up experiment (maybe better to put in global functions/variables?)

// block interface
//   call this.onEndedBlock when block is over
//   call this.run() to start

// what will experiment-specific control script look like?
// e = new Experiment();
// e.init({option: value});
// e.addBlock(new generalInstructions());
// e.addBlock(new calibrationBlock());
// e.addBlock(exp

Experiment.prototype = {
    blocks: [],
    blockn: undefined,
    runMturkChecks: true,
    rsrbProtocolNumber: 'RSRB00045955',
    rsrbConsentFormURL: 'http://www.hlp.rochester.edu/consent/RSRB45955_Consent_2014-02-10.pdf',
    consentFormDiv: '<div id="consent">By accepting this HIT, you confirm that you have read and understood the <a target="_blank" href="{0}">consent form</a>, that you are willing to participate in this experiment, and that you agree that the data you provide by participating can be used in scientific publications (no identifying information will be used). Sometimes it is necessary to share the data elicited from you &mdash; including sound files &mdash; with other researchers for scientific purposes (for replication purposes). That is the only reason for which we will share data and we will only share data with other researchers and only if it is for non-commercial use. Identifying information will <span style="font-weight:bold;">never</span> be shared (your MTurk ID will be replaced with an arbitrary alphanumeric code).</div>',
    
    // addBlock: function(block, instructions, endedHandler, practiceParameters) {
    addBlock: function(obj) {
        var block, instructions, endedHandler, practiceParameters, onPreview;
        // detect "naked block" vs. object with block info
        if (typeof(obj.run) === 'function' || typeof(obj) === 'function') {
            // naked block cases: 
            // naked blocks are either objects with a .run() method (first case)
            // or functions themselves (which are called by Experiment.nextBlock()
            // and return a block object)
            block = obj;            
        } else {
            // block + parameters objects, with fields:
            block = obj['block'];
            instructions = obj['instructions'];
            endedHandler = obj['endedHandler'];
            practiceParameters = obj['practiceParameters'];
            // show block during preview?
            onPreview = typeof(obj['onPreview']) === 'undefined' ?
                false :
                obj['onPreview'];
        }
        
        // add onEndedBlock handler function to block (block object MUST
        // call its onEndedBlock method  when it has truly ended...)
        var _self = this;
        Promise.resolve(block)
            .then(function(b) {
                b.onEndedBlock =
                    typeof(endedHandler) === 'undefined' ?
                    function() {_self.nextBlock();} :
                    endedHandler;
                // and link back to this experiment object to block object...
                b.parent = _self;
            });
        // add block object and its associated instructions to the blocks array
        this.blocks.push({block: block,
                          instructions: instructions,
                          practiceParameters: practiceParameters && practiceParameters.substring ?
                          {instructions: practiceParameters} : practiceParameters,
                          onPreview: onPreview}); // gracefully handle bare instructions strings
    },

    nextBlock: function() {
        // pull out block object holder, but don't increment block counter yet
        var this_block = this.blocks[this.blockn];
        if (typeof(this_block) === 'undefined') {
            // no more blocks, so finish up
            this.wrapup();
        } else {
            // check for preview mode, and stop if not ready.
            if (this.previewMode && !this_block.onPreview) {
                $("#continue").hide();
                $("#instructions").html('<h3>End of preview </h3><p>You must accept this HIT before continuing</p>').show();
                return false;
            }
            
            // if the block is given as a function, evaluate that function to create real block
            if (typeof this_block.block === 'function') {
                // functions should take a callback as first argument.
                this_block.blockfcn = this_block.block;
                // ... and return a block object.
                this_block.block = this_block.blockfcn(this_block.block.onEndedBlock);
            }

            _curBlock = this_block.block;
            var _self = this;
            
            // then check to see if practice mode is needed.
            if (typeof this_block.practiceParameters !== 'undefined') {
                // if yes, do practice mode, with a call back to run the block for real
                // TODO: deal with Promised blocks
                var promised = Promise.resolve(this_block.block);
                promised.then(function(block) {
                    block.practice(this_block.practiceParameters,
                                   function() {_self.runBlock();});
                });
            } else {
                // otherwise, run the block for real.
                this.runBlock();
            }
        }
            
    },

    // method to actually RUN the current block, showing optional instructions if they're provided
    runBlock: function() {
        var this_block = this.blocks[this.blockn++];
        var _self = this;

        var promised = Promise.resolve(this_block.block);
        
        if (typeof(this_block.instructions) !== 'undefined') {
            // if there are instructions...
            // show them, with a continue button
            $("#instructions").html(this_block.instructions).show();
            continueButton(function() {
                $("#instructions").hide();
                promised.then(function(block) {
                    _self._curBlock = block;
                    block.run(_self);
                });
            });
        } else {
            // ...otherwise, just run the block.
            promised.then(function(block) {
                _self._curBlock = block;
                block.run(_self);
            });
        }
    },

    init: function() {
        this.blockn = 0;

        // read in URL parameters
        this.urlparams = querystring.parse(window.location.search.substring(1));

        // run mturk checks (unless disabled)
        if (this.runMturkChecks) {
            this.checkPreview();
            this.checkSandbox();
            this.checkDebug();
        }
        
        // get assignmentID and populate form field
        $("#assignmentId").val(this.urlparams['assignmentId']);
        // record userAgent
        $("#userAgent").val(navigator.userAgent);
        
        // detect whether the browser can play audio/video and what formats
        window.vidSuffix =
            Modernizr.video.webm ? '.webm' :
            Modernizr.video.h264 ? '.mp4' :
            '';
        window.audSuffix =
            Modernizr.audio.wav == 'probably' ? '.wav' :
            Modernizr.audio.ogg == 'probably' ? '.ogg' :
            Modernizr.audio.mp3 == 'probably' ? '.mp3' :
            '';

        // check for missing resposne line delimiter and set if necessary
        if (typeof window.respDelim === 'undefined') {
            window.respDelim = ';';
        }
        
        // check for video and audio support, and if it's missing show a message
        // with an explanation and links to browser download websites
        if (window.vidSuffix && window.audSuffix) {
            $("#oldBrowserMessage").hide();
            $("#instructions").show();
        } else {
            return false;
        }

        // format consent form div with appropriate link to consent form.
        this.consentFormDiv = this.consentFormDiv.format(this.rsrbConsentFormURL);

        // set up form for end of experiment with demographic and other info
        // load demographic survey into div in form
        var rsrbNum = this.rsrbProtocolNumber;
        $('form#mturk_form')
            .append($('<div id="rsrb" class="survey">')
                    .load('js-adapt/rsrb_survey.html #rsrb > *', function() {
                        // set protocol number
                        $('input[name="rsrb.protocol"]:hidden').val(rsrbNum);
                        console.log($('input[name="rsrb.protocol"]').val());
                    }));

        // load audio equipment/comment survey into div in form
        $('form#mturk_form')
            .append($('<div id="endForm" class="survey"></div>')
                    .load('js-adapt/audio_comments_form.html #endForm > *'));

    },

    wrapup: function(why) {
        if (typeof(why)==='undefined') {
            // success
            // no error reported to callback
            $("#instructions").html("<h3>Thanks for participating!</h3>" +
                                    "<p>That's the end of the experiment!  Just a few more things for you to answer.</p>")
                .show();
        } else {
            // error?
            // any parameter not undefined is assumed to be an error, so record it and then wrap up.
            $("#experimentStatus").append("wrapup called: " + why + "<br />");
            $("#errors").val($("#errors").val() + why + window.respDelim);
            $("#instructions").html("<h3>Experiment is over</h3>" +
                                    "<p>Unfortunately, we were not able to calibrate the experiment to your hearing and audio system, and this is the end of the experiment.  If you have any comments, please write them in the box below before submitting this HIT.  Thank you for participating.</p>")
                .show();
        }
        
        // mturk_end_surveys_and_submit() is a function in js-adapt/mturk-helpers.js
        // which steps through the demographics/audio equipment surveys and then submits.
        var sc = this.submit_callback;
        continueButton(function() {
            mturk_helpers.mturk_end_surveys_and_submit(sc);
        });
    },

    submit_callback: function() {
        $("#mturk_form").submit();
    },

    checkPreview: function checkPreview() {
        if (mturk_helpers.checkPreview(this.urlparams)) {
            this.previewMode = true;
            return true;
        } else {
            this.previewMode = false;
            return false;
        }
    },

    checkSandbox: function checkSandbox() {
        // turkSubmitTo tells where to submit HIT
        var submitTo = this.urlparams['turkSubmitTo'];
        
        $("#mturk_form").attr("action", submitTo + "/mturk/externalSubmit");

        this.sandboxMode = /sandbox/.test(submitTo);
        return this.sandboxMode;
    },

    checkDebug: function checkDebug() {
        if (this.urlparams['debug']) {
            this.debugMode = true;
            $("#buttons").show();
            $("#mturk_form").addClass('debug').show().children().show();
            $("#comments").hide();

            var _self = this;
            window.e = _self;

            $('<button />', {
                text: 'End block',
                click: function() {
                    _self._curBlock.endBlock();
                }
            }).appendTo('#buttons');
            
            // some debugging shortcuts:
            $("#buttons").append("<input type='button' value='short blocks' " +
                                 "onclick='expTrials=[4,8];'" +
                                 "></button>");
            $("#buttons").append("<input type='button' value='skip calibration' " +
                                 "onclick='generateFakeData();" + 
                                 "$(document).trigger(\"endCalibrationBlock\");'" +
                                 "></button>");
            
        } else {
            this.debugMode = false;
        }
        return this.debugMode;
    }

};

module.exports = Experiment;
