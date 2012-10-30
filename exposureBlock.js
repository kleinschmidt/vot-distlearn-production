// how many exposure trials have elapsed in current block. -1 before block is started
//var expCounter = -1;
// NOW .n below
// inter-trial interval for exposure videos (in ms)
//var expITI = 850;
// global variables for exposure and catch video DOM elementsx
//var vid, catchVid;
// response keys for catch trials. 32 is SPACE; "miss" is triggered by code
//var catchRespKeys = {32: "hit", miss: "miss"};
// indicates whether keyboard input should be handled by catch trial handler
//var keyCaptureCatch = false;
// height of video, in pixels (TODO: should be set by code)
var vidHeight = 288;
// cumulative exposure trials at which catch video will be shown.
// set randomly for each block.
//var catchTrials = [];
// which stimulus to show on each trial (only really necessary for conditions where there
// are multiple different exposure stimuli).
//var exposureStims = [];

var exposureBlock;


function ExposureBlock(params) {
    var stimObj, catchStimObj, testStimObj, testReps, namespace, css_stim_class, exposures, testITI;
    for (p in params) {
        switch (p) {
        case 'stimuli':
            stimObj = params[p];
            break;
        case 'catchStimuli':
            catchStimObj = params[p];
            break;
        case 'testStimuli':
            testStimObj = params[p];
            break;
        case 'testReps':
            testReps = params[p];
            break;
        case 'testBreaks':
            this.testBlockTrials = params[p];
            break;
        case 'namespace':
            namespace = params[p];
            break;
        case 'exposures':
            this.exposures = params[p];
            break;
        case 'numCatch':
            this.numCatch = params[p];
            break;
        case 'exposureITI':
            this.ITI = params[p];
            break;
        case 'testITI':
            testITI = params[p];
            break;
        case 'catchInstructions':
            this.catchInstructions = params[p];
            break;
        case 'catchTimeout':
            this.catchTimeout = params[p];
            break;
        default:
            if (console) console.log('Unrecognized ExposureBlock constructor parameter: ' +
                                     p + ' (' + params[p] + ')');
        }
    }

    // set maximum number of exposures.
    if (typeof(this.exposures)==='undefined') {
        this.exposures = this.testBlockTrials.max();
    }

    // set namespace and css class for stimuli
    if (typeof(namespace)==='undefined') namespace = 'adaptation';
    css_stim_class = namespace + 'stim';
    this.namespace = namespace;
    
    ////////////////////////////////////////////////////////////////////////////////
    // STIMULI
    // install normal stimuli
    this.stimuliObj = stimObj;
    this.vid = install_stimuli(stimObj, css_stim_class);

    // "switch" to catch stimuli for given stimuli object (must have catchFilenameFormatter specified...)
    if (typeof catchStimObj === 'undefined') {
        catchStimObj = (function(stim) {
                            var cstim = $.extend(true, {}, stim);
                            cstim.filenameFormatter = cstim.catchFilenameFormatter;
                            cstim.installed = undefined;
                            return cstim;
                        })(stimObj);
    }
    this.catchStimuliObj = catchStimObj;
    this.catchVid = install_stimuli(this.catchStimuliObj, css_stim_class+'catch');
    
    ////////////////////////////////////////////////////////////////////////////////
    // create and link up test block
    var _self = this;
    var testOpts = {stimuli: testStimObj, reps: testReps};
    if (typeof testITI !== 'undefined') {
        testOpts['ITI'] = testITI;
    }
    this.testBlock = new TestBlock(testOpts,
                                   _self);

    // create responses form element and append to form
    this.respField = $('<textArea id="' + namespace + 'CatchResp" ' +
                       'name="' + namespace + 'CatchResp" ></textArea').appendTo('#mturk_form');
    $('#mturk_form').append('<br />');
    

}

