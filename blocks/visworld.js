var _ = require('underscore')
  , $ = require('jquery')
  , R = require('ramda')
  , stimuli = require('../js-adapt/stimuli')
  , VisworldBlock = require('../js-adapt/visworldBlock')
  ;

// the main part of the experiment: the "visual world" trials

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
};

// how to tell whether we've generated a bad VOT value anywhere: 
var bad_vot_detector = function(vot) {
    // legal VOTs in this experiment are divisible by 10
    return (! $.isNumeric(vot)) || (vot % 10);
};

// create stimuli from VOT continuum
var make_vot_stims = function(word, center_vot, offsets) {
    // generate VOTs by adding each offset to mean vot
    var vots = _.map(offsets, function(offset) {return center_vot+offset;});

    // validate generated VOTs (should all be divisible by 10):
    if (_.filter(vots, bad_vot_detector).length) {
        // at least one is not divisible by 10...
        throw "Bad VOTs generated (not divisible by 10): " + vots;
    }
    
    return(new stimuli.Stimuli(
        {
            prefix: 'stimuli_vot/',
            continuum: vots,
            mediaType: 'audio',
            filenameFormatter: make_word_fn_formatter(word)
        }
    ));
};

// stimulus images and their corresponding words
var stim_images = {
    beach: 'stimuli_images/beach.png',
    peach: 'stimuli_images/peach.png',
    bees: 'stimuli_images/bees.png',
    peas: 'stimuli_images/peas.png',
    beak: 'stimuli_images/beak.png',
    peak: 'stimuli_images/peak.png'
};


module.exports = function(conditions) {

    var mean_vots = conditions.mean_vots;
    var sup_unsup_condition = conditions.supunsup;
    
    var categories = _.keys(conditions.mean_vots);

    // 2) supervised/unsupervised
    var valid_sup_unsup_conditions = ['supervised', 'unsupervised', 'mixed'];
    if (! _(valid_sup_unsup_conditions).contains(sup_unsup_condition)) {
        throw "Invalid supervised/unsupervised condition value: " + sup_unsup_condition;
    }

    ////////////////////////////////////////////////////////////////////////
    // generate lists
    var words = ['BEACH', 'BEES', 'BEAK'];
    // how much of an offset from the category mean VOT for supervised and unsupervised trials
    var offsets, reps;
    if (! sup_unsup_condition == 'mixed') {
        // default is for unsupervised to be +/-10, supervised to be +0 and +/-20.
        offsets = {'supervised': [-20, 0, 20],
                   'unsupervised': [-10, 10]};
        reps = {'supervised': [1, 17, 1],
                'unsupervised': [9, 9]};
    } else {
        // for mixed supervised/unsupervised, mixture of supervised/
        // unsupervised across whole continuum
        offsets = {'supervised': [-20, -10, 0, 10, 20],
                   'unsupervised': [-10, 0, 10]};
        reps = {'supervised': [1, 4, 8, 4, 1],
                'unsupervised': [5, 9, 5]};
    }

    var trial_types = _.keys(offsets);
    // how many repetitions of each word/VOT?
    // images for each trial type, word class, and category
    var images = {'unsupervised': {'BEACH': {'b': ['beach', 'peach'],   // all minimal pairs
                                             'p': ['beach', 'peach']},
                                   'BEES':  {'b': ['bees',  'peas'],
                                             'p': ['bees',  'peas']},
                                   'BEAK':  {'b': ['beak',  'peak'],
                                             'p': ['beak',  'peak']}},
                  'supervised': {'BEACH':   {'b': ['beach', 'peas'],    // all non-minimal pairs
                                             'p': ['beak',  'peach']},
                                 'BEES':    {'b': ['bees',  'peak'],
                                             'p': ['beach', 'peas']},
                                 'BEAK':    {'b': ['beak',  'peach'],
                                             'p': ['bees',  'peak']}}
                 };

    // for the unsupervised CONDITION, make all the images minimal pairs
    if (sup_unsup_condition == 'unsupervised') {
        images['supervised'] = images['unsupervised'];
    }

    // assemble lists:
    // iterate over words, and categories, and supervised/unsup within mean VOTs.
    // for each combination, generate stimuli object, pull out appropriate images, and pull out reps, then put into object.
    // return list of list item objects.


    // helper functions
    // n-ary list cross-product
    // [[a], [b], ...] -> [ [a, b, ...], ... ]
    var xprod_l = R.pipe(R.reduce(R.xprod, [[]]),
                         R.map(R.flatten));
    // var xprod_l = R.reduce(R.pipe(R.xprod, R.map(R.apply(R.concat))), [[]]);
    // variadic version:
    // [a] -> [b] -> ... -> [ [a, b, ...], ... ]
    var xprod_n = R.unapply(xprod_l);

    // function to generate one list item: 
    var make_list_item = function(word, sup_unsup, category) {
        return {'stimuli': make_vot_stims(word,
                                          conditions.mean_vots[category],
                                          offsets[sup_unsup]),
                'images': images[sup_unsup][word][category],
                'reps': reps[sup_unsup],
                'id': [word, category, sup_unsup].join('_')
               };
    };

    var items = R.map(R.apply(make_list_item), xprod_n(words, trial_types, categories));

    // create the visual world block object
    return new VisworldBlock({lists: items,
                             images: stim_images,
                             namespace: 'visworld_' + sup_unsup_condition + '_' + mean_vots['b'] + '_' + mean_vots['p'],
                             imagePositions: ['left', 'right']});

};
