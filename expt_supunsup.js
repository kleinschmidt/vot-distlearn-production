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


var vwb;

$(document).ready(
    function() {

        // create an experiment object with the necessary RSRB metadata
        e = new Experiment(
            {
                rsrbProtocolNumber: 'RSRB00045955',
                rsrbConsentFormURL: 'http://www.hlp.rochester.edu/consent/RSRB45955_Consent_2014-02-10.pdf'
            }
        );

        e.init();

        ///////////////////////////////////////////////////////////
        // parse relevant URL parameters
        e.sandboxmode = checkSandbox(e.urlparams);
        e.previewMode = checkPreview(e.urlparams);
        e.debugMode = checkDebug(e.urlparams);
        // there are three condition variables:
        // 1) mean VOTs (10/50 or 30/70; TODO-could)
        var mean_vots = [10, 50];
        // 2) up/down shift (TODO)
        var shift_direction = 'up'
        var shift = {'up': 10, 'down': -10}[shift_direction];
        var shifted_mean_vots = _.map(mean_vots, function(vot) { return vot + shift; });
        // 3) supervised/unsupervised (TODO)
        var sup_unsup_condition = 'supervised'

        // generate lists
        var words = ['BEACH', 'BEES', 'BEAK'];
        // how much of an offset from the category mean VOT for supervised and unsupervised trials
        var offsets = {'supervised': [-20, 0, 20],
                       'unsupervised': [-10, 10]};
        // how many repetitions of each word/VOT?
        var reps = {'supervised': [1, 17, 1],
                    'unsupervised': [9, 9]};
        // images for each word. each value is a list of two image
        // lists: first one for low VOT (/b/) version, second one for
        // high VOT (/p/) version of the spoken words
        var images = {'unsupervised': {'BEACH': [['beach', 'peach'], ['beach', 'peach']],
                                       'BEES':  [['bees',  'peas'],  ['bees',  'peas']],
                                       'BEAK':  [['beak',  'peak'],  ['beak',  'peak']]},
                      'supervised': {'BEACH':   [['beach', 'peas'],  ['beak',  'peach']],
                                     'BEES':    [['bees',  'peak'],  ['beach', 'peas']],
                                     'BEAK':    [['beak',  'peach'], ['bees',  'peak']]}
                     };

        // assemble lists:
        // iterate over words, and mean VOTs within words, and supervised/unsup within mean VOTs.
        // for each combination, generate stimuli object, pull out appropriate images, and pull out reps, then put into object.
        // return list of list item objects.
    });
