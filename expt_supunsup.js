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
    return (! $.isNumeric(vot)) || (vot % 10);
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
                rsrbConsentFormURL: 'https://www.hlp.rochester.edu/consent/RSRB45955_Consent_2015-02-10.pdf'
            }
        );

        e.init();

        ////////////////////////////////////////////////////////////////////////
        // parse relevant URL parameters
        e.sandboxmode = checkSandbox(e.urlparams);
        e.previewMode = checkPreview(e.urlparams);
        e.debugMode = checkDebug(e.urlparams);

        // there are two condition variables:
        // 1) mean VOTs (0/10/20/30 for /b/, +40 for /p/)
        var bvot_condition = e.urlparams['bvot'];
        var bvot = {'-10': -10, '0': 0, '10': 10, '20': 20, '30': 30}[bvot_condition];
        var pvot_condition = e.urlparams['pvot'];
        var pvot;
        if (typeof pvot_condition === 'undefined') {
            pvot = bvot + pboffset;
        } else {
            pvot = pvot_condition;
        }
        var pboffset = 40;
        var mean_vots = {'b': bvot, 'p': pvot};
        var categories = _.keys(mean_vots);

        // 2) supervised/unsupervised
        var valid_sup_unsup_conditions = ['supervised', 'unsupervised', 'mixed']
        var sup_unsup_condition = e.urlparams['supunsup'];
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

        // function to generate one list item: 
        var make_list_item = function(word, sup_unsup, category) {
            return {'stimuli': make_vot_stims(word,
                                              mean_vots[category],
                                              offsets[sup_unsup]),
                    'images': images[sup_unsup][word][category],
                    'reps': reps[sup_unsup],
                    'id': [word, category, sup_unsup].join('_')
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
                                 namespace: 'visworld_' + sup_unsup_condition + '_' + bvot_condition,
                                 imagePositions: ['left', 'right']});

        ////////////////////////////////////////////////////////////////////////
        // Instructions

        // experiment intro and overall instructions
        var instructions = new InstructionsSubsectionsBlock(
            {
                logoImg: 'logo.png',
                title: 'Listen and click',
                mainInstructions: ['Thanks for your interest in our study!  This HIT is a psychology experiment, about how people understand speech.  Your task will be to listen to words, and click on pictures.',
                                   'Please read through each of the following items that will inform you about the study and its requirements. You can click the names below to expand or close each section. <span style="font-weight:bold;">You must read the eligibility requirements, the instructions, and the informed consent sections.</span>',
                                   '<span style="font-weight:bold;">Please do not take this experiment more than once!</span>'],
                subsections: [
                    {
                        title: 'Experiment length', 
                        content: 'The experiment will take 15-20 minutes to complete and you will be paid $2.00.  You will hear a little more than 200 words, many of them very similar.'
                    },
                    {
                        title: 'Eligibility requirements',
                        content: ['Please complete this HIT in a quiet room, away from other noise ' +
                                  'and wearing headphones.  Please do not look at other' +
                                  ' web pages or other programs while completing this HIT, as it is very' +
                                  ' important that you give it your full attention.',
                                  {
                                      subtitle: 'Language requirements',
                                      content: '<span style="font-weight:bold;">You must be a native speaker of American English.</span>  If you have not spent almost all of your time until the age of 10 speaking English and living in the United States, you cannot participate.'
                                  },
                                  {
                                      subtitle: 'Repeats/multiple HITs',
                                      content: 'You cannot do this hit if you have done another version of this experiment (\'Listen and click\').  <span style="font-weight:bold;">If you do multiple HITs in this experiment, your work will be rejected</span>.  If you are unsure, please email us and we can check.'
                                  },
                                  {
                                      subtitle: 'Computer requirements',
                                      content: 'This experiment requires that your browser support javascript and that you have working headphones and a mouse (instead of a laptop trackpad).'
                                  }
                                 ],
                        checkboxText: 'I have read and understand the requirements.'
                    },
                    {
                        title: 'Sound check',
                        content: ['Please complete the following sound test to make sure your browser is compatible with this experiment, and that your headphones are set to a comfortable volume.', 
                                  'Click on each button below to play a word, and type each word in the box provided. You can play the soundfiles as many times as you need to to set your volume to the right level. Please type the words in all <b>lowercase</b> letters.  If you enter one of the words incorrectly, the box will turn red to prompt you to retry until you have entered them correctly.',
                                  function() {
                                      var soundcheck = new SoundcheckBlock(
                                          {
                                              items: [
                                                  {
                                                      filename: 'stimuli_soundcheck/cabbage',
                                                      answer: 'cabbage'
                                                  },
                                                  {
                                                      filename: 'stimuli_soundcheck/lemonade',
                                                      answer: 'lemonade'
                                                  }
                                              ],
                                              instructions: ''
                                          }
                                      );
                                      return(soundcheck.init());
                                  }]
                    },
                    {
                        title: 'Experiment instructions', 
                        content: ['In this experiment, you will hear words and click on matching pictures.',
                                  'On each trial, there will be two pictures on the screen.',
                                  'When the green light in the center lights up, click on it to hear the word.',
                                  'Click on the matching picture as quickly as possible.',
                                  {
                                      subtitle: 'Reasons work can be rejected:',
                                      content: 'There are two reasons that your work can be rejected.  First, <span style="font-weight:bold;">clicking randomly, or making too many mistakes</span> (clicking on the wrong picture).  Try your best to click on the matching picture, even though some of the words may be confusing.  Second, <span style="font-weight:bold;">waiting an unreasonably long time before clicking</span> (for instance because you are away from the computer).  Please make sure to give yourself enough time to finish the entire experiment in one session.  There will be chances to take breaks throughout the experiment.'}],
                        checkboxText: 'I have read and understood the instructions, and why work can be rejected.'
                    },
                    {
                        title: 'Informed consent',
                        content: e.consentFormDiv,
                        checkboxText: 'I consent to participating in this experiment'
                    },
                    {
                        title: 'Further (optional) information',
                        content: ['Sometimes it can happen that technical difficulties cause experimental scripts to freeze so that you will not be able to submit a HIT. We are trying our best to avoid these problems. Should they nevertheless occur, we urge you to <a href="mailto:hlplab@gmail.com">contact us</a>, and include the HIT ID number and your worker ID.', 
                                  'If you are interested in hearing how the experiments you are participating in help us to understand the human brain, feel free to subscribe to our <a href="http://hlplab.wordpress.com/">lab blog</a> where we announce new findings. Note that typically about one year passes before an experiment is published.'],
                        finallyInfo: true
                    }
                ]
            }
        );


        ////////////////////////////////////////////////////////////////////////
        // add blocks and run
        // only show instructions on non-debug mode
        if (! e.debugMode) {
            e.addBlock({block: instructions,
                        onPreview: true});
        }
        e.addBlock({block: vwb,
                    onPreview: false});

        // run the experiment
        e.nextBlock();

        
    });
