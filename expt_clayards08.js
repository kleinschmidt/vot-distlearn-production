var respDelim = ';';

var e;

////////////////////////////////////////////////////////////////////////////////
// Stimulus definitions

// critical (VOT continuum) items
var vot_continuum_word = function(word) {
    return(new Stimuli(
               {
                   prefix: 'stimuli_vot/',
                   continuum: range(-30, 81, 10),
                   maxAmbigRange: [10, 40],
                   mediaType: 'audio',
                   filenameFormatter: function(n, prefix)
                   {
                       return(this.prefix + word + this.continuum[n]);
                   }
               }
           ));
}
var stim_beach_peach = vot_continuum_word('BEACH');
var stim_bees_peas = vot_continuum_word('BEES');
var stim_beak_peak = vot_continuum_word('BEAK');

// Distractor items 
var rl_continuum_word = function(word) {
    return new Stimuli(
        {
            prefix: 'stimuli_vot/',
            continuum: [NaN, NaN],
            mediaType: 'audio',
            filenames: [word+'1', word+'9']
        }
    );
}
var stim_race_lace = rl_continuum_word('LACE');
var stim_ray_lei = rl_continuum_word('LEI');
var stim_rake_lake = rl_continuum_word('LAKE');

// stimulus images and their corresponding words
var stim_images = {
    race: 'stimuli_images/race.png',
    lace: 'stimuli_images/lace.png',
    ray: 'stimuli_images/ray.png',
    lei: 'stimuli_images/lei.png',
    rake: 'stimuli_images/rake.png',
    lake: 'stimuli_images/lake.png',
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
        

        e = new Experiment();
        e.init();

        ///////////////////////////////////////////////////////////
        // parse relevant URL parameters
        e.sandboxmode = checkSandbox(e.urlparams);
        e.previewMode = checkPreview(e.urlparams);
        e.debugMode = checkDebug(e.urlparams);
        var condition = e.urlparams['condition'];

        ////////////////////////////////////////////////////////////////////////////////
        // construct lists
        
        // repetitions for high and low variance, and distractors
        var bp_reps_highvar = [1, 4, 9, 10, 9, 5, 5, 9, 10, 9, 4, 1];
        var bp_reps_lowvar  = [0, 1, 9, 18, 9, 1, 1, 9, 18, 9, 1, 0];
        var lr_reps         = [38, 38];

        // based on condition, set the critical continuum repetitions
        var bp_reps;
        switch(condition) {
        case 'highvar':
            bp_reps = bp_reps_highvar;
            break;
        case 'lowvar':
            bp_reps = bp_reps_lowvar;
            break;
        default:
            throw('Invalid condition: ' + condition);
        }

        // construct experimental lists:
        // lists define the pairings between stimulus continua and response images
        var lists = [
            {
                stimuli: stim_beach_peach,
                images: ['beach', 'peach', 'race', 'lace'],
                reps: bp_reps
            },
            {
                stimuli: stim_bees_peas,
                images: ['bees', 'peas', 'rake', 'lake'],
                reps: bp_reps
            },
            {
                stimuli: stim_beak_peak,
                images: ['beak', 'peak', 'ray', 'lei'],
                reps: bp_reps
            },
            {
                stimuli: stim_race_lace,
                images: ['beach', 'peach', 'race', 'lace'],
                reps: lr_reps
            },
            {
                stimuli: stim_rake_lake,
                images: ['bees', 'peas', 'rake', 'lake'],
                reps: lr_reps
            },
            {
                stimuli: stim_ray_lei,
                images: ['beak', 'peak', 'ray', 'lei'],
                reps: lr_reps
            }
        ];
        

        vwb = new VisworldBlock({lists: lists,
                                 images: stim_images,
                                 namespace: 'visworld_clayards08_'+condition});

        // experiment intro and overall instructions
        var instructions = new InstructionsSubsectionsBlock(
            {
                logoImg: 'logo.png',
                title: 'Listen and click',
                mainInstructions: ['Thanks for your interest in our study!  This HIT is a psychology experiment, about how people understand speech.  Your task will be to listen to words, and click on pictures.',
                                           'Please read through each of the following items that will inform you about the study and its requirements. You can click the names below to expand or close each section. <span style="font-weight:bold;">You must read the eligibility requirements, the instructions, and the informed consent sections.</span>'],
                subsections: [
                    {
                        title: 'Experiment length', 
                        content: 'The experiment will take about an hour to complete and you will be paid $6.00.  You will hear a little more than 400 words, many of them very similar.'
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
                                                      filename: 'stimuli_vot/LAKE9',
                                                      answer: 'rake'
                                                  },
                                                  {
                                                      filename: 'stimuli_vot/BEACH80',
                                                      answer: 'peach'
                                                  },
                                                  {
                                                      filename: 'stimuli_vot/BEAK0',
                                                      answer: 'beak'
                                                  },
                                                  {
                                                      filename: 'stimuli_vot/LACE1',
                                                      answer: 'lace'
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
                                  'On each trial, there will be four pictures on the screen.',
                                  'When the green light in the center lights up, click on it to hear the word.',
                                  'Click on the matching picture as quickly as possible.',
                                  {subtitle: 'Reasons work can be rejected:', content: 'There are two reasons that your work can be rejected.  First, <span style="font-weight:bold;">clicking randomly, or making too many mistakes</span> (clicking on the wrong picture).  Try your best to click on the matching picture, even though some of the words may be confusing.  Second, <span style="font-weight:bold;">waiting an unreasonably long time before clicking</span> (for instance because you are away from the computer).  Please make sure to give yourself enough time to finish the entire experiment in one session.  There will be chances to take breaks throughout the experiment.'}],
                        checkboxText: 'I have read and understood the instructions, and why work can be rejected.'
                    },
                    {
                        title: 'Informed consent',
                        content: consentFormDiv,
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
        
        // add all the blocks to the experiment
        e.addBlock({block: instructions,
                    onPreview: true});
        // e.addBlock({block: soundcheck,
        //             onPreview: true});
        e.addBlock({block: vwb,
                    onPreview: false});

        // run the experiment
        e.nextBlock();
        
        
    });