ExposureBlock.prototype = {
    ITI: 850,
    catchTimeout: 1000,
    n: -1,
    maxN: -1,
    testBlock: undefined, 
    testBlockTrials: [],
    respKeys: {},
    respKeysCatch: [' '],
    keyCapture: false,
    keyCaptureCatch: false,
    endedCapture: false,
    stims: [],
    stimuliObj: undefined,
    catchStimuliObj: undefined,
    vid: [],
    catchVid: [],
    catchTrials: [],
    numCatch: 5,
    numHits: 0,
    numMisses: 0,
    catchInstructions: undefined,

    run: function() {
        this.init();
        this.next();
    },

    init: function(opts) {
        var _self = this;

        this.practiceMode = false;
        this.showFeedback = false;
        this.noTest = false;

        for (o in opts) {
            switch (o) {
            case 'practiceMode':
                this.practiceMode = true;
                this.showFeedback = true;
                this.noTest = true;
                break;
            }
        }

        this.maxN = this.exposures;
        this.n = -1;

        this.numHits = 0;
        this.numMisses = 0;

        ////////////////////////////////////////////////////////////////////////////////
        // Set instructions and other UI elements
        // ...for catch trials, if they've been specified:
        if (typeof this.catchInstructions !== 'undefined') {
            $("#expInstructions").html(this.catchInstructions);
        }

        // install, initialize, and show a progress bar (progressBar.js)
        installPB("progressBar");
        resetPB("progressBar");
        $("#progressBar").show();

        ////////////////////////////////////////////////////////////////////////////////
        // pseudo-randomization of stimuli and catch stimuli

        // if fractional (less than 1) specified, treat it as proportion.
        var ncatch = this.numCatch;
        if (ncatch < 1) {
            ncatch = Math.ceil(ncatch * this.maxN);
        }
        
        this.catchTrials = [];
        for (var i=0; i<this.maxN; i += Math.ceil(this.maxN/ncatch)) {
            var n;
            do {
                n = i + Math.floor(Math.random()*Math.ceil(this.maxN/ncatch));
            } while (n >= this.maxN);
            this.catchTrials.push(n);
        }
        
        this.stims = pseudoRandomOrder(Math.ceil(this.maxN / this.vid.length), this.vid.length);


        // set progress bar increment size
        var realTestBlocksNumber = 0;
        for (var i = 0; i < this.testBlockTrials.length; i++) {
            if (this.testBlockTrials[i] <= this.maxN) {
                realTestBlocksNumber += 1;
            }
        }
        this.pbIncrement = 1.0 / (this.maxN + realTestBlocksNumber * this.testBlock.getTotalReps());
        
        
        ////////////////////////////////////////////////////////////////////////////////
        // set handler for catch trials
        $(document).bind('keydown.' + this.namespace, function(e) {return(_self.handleResp(e));});
        
        // set handler for video end (end of trial)
        $(this.vid).bind('ended.' + this.namespace, function() {_self.end();});
        $(this.catchVid).bind('ended.' + this.namespace, function() {_self.end();});
        this.endedCapture = true;
    },

    setStimuli: function() {
        // install stimuli, including catch stimuli, shuffle
        

    },

    next: function() {
        $("#expInstructions").show();
        this.n++;
        if (this.n >= this.maxN) {
            this.endBlock();
            return true;
        }
        $('#expStatus').html('n = ' + this.n);
        // check for catch trial
        if (this.catchTrials.has(this.n)) {
            //showCatch();
            // may need to setTimeout this to happen not at the beginning of the video but when
            // the catch dot appears...
            var _self = this;
            var curN = this.n;
            collect_keyboard_resp(function(e) {
                                      _self.recordResp('hit', curN);
                                  },
                                  _self.respKeysCatch,
                                  _self.catchTimeout + _self.catchVid[_self.stims[_self.n]].duration * 1000,
                                  function() {
                                      _self.recordResp('miss', curN);
                                  }
                                 );
            //this.keyCaptureCatch = true;
            this.catchVid[this.stims[this.n]].play();
        } else {
            // play normal exposure stimulus
            //showExposure();
            this.vid[this.stims[this.n]].play();
        }
    },

    end: function() {
        // skip normal end-of-stimuli processing during preview when expCounter == -1
        // (necessary to avoid triggering next-trial code during preview mode)
        if (this.n < 0 || ! this.endedCapture) {
            return false;
        }
        // increment progressbar
        plusPB("progressBar", this.pbIncrement);
        var _self = this;

        // after ITI, start the next trial, or signal the end of a block
        setTimeout(function() {
                       if (_self.testBlockTrials.has(_self.n+1) && ! _self.noTest) {
                           // trigger a block of test trials
                           _self.testBreak();
                           //$(document).trigger('testBreak');
                       } else {
                           //$(document).trigger("nextExposureTrial");
                           _self.next();
                       }
                   }, _self.ITI);

        // RECORD MISSED CATCH TRIALS
        // setTimeout(function() {
        //                if (_self.keyCaptureCatch) {
        //                    // the click handler sets keyCaptureCatch to false so it will only be true
        //                    // on missed catch trials
        //                    //var resp = [exposureInfo(), absURLtoFilename(catchVid[exposureStims[expCounter]].currentSrc), 'miss'].join();
        //                    //$('#expResp').val($('#expResp').val() + resp + respDelim);
        //                    _self.handleResp({which: 'miss'});
        //                    _self.keyCaptureCatch = false;
        //                }
        //            }, _self.catchTimeout);

    },

    testBreak: function() {
        $("#expInstructions").hide();
        $("#expStatus").html("testBreak caught");
        $(this.vid).height(0);
        $(this.catchVid).height(0);
        //this.testBlock.init();
        //var _self = this;
        //setTimeout(function() {_self.testBlock.next();}, _self.testBlock.ITI);
        //this.testBlock.next();
        this.endedCapture = false;
        this.testBlock.run();
    },

    endTestBlock: function() {
        this.endedCapture = true;
        this.next();
    },

    info: function(n) {
        if (typeof n === 'undefined') {
            n = this.n;
        }
        return [this.namespace + (this.practiceMode ? '.practice' : ''),
                n, absURLtoFilename(this.vid[this.stims[n]].currentSrc),
                absURLtoFilename(this.catchVid[this.stims[n]].currentSrc)].join();
    },

    handleResp: function(e) {
        // handle catch responses
        if (this.keyCaptureCatch && this.respKeysCatch[String(e.which)]) {
            // turn off further keyboard handling (to prevent recording multiple presses)
            this.keyCaptureCatch = false;
            // record trial counter, response
            //var resp = [this.info(), absURLtoFilename(this.catchVid[this.stims[this.n]].currentSrc),
            //            this.respKeysCatch[String(e.which)]].join();
            //$('#expResp').val($('#expResp').val() + resp + respDelim);
            if (debugMode && console) console.log('handleResp called: e.which='+e.which+' ('+this.respKeysCatch[String(e.which)]+')');
            this.recordResp(this.respKeysCatch[String(e.which)]);
            return false;
        } else if (this.keyCapture && this.respKeys[String(e.which)]) {
            // handle non-catch responses (currently none).
            return true;
        } else if (e.which==32) {
            // returning false in JQuery suppresses default spacebar behavior (usually a pagedown)
            // this is important in the MTurk frame since pressing spacebar could
            // move the window away from the frame with the experiment in it...
            return false;
        }
    },

    recordResp: function(resp, n) {
        var respStr = [this.info(n), resp].join();
        $(this.respField).val($(this.respField).val() + respStr + respDelim);

        if (resp=='hit') {
            this.numHits += 1;
        } else {
            this.numMisses += 1;
        }

        // show feedback if required
        if (this.practiceMode || this.showFeedback) {
            var oldHtml = $("#expInstructions").html();
            $("#expInstructions").removeClass('correct incorrect').addClass(resp=='hit' ? 'correct' : 'incorrect')
                .html(resp=='hit' ? 'Good!' : 'Oops! when you see the dot, press SPACE');
            setTimeout(function() {
                           $("#expInstructions").html(oldHtml).removeClass('correct incorrect');
                       }, resp=='hit' ? 500 : 1000);
        }
    },


    endBlock: function() {
        // trigger any remaining time-out events
        $(document).trigger('to');
        
        // unbind event handlers
        $(document).unbind('.' + this.namespace);
        $(this.vid).unbind('.' + this.namespace);
        $(this.catchVid).unbind('.' + this.namespace);

        // hide videos and instructions and progress bar 
        $("#expInstructions").hide();
        $(this.vid).height(0);
        $(this.catchVid).height(0);
        $("#progressBar").hide();

        // send the appropriate signals elsewhere
        $(document).trigger('endExposureBlock');
        if (this.practiceMode && typeof this.onEndedPractice === 'function') { 
            this.onEndedPractice();
        } else if (typeof this.onEndedBlock === 'function') {
            this.onEndedBlock();
        } else {
            if (console) console.log('WARNING: End of block reached but no callback found');
        }
    },

    practice: function(parameters, callback) {
        this.init({practiceMode: true});
        var _self = this;
        
        $("#progressBar").hide();
        this.maxN = 4;

        // set stimuli based on parameters (either vector of stims or number of repetitions)
        if (typeof parameters['stims'] !== 'undefined') {
            this.stims = parameters['stims'];
        } else if (typeof parameters['repetitions'] !== 'undefined') {
            this.stims = [];
            for (var i=0; i<parameters['repetitions']; i++) {this.stims.push(0);}
        } else {
            this.stims = [0, 0, 0, 0];         
        }
        this.maxN = this.stims.length;

        // set catch trials based on parameters
        if (typeof parameters['catchTrials'] !== 'undefined') {
            this.catchTrials = parameters['catchTrials'];
        } else {
            this.catchTrials = [0, 2];
        }

        // set instructions
        if (typeof parameters['instructions'] === 'undefined') {
            $("#instructions").html('<h3>Viewing block: practice</h3>' +
                                    'In this block, you will view short videos of a man speaking short words, like you\'ve heard before.  When you see a white dot flash quickly under his nose, press SPACE as quickly as possible.  Before you start, you\'ll have a chance to practice this.').show();
        } else {
            $("#instructions").html(parameters['instructions']).show();
        }

        // set retry instructions
        var retryInstructions = '<h3>Oops, try again</h3><p>You only got {0} of the dots, and missed {1}.  Click continue to try again.</p>';
        if (typeof parameters['retryInstructions'] !== 'undefined') {
            retryInstructions = parameters['retryInstructions'];
        }

        // callback for end of practice block.
        this.onEndedPractice = function() {
            if (this.numHits == this.catchTrials.length)  {
                callback.call(_self);
            } else {
                //$("#instructions").html('<h3>Oops, try again</h3><p>You only got ' + this.numHits + ' of the dots, and missed ' + this.numMisses + '.  Click continue to try again.</p>').show();
                $("#instructions").html(retryInstructions.format(this.numHits, this.numMisses)).show();
                continueButton(function() {
                                   _self.practice(parameters, callback);
                               });
            }
        };


        continueButton(function() {
                           $("#instructions").hide();
                           _self.next();
                       });
    }
};


