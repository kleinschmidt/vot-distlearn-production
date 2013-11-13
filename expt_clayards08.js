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

        // overall instructions
        $("#instructions").html(logoDiv +
                                '<p>This HIT is a psychology experiment, about how people understand speech.  Your task will be to listen to words, and click on pictures.  The experiment will take about an hour to complete and you will be paid $6.00.  Please read through each of the following items that will inform you about the study and its requirements. </p>' +
                                techDiffDiv +
                                consentFormDiv);

        var instructions = new InstructionsSubsectionsBlock(
            {
                title: 'the title of the instructions!',
                mainInstructions: 'Here\'s some text describing the instructions that should always appear',
                subsections: [
                    {
                        title: 'section 1', 
                        content: 'here\'s what is up w/ section one', 
                        checkboxText: 'make sure you click this'
                    },
                    {
                        title: 'section 2!',
                        content: 'and this is some stuff about section 2'
                    },
                    {
                        title: 'yet another section',
                        content: ['here\'s a paragraph.',
                                  'here is another paragraph!'],
                        checkboxText: 'here click again'
                    },
                    {
                        title: 'I heard you like subsections',
                        content: [{subtitle: 'so I put some subsections', content: 'in your subsections!'},
                                  'just for kicks, a naked paragraph!',
                                  {subtitle: 'like this one', content: 'says some stuff'}],
                        checkboxText: 'click here if you got all that'
                    },
                    {
                        title: 'Is anyone still reading?',
                        content: 'comes after everything else so probably not that important',
                        finallyInfo: true
                    }
                ]
            }
        );
        
        e.addBlock({block: instructions,
                    onPreview: true});
        e.addBlock({block: vwb,
                    onPreview: false});

        continueButton(function() {
                               e.nextBlock();
                       });
        
        
    });