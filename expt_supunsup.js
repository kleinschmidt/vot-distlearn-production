var respDelim = ';';

var e;

////////////////////////////////////////////////////////////////////////////////
// Stimulus definitions

// Stimuli required: for each word, b and p versions. for each
// category, supervised (+/-20, 0) and unsupervised sets (+/- 10)

// generator for filename formatter functions ("wordVOT.wav" etc.)
var make_word_fn_formatter = function(word) {
    function formatter(n, prefix) {
        return(this.prefix + word + this.continuum[n]);
    }
    return formatter;
}

// how to tell whether we've generated a bad VOT value anywhere: 
var bad_vot_detector = function(vot) {
    // legal VOTs in this experiment are divisible by 10
    return (vot % 10);
}

// create stimuli from VOT continuum
var make_vot_stims = function(word, center_vot, offsets) {
    // generate VOTs by adding each offset to mean vot
    var vots = _.map(offsets, function(offset) {return center_vot+offset;});

    // validate generated VOTs (should all be divisible by 10):
    if (_.filter(vots, bad_vot_detector).length) {
        // at least one is not divisible by 10...
        throw "Bad VOTs generated (not divisible by 10): " + vots;
    }
    
    return(new Stimuli(
        {
            prefix: 'stimuli_vot/',
            continuum: vots,
            mediaType: 'audio',
            filenameFormatter: make_word_fn_formatter(word)
        }
    ));
}


// stimulus images and their corresponding words
var stim_images = {
    beach: 'stimuli_images/beach.png',
    peach: 'stimuli_images/peach.png',
    bees: 'stimuli_images/bees.png',
    peas: 'stimuli_images/peas.png',
    beak: 'stimuli_images/beak.png',
    peak: 'stimuli_images/peak.png'
};