// // bind a keyup handler for catch trial hits:
// $(document).bind('keydown.exposure', function(e) {
//     if (keyCaptureCatch && catchRespKeys[String(e.which)]) {
//         // turn off further keyboard handling (to prevent recording multiple presses)
//         keyCaptureCatch = false;
//         // record trial counter, response
//         var resp = [exposureInfo(), absURLtoFilename(catchVid[exposureStims[expCounter]].currentSrc),
//                     catchRespKeys[String(e.which)]].join();
//         $('#expResp').val($('#expResp').val() + resp + respDelim);
//         return false;
//     } else if (e.which==32) {
//         // returning false in JQuery suppresses default spacebar behavior (usually a pagedown)
//         // this is important in the MTurk frame since pressing spacebar could
//         // move the window away from the frame with the experiment in it...
//         return false;
//     }
// });

// // handler for video-ended events. record catch trials misses, and go
// // on to next trial.
// $(".vidStim").bind("ended", function() {
//                        // skip normal end-of-stimuli processing during preview when expCounter == -1
//                        // (necessary to avoid triggering next-trial code during preview mode)
//                        if (expCounter < 0) {
//                            return false;
//                        }
//                        // increment progressbar
//                        plusPB("progressBar", pbIncrementSize);
//                        setTimeout(function() {
//                                       // RECORD MISSED CATCH TRIALS
//                                       if (keyCaptureCatch) {
//                                           // the click handler sets keyCaptureCatch to false so it will only be true
//                                           // on missed catch trials
//                                           var resp = [exposureInfo(), absURLtoFilename(catchVid[exposureStims[expCounter]].currentSrc), 'miss'].join();
//                                           $('#expResp').val($('#expResp').val() + resp + respDelim);
//                                           keyCaptureCatch = false;
//                                       }

