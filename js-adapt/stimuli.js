// file types for video and audio suffixes. set in experimentControl.js
var vidSuffix, audSuffix;

// formatter to combine prefix with index for *An.* formatted file names
// note index is relative to ZERO but stimuli are 1-indexed, so An(0) --> A1
var mediaFilenameFormatter_An = function(n, prefix) {
    return(prefix + 'A' + (n+1));
};

var mediaFilenameFormatter_AnCatch = function(n, prefix) {
    return(prefix + 'a' + (n+1) + 'C');
}

var mediaFilenameFormatter_CAn = function(n, prefix) {
    return(prefix + 'CA' + (n+1));
};

function Stimuli(baseobj) {
    $.extend(this, baseobj);
};

// default values
Stimuli.prototype = {
    filenameFormatter: mediaFilenameFormatter_An,
    catchFilenameFormatter: mediaFilenameFormatter_AnCatch,
    subset: function(subinds) {
        // deep copy of original object
        var newstims = $.extend(true, {}, this);

        // for any properties that are arrays, default to taking the specified subset...
        for (key in newstims) {
            if (typeof(newstims[key].getSubset) !== 'undefined') {
                newstims[key] = newstims[key].getSubset(subinds);    
            }
        }

        // repair properties which may not exist or be handled by the loop over properties above
        if (typeof(this.indices) === 'undefined') newstims.indices = subinds;
        newstims.maxAmbigRange = this.maxAmbigRange;

        newstims.__proto__ = this.__proto__;

        return newstims;
    },

    install: function(css_class) {
        // check to see if indices are specified in object; if not, create them as range...
        var indices = typeof(this.indices)==='undefined' ? range(this.continuum.length) : this.indices;

        if (typeof(this.installed) == 'undefined') {
            var _self = this;
            // create temporary class to pick out stimuli installed right now.
            var tmp_css_class = 'tmpclass' + Math.floor(Math.random() * 1000000);
            // handle audio and video separately (default to audio if type not specified)
            switch(typeof(this.mediaType) != 'undefined' ? this.mediaType : 'audio')
            {
            case 'audio':
                // clear pre-existing html in div
                //$("#audioContainer").html("");
                for (var j=0; j < indices.length; j++) {
                    $('<audio></audio>').addClass(css_class + ' audStim ' + tmp_css_class).
                        attr('src', _self.filenameFormatter(indices[j], _self.prefix) + audSuffix).
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
                                       attr('src', _self.filenameFormatter(index, _self.prefix) + vidSuffix).
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

            this.installed = $.makeArray($('.' + tmp_css_class));
            $(this.installed).removeClass(tmp_css_class);
        } else {
            // already installed. just add css class
            if (typeof(css_class) !== 'undefined') {
                $(this.installed).addClass(css_class);
            }
        }

        return(this.installed);

    }
};

var mediaFilenameFormatter_Muh_f = function(n, prefix) {
    var percent = 5 * n + 10;
    return(prefix + 'Muh_f' + percent + (100-percent));
};

var stimuli_arty_fs = new Stimuli(
    {
        prefix: 'stimuli_arty_fs/',
        continuum: [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        maxAmbigRange: [2,7],
        calibReps: 15,
        mediaType: 'audio',
        filenameFormatter: mediaFilenameFormatter_Muh_f,
        catchFilenameFormatter: function(n, prefix) {return(prefix + 'Muh_tone');}
    }
);

var stimuli_vroomen = new Stimuli({
    prefix: 'videos/',
    continuum: [1,2,3,4,5,6,7,8,9],
    maxAmbigRange: [4, 6],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6],
    mediaType: 'audio'
});

var stimuli_vroomen_vb = new Stimuli({
    prefix: 'videos/Vb',
    continuum: [1,2,3,4,5,6,7,8,9],
    maxAmbigRange: [4, 6],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6],
    mediaType: 'video'
});


var stimuli_vroomen_vd = new Stimuli({
    prefix: 'videos/Vd',
    continuum: [1,2,3,4,5,6,7,8,9],
    maxAmbigRange: [4, 6],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6],
    mediaType: 'video'

});

