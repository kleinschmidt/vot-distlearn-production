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

// create a global variable for the visual world block object
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

        ////////////////////////////////////////////////////////////////////////
        // parse relevant URL parameters
        e.sandboxmode = checkSandbox(e.urlparams);
        e.previewMode = checkPreview(e.urlparams);
        e.debugMode = checkDebug(e.urlparams);

        // there are three condition variables:
        // 1) mean VOTs (10/50 or 30/70; TODO-could)
        var mean_vots = {'b': 10, 'p': 50};
        var categories = _.keys(mean_vots);

        // 2) up/down shift (TODO)
        var shift_direction = e.urlparams['shift'];
        var shift = {'up': 10, 'down': -10}[shift_direction];
        if (! shift) {
            throw "Invalid shift condition: " + shift_direction;
        }

        // 3) supervised/unsupervised
        var valid_sup_unsup_conditions = ['supervised', 'unsupervised']
        var sup_unsup_condition = e.urlparams['supunsup'];
        if (! _(valid_sup_unsup_conditions).contains(sup_unsup_condition)) {
            throw "Invalid supervised/unsupervised condition value: " + sup_unsup_condition;
        }

        ////////////////////////////////////////////////////////////////////////
        // generate lists
        var words = ['BEACH', 'BEES', 'BEAK'];
        // how much of an offset from the category mean VOT for supervised and unsupervised trials
        var offsets = {'supervised': [-20, 0, 20],
                       'unsupervised': [-10, 10]};
        var trial_types = _.keys(offsets);
        // how many repetitions of each word/VOT?
        var reps = {'supervised': [1, 17, 1],
                    'unsupervised': [9, 9]};
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

        // function to generate one list item: 
        var make_list_item = function(word, sup_unsup, category) {
            return {'stimuli': make_vot_stims(word,
                                              mean_vots[category]+shift,
                                              offsets[sup_unsup]),
                    'images': images[sup_unsup][word][category],
                    'reps': reps[sup_unsup],
                    'word': word,
                    'trial_type': sup_unsup,
                    'category': category
                   };
        }

        // iterate over all the different item variable combinations: 
        var items = _.map(words, function(word) {
            return _.map(trial_types,
                         function(sup_unsup) {
                             return _.map(categories,
                                          function(category) {
                                              return make_list_item(word, sup_unsup, category);
                                          });
                         });
        });

        items = _.flatten(items);

        // create the visual world block object
        vwb = new VisworldBlock({lists: items,
                                 images: stim_images,
                                 namespace: 'visworld_' + sup_unsup_condition,
                                 imagePositions: ['left', 'right']});

        e.addBlock({block: vwb,
                    onPreview: false});

        // run the experiment
        e.nextBlock();

        
    });