//                                       // start the next trial, or signal the end of a block
//                                       if (expTrials.has(expCounter+1)) {
//                                           // trigger a block of test trials
//                                           $("#expInstructions").hide();
//                                           $(document).trigger('testBreak');
//                                       } else {
//                                           $(document).trigger("nextExposureTrial");
//                                       }
//                                   }, expITI);
//                    });



$(document).ready(function() {
    // this function is in experiment-specific js code (see expt_*.js)
    //installVideos();
    
    //exposureBlock = 
    // binding to $(document) allows triggering from anywhere (including at the beginning of the experiment).
    // $(document).bind("nextExposureTrial", function() {
    //     $("#expInstructions").show();
    //     expCounter++;
    //     $('#expStatus').html('n = ' + expCounter);
    //     // check for catch trial
    //     if (catchTrials.has(expCounter)) {
    //         showCatch();
    //         // may need to setTimeout this to happen not at the beginning of the video but when
    //         // the catch dot appears...
    //         keyCaptureCatch = true;
    //         catchVid[exposureStims[expCounter]].play();
    //     } else {
    //         // play normal exposure stimulus
    //         showExposure();
    //         vid[exposureStims[expCounter]].play();
    //     }
    // });

    // // ALTERNATIVE IMPLEMENTATION for catch trials: respond with clicks (not debugged, use w/ caution)
    // // record catch trial false alarms (clicks on non-catch videos)
    // $(vid).click(function() {
    //     var resp = [exposureInfo(), absURLtoFilename(vid.currentSrc), 'FA'].join();
    //     $('#expResp').val($('#expResp').val() + resp + "\n");
    // });

    // // record catch trial hits (correct clicks)
    // $(catchVid).click(function(e) {
    //     if (keyCaptureCatch) {
    //         var resp = [exposureInfo(), absURLtoFilename(catchVid.currentSrc), 'hit'].join();
    //         $('#expResp').val($('#expResp').val() + resp + "\n");
    //         keyCaptureCatch = false;
    //     }
    // });

    $('#expStatus').html('Exposure block loaded');
    // DEBUGGING: add button to start exposure block
    $("#buttons").append("<input type='button' value='startExp' onclick='$(document).trigger(\"nextExposureTrial\");'></button>");
});

