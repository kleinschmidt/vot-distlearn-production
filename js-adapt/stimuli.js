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

var $ = require('jquery')
  ;

// constructor: just copy JSON properties into this object
function Stimuli(baseobj) {
    $.extend(this, baseobj);
};

// default values
Stimuli.prototype = {
    // default value of calibReps is empty array
    calibReps: [],
    
    // create a new object which is a subset of these stimuli
    subset: function(subinds) {
        // deep copy of original object
        var newstims = $.extend(true, {}, this);

        // make sure subinds is an Array
        if (typeof(subinds.length) === 'undefined') {
            subinds = [ subinds ];
        }

        // for any properties that are arrays, default to taking the specified subset...
        for (var key in newstims) {
            if (typeof(newstims[key].getSubset) !== 'undefined') {
                newstims[key] = newstims[key].getSubset(subinds);    
            }
        }

        // repair properties which may not exist or be handled by the loop over properties above
        newstims.maxAmbigRange = this.maxAmbigRange;

        // set newstims.indices = [0, 1, ..., n] so it indexes continuum etc. properly
        newstims.indices = range(subinds.length);

        newstims.__proto__ = this.__proto__;

        return newstims;
    },

    install: function(css_class) {
        // check to see if indices are specified in object; if not, create them as range...
        var indices = typeof(this.indices)==='undefined' ? range(this.continuum.length) : this.indices;

        // if stimuli are already installed, can skip this (see else below) 
        if (typeof(this.installed) == 'undefined' || this.installed.length == 0) {
            var _self = this;
            // create temporary class to pick out stimuli installed right now.
            // (this is necessary because other stimuli might share the same css_class, especially
            // if doing a concatenate_stimuli_and_install for multiple sets)
            var tmp_css_class = 'tmpclass' + Math.floor(Math.random() * 1000000);
            // handle audio and video separately (default to audio if type not specified)
            switch(typeof(this.mediaType) != 'undefined' ? this.mediaType : 'audio')
            {
            case 'audio':
                // clear pre-existing html in div
                //$("#audioContainer").html("");
                for (var j=0; j < indices.length; j++) {
                    $('<audio></audio>').addClass(css_class + ' audStim ' + tmp_css_class).
                        attr('src', _self.filenameFormatter(indices[j], _self.prefix) + 
                             window.audSuffix).
                        appendTo("#audioContainer").
                        load();
                }
                break;
            case 'video':
                // clear pre-existing html in div
                //$("#videoContainer").html("");
                //for (var j=0; j < indices.length; j++) {
                $(indices==0 ? [indices] : indices).map(function(j,index) {
                                   $('<video></video>').addClass(css_class + ' vidStim ' + tmp_css_class).
                                       attr('src', _self.filenameFormatter(index, _self.prefix) + 
                                            window.vidSuffix).
                                       appendTo("#videoContainer").
                                       bind('playing.default', function() {
                                                if (debugMode && console) {
                                                    console.log('playing.default handler triggered');
                                                }
                                                $("#videoContainer > video").height(0);
                                                $(this).height($(this).prop('videoHeight'));
                                            }).
                                       height(0).
                                       load();
                               });
                break; 
            }

            // gather up the DOM elements for the new stimuli and add them to the object
            this.installed = $.makeArray($('.' + tmp_css_class));
            // ...then remove the temporary CSS class.
            $(this.installed).removeClass(tmp_css_class);
        } else {
            // already installed. just add css class
            if (typeof(css_class) !== 'undefined') {
                $(this.installed).addClass(css_class);
            }
        }

        return(this.installed);
    },

    // default file name formatter just indexes stored filenames.
    filenameFormatter: function(n, prefix) {
        return(prefix + this.filenames[n]);
    }
};

/*
 * Stimuli objects
 *   prefix: appended to filenames returned by formatter (if you want to avoid typing)
 *   continuum: array of values which give x-coordinate on stimulus continuum
 *   maxAmbigRange: [min, max] acceptable continuum range for boundary
 *   calibReps: number (or array of numbers) which gives default number of repetitions during calibration phase
 *   mediaType: 'audio' or 'video'
 *   filenameFormatter: function(n), where n is in 1..continuum.length, and returns nth filename
 *   catchFilenameFormatter: same as filenameFormatter 
 */

/*
 * StimuliList objects
 *   prefix: 
 *   filenames: array of file names (without prefix).
 *   (that's it. everything else will be computed from those.)
 */


function StimuliFileList(baseobj) {
    $.extend(this, baseobj);
    var numstims = this.filenames.length;
    // make sure file name list is provided and formatter is not
    // filename list
    if (typeof(baseobj.filenames) === 'undefined') {
        throw('Must provide list of filenames to StimuliFileList');
    }
    // check for filename formatter, warn if present
    if (typeof(baseobj.filenameFormatter) !== 'undefined') {
        if (console) console.log('filenameFormatter specified for a StimuliFileList object. Are you sure you didn\'t actually want to create a Stimuli object?');
    }


    // check for whether baseobj contains the right stuff; if not, fill in
    if (typeof(this.continuum) === 'undefined') {
        // make continuum 1:numstims
        this.continuum = range(numstims);
    } else {
        // make sure continuum is right length
        if (this.continuum.length != this.filenames.length) {
            throw('Continuum length != number of filenames');
        }
    }

    // check for maxambig range
    if (typeof(this.maxAmbigRange) === 'undefined') {
        this.maxAmbigRange = [1, numstims];
    }

    // check for media type
    if (typeof(this.mediaType) === 'undefined') {
        throw('Must specify media type as \'audio\' or \'video\'');
    }    
}

StimuliFileList.prototype = {
    filenameFormatter: function(n, prefix) {
        // default formatter is just going to pick out the nth filename
        return(prefix + this.filenames[n]); 
    },
    prefix: '',
    calibReps: 1
};

extend(StimuliFileList, Stimuli);


// Concatenate multiple stimuli objects together
function concatenate_stimuli_and_install(stimArray, css_class) {
    var stims = {continuum: [], calibReps: [], installed: [], prefix: ''};
    var tmp_css_class = 'tmpclass' + Math.floor(Math.random() * 1000000);
    
    for (var i = 0; i < stimArray.length; i++) {
        $.merge(stims.continuum, stimArray[i].continuum);
        $.merge(stims.calibReps, stimArray[i].calibReps);
        stimArray[i].install(css_class);
        $.merge(stims.installed, stimArray[i].installed);
    }

    return(stims);
}

function range(from, to, step) {
    if (typeof(to) === 'undefined') {
        to = from;
        from = 0;
    }
    if (typeof(step)==='undefined') {
        step = 1;
    }
    var x = [];
    var n = from;
    do {
        x.push(n);
        n += step;
    } while (n < to)
    return x;
}

Array.prototype.getSubset = function(subset) {
    var _self = this;
    return $.makeArray($(subset==0 ? [subset] : subset).map(function(i,j) {
                                         return _self[j];
                                     }));
};

// classical-esque class inheritance: sets prototype of prototype to superclass prototype
function extend(child, supertype)
{
    child.prototype.__proto__ = supertype.prototype;
    child.prototype.__super__ = supertype.prototype;
}


module.exports = {
    Stimuli: Stimuli,
    StimuliFileList: StimuliFileList,
    concatenate_stimuli_and_install: concatenate_stimuli_and_install
};