var stimuli_dave = new Stimuli({
    prefix: 'videos_dave/',
    continuum: [6, 15, 20, 22, 23, 24, 25, 26, 27, 28, 30, 35, 44],
    calibReps: [4, 6, 9, 9, 9, 9, 9, 9, 9, 9, 9, 6, 4],
    mediaType: 'audio'
});


var stimuli_dave_freq = new Stimuli({
    prefix: 'videos_dave_freqshift/',
    continuum: (function(n) {var x=[]; for (i=0; i<n; i++) {x[i] = i/(n-1);}; return(x)})(21),
    //calibReps: [1, 1, 1, 3, 3, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 3, 3, 1, 1, 1]
    calibReps: [1, 0, 0, 0, 3, 5, 5, 10, 10, 10, 10, 10, 10, 10, 5, 5, 3, 0, 0, 0, 1],
    mediaType: 'audio'
});

var stimuli_dave_freq_broad = new Stimuli({
    prefix: 'videos_dave_freqshift/',
    continuum: (function(n) {var x=[]; for (i=0; i<n; i++) {x[i] = i/(n-1);}; return(x)})(21),
    //calibReps: [1, 1, 1, 3, 3, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 3, 3, 1, 1, 1]
    calibReps: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    mediaType: 'audio',
    filenameFormatter: mediaFilenameFormatter_An
});



var stimuli_dave_freq2 = new Stimuli({
    prefix: 'videos_dave_freqshift2/',
    continuum: (function(n) {var x=[]; for (i=0; i<n; i++) {x[i] = i/(n-1);}; return(x)})(21),
    calibReps: [1, 0, 0, 0, 3, 5, 5, 10, 10, 10, 10, 10, 10, 10, 5, 5, 3, 0, 0, 0, 1],
    mediaType: 'audio',
    filenameFormatter: mediaFilenameFormatter_An
});

function StimuliNoiseMaskedVroomen (vid, snr, baseobj) {
    Stimuli.call(this, typeof baseobj === 'undefined' ? {} : baseobj);
    this.prefix = 'videos/noisemasked/V' + vid + 'SNR' + snr;
}
StimuliNoiseMaskedVroomen.prototype = {

    catchFilenameFormatter: mediaFilenameFormatter_CAn,
    mediaType: 'video',
    continuum: [1,2,3,4,5,6,7,8,9],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6]
};
extend(StimuliNoiseMaskedVroomen, Stimuli);

var stimuli_SNRp5_b = new StimuliNoiseMaskedVroomen('b', '+5');
var stimuli_SNRp5_d = new StimuliNoiseMaskedVroomen('d', '+5');
var stimuli_SNRp0_b = new StimuliNoiseMaskedVroomen('b', '+0');
var stimuli_SNRp0_d = new StimuliNoiseMaskedVroomen('d', '+0');
var stimuli_SNRn2_b = new StimuliNoiseMaskedVroomen('b', '-2');
var stimuli_SNRn2_d = new StimuliNoiseMaskedVroomen('d', '-2');
var stimuli_SNRn3_b = new StimuliNoiseMaskedVroomen('b', '-3');
var stimuli_SNRn3_d = new StimuliNoiseMaskedVroomen('d', '-3');
var stimuli_SNRn5_b = new StimuliNoiseMaskedVroomen('b', '-5');
var stimuli_SNRn5_d = new StimuliNoiseMaskedVroomen('d', '-5');

var stimuli_SNRpInf_b = new Stimuli({
    prefix: 'videos/Vb',
    continuum: [1,2,3,4,5,6,7,8,9],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6],
    mediaType: 'video',
    filenameFormatter: mediaFilenameFormatter_An
});

var stimuli_SNRpInf_d = new Stimuli({
    prefix: 'videos/Vd',
    continuum: [1,2,3,4,5,6,7,8,9],
    calibReps: [6, 8, 14, 14, 14, 14, 14, 8, 6],
    mediaType: 'video',
    filenameFormatter: mediaFilenameFormatter_An
});

function bdSwitch(i) {
    return i==0 ? 'b' :
        i==1 ? 'd' : undefined;
}


