/*
 * Author: Dave Kleinschmidt
 * 
 * Design based on the experiment reported by Vroomen, J., Van Linden, S., 
 * De Gelder, B., & Bertelson, P. (2007). Visual recalibration and selective 
 * adaptation in auditory-visual speech perception: Contrasting build-up courses. 
 * Neuropsychologia, 45(3), 572–7. doi:10.1016/j.neuropsychologia.2006.01.031)
 * 
 * Stimuli and advice were graciously provided to us by Jean Vroomen.
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

// delimiter which separates (comma-delimited) records in data fields.
var respDelim = ';';
// default response key mapping
var respKeyMap = {X: 'B', M: 'D'};
// response categories
var categories = ['B', 'D'];

// global variable for computing the size for each increment of the progress bar (see progressBar.js)
var pbIncrementSize;

// Experiment object to control everything
var e;

$(document).ready(function() {
                      e = new Experiment();
                      e.init();

                      ///////////////////////////////////////////////////////////
                      // parse URL parameters
                      e.sandboxmode = checkSandbox(e.urlparams);
                      e.previewMode = checkPreview(e.urlparams);
                      e.debugMode = checkDebug(e.urlparams);
                      setRespKeys(e.urlparams);

                      // parse and set block order for adaptation blocks, if present
                      var adaptBlockOrder = typeof e.urlparams['blockOrder'] === 'undefined' ? [0, 1] :
                          $(e.urlparams['blockOrder'].split(',')).map(function(i, bns) {return parseInt(bns);});

                      // if asked, just do a short version of all the blocks for testing, etc.
                      var shortVersion = typeof e.urlparams['shortVersion'] === 'undefined' ? false : true;

                      var ambigcond = e.urlparams['condition'];
                      var offset;
                      if (typeof(ambigcond)==='undefined') {
                          if (console) console.log('ERROR: no ambiguity condition specified!');
                          return(false);
                      } else if (ambigcond=='proto') {
                          offset = Infinity;
                      } else if (ambigcond=='intrproto') {
                          offset = 2;
                      } else if (ambigcond=='intrambig') {
                          offset = 1;
                      } else if (ambigcond=='ambig') {
                          offset = 0;
                      } else {
                          if (console) {console.log('ERROR: bad ambiguity condition: ' + ambigcond);};
                          return (false);
                      }

                      // experiment param: number of test trials per test continuum item. 2 was used by Vroomen et al. (2007).
                      var testTrials = parseInt(e.urlparams['testTrials']);
                      if (isNaN(testTrials)) {
                          testTrials = 2;
                          if (console) console.log('WARNING: setting test trials to default of 2 (6 total)');
                      } else if (testTrials==2) {
                          if (console) console.log('testTrials = 2 (6 total, standard)');
                      } else if (testTrials==4) {
                          if (console) console.log('testTrials = 4 (12 total, long)');
                      } else {
                          if (console) console.log('ERROR: specify testTrials=[2,4] (bad value: {0})'.format(testTrials));
                      }
                      
                      ////////////////////////////////////////////////////////////
                      // Create and add blocks of experiment.

                      // overall instructions
                      $("#instructions").html('<p>This HIT is a psychology experiment, about how people understand speech.  <strong>Please only complete ONE of these HITs, and do not complete this experiment if you have done another one of our listening experiments which looks like this.</strong>  If you do our listening experiments multiple times your work will be rejected and you will not be paid.  Also, please only participate if you are a <strong>native speaker of English</strong> and at most speak at most a few words of another language.  There are two phases to this experiment.  </p>' + 
                                              '<p><strong>Phase 1:</strong> we have to adjust the specifics of the experiment to your hearing. You will listen to a total of <span id="nCalTrials">98</span> words. For each word that you hear, you have to decide if it has a B or a D in it. Specifically, you will hear many similar sounding instances of either \'aba\' or \'ada\', so there will be a lot of repetition.</p>' +
                                              '<p>This is necessary to ensure that we can calibrate the experiment to your hearing and equipment.  If you pay attention and use good headphones there shouldn\'t be a problem, but if for some reason we are unable to calibrate properly, you will be paid $0.25 for your time but will not continue with the rest of the experiment.  Please use the best headphones you have access to, and set them to a comfortable listening level before beginning.  This part should take no more than 10 minutes.</p>' + 
                                              '<p><strong>Phase 2:</strong> in the main part of the experiment, you will watch videos of a person talking and occasionally decide if a word has a B or a D. This part will take about 30 additional minutes. You will be paid $3.50 if you complete both parts of the experiment completely.</p>' + 
                                              '<p>Payment is contingent on the quality of your responses: button mashing and random responses will not be paid.  Thank you in advance for helping us to advance our understanding of speech processing.</p>' + 
                                              consentFormDiv);

                      e.addBlock(new InstructionsBlock('<h3>Section 1</h3>' + '<p>This is the beginning of the first section.  On each trial, you will be asked to decide whether the word you have just heard has a B or a D in it.  These words will be rather repetitive, so listen carefully.  Before we begin, let\'s practice.</p>'));

                      // audio only calibration block
                      var cb;
                      if (typeof(e.urlparams['nocalib']) !== 'undefined') {
                          cb = {maxAmbig: 5};
                          if (console) {console.log('WARNING: Skipping calibration...');}
                      } else {
                          cb = new CalibrationBlock({stimuli: stimuli_vroomen,
                                                     reps: shortVersion ? 2 : undefined,
                                                     namespace: 'calibration'});
                          e.addBlock(cb, undefined, cb.endedHandler, '');
                      }

                      e.addBlock(new InstructionsBlock('<h3>Section 2</h3>' +
                                                       '<p>That\'s the end of the first section!  Before beginning the next sections, there will be a short practice block.  Feel free to take a short break now, but keep in mind the limited amount of time you have to complete the whole experiment.</p>'));
                      

                      // adaptation conditions, block order is set above
                      var adaptBlockConds = [
                          {
                              vid: 'b',
                              offset: offset,
                              ambiguous: ambigcond,
                              av_stim: stimuli_vroomen_vb
                          },
                          {
                              vid: 'd',
                              offset: offset,
                              ambiguous: ambigcond,
                              av_stim: stimuli_vroomen_vd
                          }
                      ];

                      // to be shown before first adaptation block
                      var firstAdaptBlockInstructions = '<h3>Block 1 of ' + adaptBlockOrder.length + '</h3>' +
                          '<p>Good job, you got all the white dots and that\'s the end of practice for the second section.  Remember, in these blocks, whenever you see the white dot flash below the man\'s nose, press SPACE.  <strong>If you miss too many white dots, you won\'t be paid for your work, so make sure you pay attention.</strong></p>' +
                          '<p>Occasionally you\'ll be asked to say whether a word, without video, has a B or a D in it, like before.  You\'ll know when because a small plus sign will appear before each of these words.  You don\'t need to say B or D for the videos.</p>';


                      // add adaptor blocks (create anonymous function of condition object, and then call it)
                      for (var i=0; i<adaptBlockOrder.length; i++) {
                          (function(cond, i) {
                               e.addBlock(function(callback) {
                                              var adaptStims;
                                              if (cond.offset == Infinity) {
                                                  // prototypical stimulus.
                                                  adaptStims = cond.av_stim.subset(cond.vid=='b' ? 0 : cond.av_stim.continuum.length-1);
                                              } else {
                                                  // one of the partially/fully ambiguous conditions.
                                                  adaptStims = cond.av_stim.subset(cb.maxAmbig + (cond.vid=='b' ? -1 : 1) * cond.offset);
                                              }
                                              var adaptBlock = new ExposureBlock({stimuli: adaptStims,
                                                                                  testStimuli: stimuli_vroomen.subset(
                                                                                      [cb.maxAmbig-1,
                                                                                       cb.maxAmbig,
                                                                                       cb.maxAmbig+1]
                                                                                  ),
                                                                                  testReps: shortVersion ? 1 : testTrials,
                                                                                  testBreaks: [1, 2, 4, 8, 16, 32, 64, 96, 128],
                                                                                  exposures: shortVersion ? 2 : 128,
                                                                                  numCatch: 10/128,
                                                                                  namespace: 'adapt_' + i + '_' + cond.vid + '_' + cond.ambiguous
                                                                                 });
                                              adaptBlock.onEndedBlock = function() {callback();};
                                              //_curBlock = adaptBlock;
                                              //adaptBlock.run();
                                              return adaptBlock;
                                          },
                                          i==0 ? firstAdaptBlockInstructions : '<h3>Block ' + (i+1) + ' of ' + adaptBlockOrder.length + '</h3>' +
                                          '<p>Feel free to take a short break now, but keep in mind that you have a limited amount of time to complete this experiment.</p>',
                                          undefined,
                                          i==0 ? '' : undefined);
                               
                           })(adaptBlockConds[adaptBlockOrder[i]], i);                          
                      }

                      e.wrapup = this_wrapup;

                      // start experiment unless we're in preview mode
                      if (!e.previewMode) {
                          continueButton(function() {e.nextBlock();});
                      }

});

// callback for end of the experiment (for whatever reason).  
function this_wrapup(why) {
    $("#progressBar").hide();
    if (typeof(why)=='undefined') {
        // no reason given, everything is okay.
        $("#instructions").html("<h3>Thanks for participating!</h3>" +
                                "<p>That's the end of the experiment!  Just a few more things for you to answer.</p>")
            .show();
    } else {
        // otherwise, there was an error of some kind
        $("#experimentStatus").append("wrapup called: " + why + "<br />");
        $("#errors").val($("#errors").val() + why + respDelim);
        $("#instructions").html("<h3>Experiment is over</h3>" +
                                "<p>Unfortunately, we were not able to calibrate the experiment to your hearing and audio system, and this is the end of the experiment.  If you have any comments, please write them in the box below before submitting this HIT.  Thank you for participating.</p>")
            .show();
    }
    $("#endForm").show().children().show().children().show();

    // post back to amazon
    $("#contText").text('Submit');
    continueButton(function() {
                       $("#mturk_form").submit();
                   });    
}
