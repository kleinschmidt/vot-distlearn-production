var vidSuffix, audSuffix;


// update experimental control script.  defines Experiment object.

// convenience variable for debugging (block of experiment currently being executed)
var _curBlock;

function Experiment() {
    this.blocks = [];
    this.blockn = undefined;

    return this;
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

    addBlock: function(block, instructions, endedHandler, practiceParameters) {
        // add onEndedBlock handler function to block (block object MUST
        // call its onEndedBlock method  when it has truly ended...)
        var _self = this;
        block.onEndedBlock =
            typeof(endedHandler) === 'undefined' ?
            function() {_self.nextBlock();} : endedHandler;
        // and link back to this experiment object to block object...
        block.parent = _self;
        // add block object and its associated instructions to the blocks array
        this.blocks.push({block: block,
                          instructions: instructions,
                          practiceParameters: practiceParameters && practiceParameters.substring ?
                                                 {instructions: practiceParameters} : practiceParameters}); // gracefully handle bare instructions strings
    },

    nextBlock: function() {
        // pull out block object holder, but don't increment block counter yet
        var this_block = this.blocks[this.blockn];
        if (typeof(this_block) === 'undefined') {
            // no more blocks, so finish up
            this.wrapup();
        } else {
            // if the block is given as a function, evaluate that function to create real block
            // handle blocks in format of function.
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
                this_block.block.practice(this_block.practiceParameters,
                                          function() {_self.runBlock();});
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

        if (typeof(this_block.instructions) !== 'undefined') {
            // if there are instructions...
            // show them, with a continue button
            $("#instructions").html(this_block.instructions).show();
            continueButton(function() {
                               $("#instructions").hide();
                               //this_block.block.run();
                               //_curBlock = this_block.block;
                               this_block.block.run();
                           });
        } else {
            // ...otherwise, just run the block.
            this_block.block.run();
        }
    },

    init: function() {
        this.blockn = 0;

        // read in URL parameters
        this.urlparams = gupo();

        // get assignmentID and populate form field
        $("#assignmentId").val(this.urlparams['assignmentId']);
        // record userAgent
        $("#userAgent").val(navigator.userAgent);
        
        // detect whether the browser can play audio/video and what formats
        vidSuffix =
            Modernizr.video.webm ? '.webm' :
            Modernizr.video.h264 ? '.mp4' :
            '';
        audSuffix =
            Modernizr.audio.wav == 'probably' ? '.wav' :
            Modernizr.audio.ogg == 'probably' ? '.ogg' :
            Modernizr.audio.mp3 == 'probably' ? '.mp3' :
            '';

        // check for video and audio support, and if it's missing show a message
        // with an explanation and links to browser download websites
        if (vidSuffix && audSuffix) {
            $("#oldBrowserMessage").hide();
            $("#instructions").show();
        } else {
            return false;
        }
    },

    wrapup: function(why) {
        if (typeof(why)==='undefined') {
            // success
        } else {
            // error?
        }
    }
};


////////////////////////////////////////////////////////////////////////////////
// Some other little block implementations

// show instructions, wait for continue button press
function InstructionsBlock(instructions) {
    this.instructions = instructions;
    this.onEndedBlock = function() {return this;};
}

InstructionsBlock.prototype = {
    run: function() {
        $("#instructions").html(this.instructions).show();
        var _self = this;
        continueButton(function() {
                           $("#instructions").hide();
                           _self.onEndedBlock();
                       });
    }
};



////////////////////////////////////////////////////////////////////////////////
// GUI/helper things

// display a "continue" button which executes the given function
function continueButton(fcn) {
    $("#continue").show().unbind('click.cont').bind('click.cont', function() {
        $(this).unbind('click.cont');
        $(this).hide();
        fcn();
    });
}

// collect a keyboard response, with optional timeout
function collect_keyboard_resp(fcn, keys, to, tofcn) {
    var namespace = '._resp' + (new Date()).getTime();
    $(document).bind('keyup' + namespace, function(e) {
        if (!keys || keys.indexOf(String.fromCharCode(e.which)) != -1) {
            $(document).unbind(namespace);
            fcn(e);
            e.stopImmediatePropagation();
            return false;
        } else {
            return true;
        }
    });

    if (typeof tofcn !== 'undefined') {
        $(document).bind('to' + namespace, function() {
                             $(document).unbind(namespace);
                             tofcn();
                         });
    }

    if (typeof to !== 'undefined') {
        // timeout response after specified time and call function if it exists
        setTimeout(function(e) {
                       $(document).trigger('to' + namespace);
                       $(document).unbind(namespace);
                   }, to);
    }
}