var stimuli_SNRn3_sil = new Stimuli({
    prefix: 'videos/noisemasked/',
    continuum: [0, 0],
    calibReps: [5, 5],
    mediaType: 'video',
    filenameFormatter: function(i, pref) {
        return pref + 'V' + bdSwitch(i) + 'SNR-3';
    }
});


var stimuli_SNRn2_sil = new Stimuli({
    prefix: 'videos/noisemasked/',
    continuum: [0, 0],
    calibReps: [5, 5],
    mediaType: 'video',
    filenameFormatter: function(i, pref) {
        return pref + 'V' + bdSwitch(i) + 'SNR-2';
    }
});


var stimuli_SNRp0_sil = new Stimuli({
    prefix: 'videos/noisemasked/',
    continuum: [0, 0],
    calibReps: [5, 5],
    mediaType: 'video', 
    filenameFormatter: function(i, pref) {
        return pref + 'V' + bdSwitch(i) + 'SNR+0';
    }
});


var stimuli_SNRp5_sil = new Stimuli({
    prefix: 'videos/noisemasked/',
    continuum: [0, 0],
    calibReps: [5, 5],
    mediaType: 'video',
    filenameFormatter: function(i, pref) {
        return pref + 'V' + bdSwitch(i) + 'SNR+5';
    }
});


var stimuli_SNRpInf_sil = new Stimuli({
    prefix: 'videos/',
    continuum: [0, 0],
    calibReps: [5, 5],
    mediaType: 'video',
    filenameFormatter: function(i, pref) {
        return pref + 'V' + bdSwitch(i) + 'Sil';
    }
});

// get subset of stimuli from object, create new object and return.
var subset_stimuli = function(stims, subset) {
    // deep copy of original object
    var newstims = $.extend(true, {}, stims);

    // for any properties that are arrays, default to taking the specified subset...
    for (key in newstims) {
        if (typeof(newstims[key].getSubset) !== 'undefined') {
            newstims[key] = newstims[key].getSubset(subset);    
        }
    }

    // repair properties which may not exist or be handled by the loop over properties above
    if (typeof(stims.indices) === 'undefined') newstims.indices = subset;
    newstims.maxAmbigRange = stims.maxAmbigRange;

    return newstims;
};

// take stimuli object (as above) and format filenames/add to DOM (optionally, only a subset...)
var install_stimuli = function(stims, css_class) {
    // check to see if indices are specified in object; if not, create them as range...
    var indices = typeof(stims.indices)==='undefined' ? range(stims.continuum.length) : stims.indices;

    if (typeof(stims.installed) == 'undefined') {
        // create temporary class to pick out stimuli installed right now.
        var tmp_css_class = 'tmpclass' + Math.floor(Math.random() * 1000000);
        // handle audio and video separately (default to audio if type not specified)
        switch(typeof(stims.mediaType) != 'undefined' ? stims.mediaType : 'audio')
        {
        case 'audio':
            // clear pre-existing html in div
            //$("#audioContainer").html("");
            for (var j=0; j < indices.length; j++) {
                $('<audio></audio>').addClass(css_class + ' audStim ' + tmp_css_class).
                    attr('src', stims.filenameFormatter(indices[j], stims.prefix) + audSuffix).
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
                                   attr('src', stims.filenameFormatter(index, stims.prefix) + vidSuffix).
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

        stims.installed = $.makeArray($('.' + tmp_css_class));
        $(stims.installed).removeClass(tmp_css_class);
    } else {
        // already installed. just add css class
        if (typeof(css_class) !== 'undefined') {
            $(stims.installed).addClass(css_class);
        }
    }

    return(stims.installed);
};


// Concatenate multiple stimuli objects together
function concatenate_stimuli_and_install(stimArray, css_class) {
    var stims = {continuum: [], calibReps: [], installed: [], prefix: ''};
    var tmp_css_class = 'tmpclass' + Math.floor(Math.random() * 1000000);
    
    for (var i = 0; i < stimArray.length; i++) {
        $.merge(stims.continuum, stimArray[i].continuum);
        $.merge(stims.calibReps, stimArray[i].calibReps);
        //install_stimuli(stimArray[i], css_class);
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