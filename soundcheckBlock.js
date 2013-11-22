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
 * Skeleton javascript for a new block type.  The demands of the experimentControl2.js
 * are only that 
 *   1) The block object have a run() method, which will be called to start the block
 *      and needs to show the instructions and initialize the block
 *   2) When done, the block hands control back to the Experiment by calling its own
 *      onEndedBlock() method, which will be provided by Experiment when the block 
 *      is added initially.
 */

// Block to carry out a sound check by playing one or more sound files and checking
// transcriptions.  Takes input of the form 
// [ 
//   { 
//     filename: 'sound1',
//     answer: 'cabbage',
//   },
//   { 
//     filename: 'sound2',
//     answer: 'flower', 
//   }
// ]
//

// set by Experiment.init() (in experimentControl2.js).
var audSuffix;

function SoundcheckBlock(params) {
    if (typeof(params['instructions']) !== 'undefined') {
        this.instructions = params['instructions'];        
    }
    
    if (typeof(params['items']) !== 'undefined') {
        this.items = params['items'];
    }
}

SoundcheckBlock.prototype = {
    items: undefined,
    instructions: '<h3>Sound check</h3>' + 
        '<p>You should complete this experiment in a quiet environment without any distractions, using headphones (preferred) or speakers set to the highest comfortable volume.</p>' +
        '<p>To ensure that your audio is working properly, you must complete the following sound test. Click on each button below to play a word, and type the words in the boxes provided. You can play the soundfiles as many times as you need to to set your volume to the right level. Please type the words in all <b>lowercase</b> letters, and press the start button to proceed. If you enter one of the words incorrectly, you will be prompted to retry until you have entered them correctly.</p>',
    init: function() {
        // add instructions
        var _self = this;
        $('#instructions').html(_self.instructions).show();
        // create DOM elements (div and list)
        $('<div></div>').attr('id', 'soundcheck').insertBefore($('#continue'));
        $('<ol></ol>').attr('id', 'soundcheckItems').appendTo('#soundcheck');
        // for each item, create list item
        $.map(this.items, function(item) {
                  var itemLI = $('<li class="soundcheckItem"></li>').attr('item', item.answer);
                  var playButton = $('<input type="button" class="soundcheckPlay" value="&#9658;"></input>');
                  var answerText = $('<input type="text" class="soundcheckAnswer"></input>');
                  var wordAudio = $('<audio></audio>')
                      .attr('src', item.filename+audSuffix)
                      .addClass('soundcheckAudio')
                      .show();
                  $(itemLI)
                      .append(playButton)
                      .append(answerText)
                      .append(wordAudio)
                      .appendTo($('#soundcheckItems'));
              });

        // listen for button clicks and play sound
        $('input.soundcheckPlay')
            .click(function() {
                       $(this).siblings('audio.soundcheckAudio')[0].play();
                   });

        // validate responses
        $('input.soundcheckAnswer')
            .on('input', function() {
                    // get correct answer.
                    var correctAns = $(this).parent().attr('item');
                    // check for match
                    if ($(this).val() == correctAns) {
                        $(this).addClass('correct');
                    } else {
                        $(this).removeClass('correct');
                    }
                })
            .on('focus', function() {
                    // remove read "fix me" background on focus
                    $(this).removeClass('fixme');
                });

    },
    check: function() {
        // make sure all are correct (look for ones without "correct" class)
        if ($('input.soundcheckAnswer:not(.correct)').addClass('fixme').length) {
            return(false);   
        } else {
            return(true);
        }
    },
    endBlock: function() {
        $('div#soundcheck').hide();
        this.onEndedBlock();
    },
    run: function() {
        this.init();
        var _self = this;
        continueButton(function() {_self.endBlock();},
                       function() {return(_self.check());});
    }
};