/*
 * Author: Dave F. Kleinschmidt
 * http://davekleinschmidt.com
 *
 *    Copyright 2013 Dave Kleinschmidt and
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
 * 
 * visworldBlock.js: javascript code for implementing a visual world experiment where
 * stimulus images are displayed and can then be clicked on in response to an audio
 * stimulus.
 */

function VisworldBlock(params) {
    // write parameters to member variabls
    var instructions, namespace, css_stim_class, css_image_class;
    for (p in params) {
        switch(p) {
        case 'lists':
            this.lists = params[p];
            break;
        case 'instructions':
            instructions = params[p];
            break;
        case 'namespace':
            namespace = params[p];
            break;
        case 'ITI':
            this.ITI = params[p];
            break;
        case 'images':
            this.images = params[p];
            break;
        default:
            if(console) console.log('Warning: unknown parameter passed to VisworldBlock: ' + p);
            break;
        }
    }

    // set namespace for this block (prefix for events/form fields/etc.) and
    // the class that the stimuli are assigned
    if (typeof(namespace) === 'undefined') {
        this.namespace = 'visworld';
    }
    css_stim_class = this.namespace + 'stim';
    css_image_class = this.namespace + 'image';
    
    ////////////////////////////////////////////////////////////////////////////////
    // set up audio stimuli and images
    // parse lists:
    var allStims = [];
    var allReps = [];
    var allImgs = [];
    for (var i=0; i<this.lists.length; i++) {
        var list = this.lists[i];
        // add stimuli object to list, to be installed below
        allStims.push(list.stimuli);
        // concatenate repetitions into a big array
        $.merge(allReps, list.reps);
        // add images (one per unique stimulus item) to an array
        // keep track of mapping from list indices to global stimulus indices
        list.globalIndices = [];
        for (var j=0; j<list.stimuli.continuum.length; j++) {
            allImgs.push(list.images);
            list.globalIndices.push(j);
        }
    }

    // add images to DOM
    for (image_name in this.images) {
        $("<img />")
            .addClass(css_image_class + ' imgStim')
            .attr('id', image_name)
            .attr('src', this.images[image_name])
            .load()
            .hide()
            .appendTo('#visworldContainer');
    }
    
    // install audio stimuli
    this.stimuli = concatenate_stimuli_and_install(allStims, css_stim_class);
    this.stimuli.images = allImgs;
    this.stimuli.reps = allReps;

    // install wait/go images
    $('<div id="readyWaitContainer"> </div>').appendTo('#visworldContainer');
    $("<img />")
        .addClass('visworld')
        .attr('id', 'ready')
        .attr('src', 'img/greenready.png')
        .appendTo('#readyWaitContainer')
        .hide()
        .load();
    $("<img />")
        .addClass('visworld')
        .attr('id', 'wait')
        .attr('src', 'img/greenwait.png')
        .appendTo('#readyWaitContainer')
        .hide()
        .load();

    // create response form fields
    this.respField = $('<textArea id="' + namespace + 'Resp" ' +
                       'name="' + namespace + 'Resp" ></textArea>').appendTo('#mturk_form');
    $('#mturk_form').append('<br />');
}

VisworldBlock.prototype = {
    itemOrder: undefined,       // replaces this.stims in LabelingBlock, indexed by n, indexes stimuli
    n: 0,
    stimuli: undefined,         // information about stimuli (incl. image names and actual DOM objects
    ITI: 1000,
    clickCapture: false,
    onEndedBlock: function() {},

    run: function() {
        var _self = this;
        this.init();
        continueButton(function() {
                           $("#instructions").hide();
                           _self.next();
                       });
    },
    init: function() {
        var _self = this;

        // initialize trial counter
        this.n = 0;

        ////////////////////////////////////////////////////////////////////////////////
        // construct list of items and randomize trial order
        this.itemOrder = pseudoRandomOrder(this.stimuli.reps, undefined, 'shuffle');
        
        // install "start trial" handler for the "ready" light
        $('#readyWaitContainer img#ready')
            .click(function() {
                       // "turn off" the light
                       $(this).hide().siblings('img#wait').show();
                       // play stimulus and wait for response
                       _self.handlePlay();
                   });

        // install click handler on the stimulus images
        $('img.' + this.namespace + 'image').click(function(e) {_self.handleResp(e);});
        
                       
                   
    },
    next: function() {
        var _self = this;
        // after ITI, turn on "ready" light, and display images
        setTimeout(function() {
                       $('#readyWaitContainer img#wait').hide().siblings('img#ready').show();
                   }, _self.ITI);

        // display images after ITI/2
        setTimeout(function() {_self.showStimImages();}, _self.ITI/2);
        
    },
    handlePlay: function() {
        var snd = this.stimuli.installed[this.itemOrder[this.n]];
        snd.load();             // add load to allow replaying (with relative paths)
        snd.play();
        this.waitForResp();
        this.tStart = Date.now();
    },

    showStimImages: function() {
        var _self = this;
        $.map(this.stimuli.images[this.itemOrder[this.n]],
              function(image, i) {
                  $('img#' + image + '.' + _self.namespace + 'image')
                      .addClass('vw_trialimage')
                      .attr('vw_pos', i)
                      .show();                  
              });
    },
    waitForResp: function() {
        // if collecting a keyboard response, would turn on listening here
        this.clickCapture = true;
    },
    handleResp: function(e) {
        if (this.clickCapture) {
            this.tResp = Date.now();
            this.clickCapture = false;
            console.log(e.target.id);
            this.end(e);
        }
    },
    info: function() {
        var curStimSrc = RegExp("[^/]*$")
            .exec(this.stimuli.installed[this.itemOrder[this.n]].currentSrc);
        return [this.namespace + (this.practiceMode ? '.practice' : ''),
                this.n, this.itemOrder[this.n], curStimSrc].join();
    },
    recordResp: function(e) {
        var clickResp = e.target.id;
        var resp = [this.info(), clickResp,
                    this.tStart, this.tResp, this.tResp-this.tStart].join();
        if (console) console.log(resp);
        $(this.respField).val($(this.respField).val() + resp + respDelim);
    },
    end: function(e) {
        // update progress bar

        // record response

        // hide images and scrub of identifiers
        $('img.vw_trialimage')
            .removeClass('vw_trialimage')
            .removeAttr('vw_pos')
            .hide();

        // next trial, or end
        if (++this.n < this.itemOrder.length) {
            this.next();
        } else {
            this.endBlock();
        }
    },
    endBlock: function() {
        this.onEndedBlock();
    }
};