// hide stimuli videos (in a robust way), and show the specified catch video,
// defaulting to the current stimulus
function showCatch(n) {
    n = typeof(n) != 'undefined' ? n : exposureStims[expCounter];
    $(".vidStim").height(0);
    $(catchVid[n]).height(vidHeight);
}
// hide all video stimuli and show normal (non-catch) video
function showExposure(n) {
    n = typeof(n) != 'undefined' ? n : exposureStims[expCounter];
    $(".vidStim").height(0);
    $(vid[n]).height(vidHeight);
}

// pseudorandomly distribute catch trials
function catchTrialsInit() {
    var i = 0;
    var numExpTrials = expTrials[expTrials.length-1];
    var interval = Math.ceil(numExpTrials / numCatchTrials);
    catchTrials = [];
    while (i < numExpTrials) {
        var n;
        // ensure that the last block's catch trial is actually a valid trial number
        do {
            n = i+Math.floor(Math.random()*interval);
        } while (n >= numExpTrials);
        catchTrials.push(n);
        i += interval;
    }
}

// strip off everything but the filename tail from an absolute URL (like that
// returned by video.currentSrc)
function absURLtoFilename(url) {
    //FIXME: JavaScript Lint and Vim's syntax highlighter are both confused
    // by this regex. Something is probably wrong with it.
    // Should it be?: /[^\/]*$/
    return /[^/]*$/.exec(url);
}


// convert category and number to video filename
function vidFilenames(category, aud) {
    return [prefix + 'V' + category + 'A' + aud + vidSuffix,
            prefix + 'V' + category + 'a' + aud + 'C' + vidSuffix];
}


// function for array membership
Array.prototype.has=function(v){
    for (i=0; i<this.length; i++){
        if (this[i]==v) {
            return true;
        }
    }
    return false;
}

Array.prototype.max = function() {
    return Math.max.apply(null, this);
}

Array.prototype.min = function() {
    return Math.min.apply(null, this);
}