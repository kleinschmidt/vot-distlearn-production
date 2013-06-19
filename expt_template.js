/*
 * Author: Dave Kleinschmidt
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
 */

var _curBlock;

var vidSuffix, audSuffix;

// delimiter which separates (comma-delimited) records in data fields.
var respDelim = ';';
// the categories of sounds being classified (probably should be deprecated)
var categories = ['B', 'D'];
// global default response key mapping
var respKeyMap = {X: 'B', M: 'D'};

var pbIncrementSize;

// Experiment object to control everything
var e;


$(document).ready(function() {

                      e = new Experiment();
                      e.init();

                      ///////////////////////////////////////////////////////////
                      // parse relevant URL parameters
                      e.sandboxmode = checkSandbox(e.urlparams);
                      e.previewMode = checkPreview(e.urlparams);
                      e.debugMode = checkDebug(e.urlparams);
                      // function in js-adapt/mturk_helpers.js sets global respKeyMap based on URL parameters
                      // e.g.: ?respKeys=X,M would set 'X' to categories[1] and 'M' to categories[2].
                      // !only supports two alpha keys/categories at the moment, and will choke on anything else!
                      setRespKeys(e.urlparams, categories);

                      // parse and set block order for adaptation blocks, if present in URL parameters
                      // e.g. ?blockOrder=0,1,2 --> [0,1,2]
                      var adaptBlockOrder = typeof e.urlparams['blockOrder'] === 'undefined' ? [0, 1] :
                          $(e.urlparams['blockOrder'].split(',')).map(function(i, bns) {return parseInt(bns);});

                      // is ?shortVersion is present, do a short version of all the blocks for testing, etc.
                      var shortVersion = typeof e.urlparams['shortVersion'] === 'undefined' ? false : true;

                      
                      ////////////////////////////////////////////////////////////
                      // Create and add blocks of experiment.

                      // overall instructions
                      $("#instructions").html(logoDiv +
                                              '<p>This HIT is a psychology experiment, about how people understand speech.  <strong>It\'s okay to do this experiment if you\'ve done one of our B/D experiments.</strong>  Please only participate if you are a <strong>native speaker of English</strong> and at most speak at most a few words of another language. </p>' + 
                                              '<p>This experiment will test how you hear certain sounds, and has two phases.' +
                                              '<p><strong>Phase 1:</strong> we have to adjust the specifics of the experiment to your hearing. You will listen to a total of <span id="nCalTrials">210</span> words. For each word that you hear, you have to decide if it has a {0} or a {1} in it. Specifically, you will hear many similar sounding versions of the words \'{0}uh\' or \'{1}uh\', so there will be a lot of repetition.</p>'.format(categories[0], categories[1]) +
                                              '<p>This is necessary to ensure that we can calibrate the experiment to your hearing and equipment.  If you pay attention and use good headphones there shouldn\'t be a problem, but if for some reason we are unable to calibrate properly, you will be paid $0.25 for your time but will not continue with the rest of the experiment.  Please use the best headphones you have access to, and set them to a comfortable listening level before beginning.  This part should take about 5 minutes.</p>' + 
                                              '<p><strong>Phase 2:</strong> in the main part of the experiment, you will listen to more of these words, and occasionally decide if a word has a {0} or a {1}. This part will take about 25 more minutes (30 minutes total for the whole experiment). You will be paid $3.00 if you complete both parts of the experiment completely.</p>'.format(categories[0], categories[1]) + 
                                              '<p>Payment is contingent on the quality of your responses: button mashing and random responses will not be paid, and will result in being banned from future experiment that we conduct.  Thank you in advance for helping us to advance our understanding of speech processing!</p>' + 
                                              techDiffDiv +
                                              consentFormDiv);

                      ////////////////////////////////////////////////////////////////////////////////
                      // Calibration block (pretest: weed out bad audio/participants)

                      // instructions for calibration block
                      e.addBlock(new InstructionsBlock(('<h3>Section 1</h3>' + '<p>This is the beginning of the first section.  On each trial, you will be asked to decide whether the word you have just heard has a {0} or a {1} in it.  These words will be rather repetitive, so listen carefully.  Please set your headphones to a comfortable listening level before beginning.</p>' +
                                                       '<p>Before we begin, let\'s practice.  Put your fingers on the X and M keys to get ready.</p>').format(categories[0], categories[1])));

                      // audio only calibration block
                      var cb;
                      if (typeof(e.urlparams['nocalib']) !== 'undefined') {
                          // if URL paramtere ?nocalib is present, then skip calibration
                          cb = {maxAmbig: 5};
                          if (console) {console.log('WARNING: Skipping calibration...');}
                      } else {
                          // the variable stimuli_arty_fs is a JSON object specified in js-adapt/stimuli.js
                          cb = new CalibrationBlock({stimuli: stimuli_vroomen,
                                                     reps: shortVersion ? 2 : undefined,
                                                     namespace: 'calibration'});
                          // specifying the callback as cb.endedHandler lets this block determine whether people
                          // can continue or not based on their pretest performance.  It will call the 'wrapup'
                          // method on the experiment object if they fail for any reason.
                          e.addBlock(cb, undefined, cb.endedHandler, '');
                      }


                      // post-calibration instructions screen.
                      e.addBlock(new InstructionsBlock('<h3>Section 2</h3>' +
                                                       '<p>That\'s the end of the first section!  Before beginning the next section, there will be a short practice block.  Feel free to take a short break now, but keep in mind the limited amount of time you have to complete the whole experiment.</p>'));

                      ////////////////////////////////////////////////////////////////////////////////
                      // Adaptor blocks. 

                      // I typically do something like loop over a vector of JSON objects specifying
                      // the parameters for each block (category, number of exposures, etc.), calling
                      // a function for each which creates the corresponding block and adds it to the expt
                      //
                      // (see expt_vroomen_replication.js for examples)
                      
                      ////////////////////////////////////////////////////////////////////////////////
                      // the callback function for the end of the experiment can be customized like this
                      // e.wrapup = this_wrapup;

                      // start experiment unless we're in preview mode (viewing on MT before accepting HIT)
                      if (!e.previewMode) {
                          continueButton(function() {e.nextBlock();});
                      }

});

// callback function for the end of the experiment.  the parameter 'why' contains error info; if 'undefined', normal exit assumed
// this is the default function from js-adapt/experimentControl2.js.  you can provide a custom one here as well.
function this_wrapup(why) {
    if (typeof(why)=='undefined') {
        // no error reported to callback
        $("#instructions").html("<h3>Thanks for participating!</h3>" +
                                "<p>That's the end of the experiment!  Just a few more things for you to answer.</p>")
            .show();
    } else {
        // any parameter not undefined is assumed to be an error, so record it and then wrap up.
        $("#experimentStatus").append("wrapup called: " + why + "<br />");
        $("#errors").val($("#errors").val() + why + respDelim);
        $("#instructions").html("<h3>Experiment is over</h3>" +
                                "<p>Unfortunately, we were not able to calibrate the experiment to your hearing and audio system, and this is the end of the experiment.  If you have any comments, please write them in the box below before submitting this HIT.  Thank you for participating.</p>")
            .show();
    }

    // mturk_end_surveys_and_submit() is a function in js-adapt/mturk-helpers.js
    // which steps through the demographics/audio equipment surveys and then submits.
    continueButton(mturk_end_surveys_and_submit);
    
}
