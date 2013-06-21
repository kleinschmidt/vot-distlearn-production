var e;

////////////////////////////////////////////////////////////////////////////////
// Stimulus definitions

var stim_beach_peach = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: range(-30, 81, 10),
        maxAmbigRange: [10, 40],
        mediaType: 'audio',
        filenameFormatter: function(n, prefix)
        {
            return(prefix + 'BEACH' + this.continuum[n]);
        }
    }
);

var stim_bees_peas = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: range(-30, 81, 10),
        maxAmbigRange: [10, 40],
        mediaType: 'audio',
        filenameFormatter: function(n, prefix)
        {
            return(prefix + 'BEES' + this.continuum[n]);
        }
    }
);

var stim_beak_peak = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: range(-30, 81, 10),
        maxAmbigRange: [10, 40],
        mediaType: 'audio',
        filenameFormatter: function(n, prefix)
        {
            return(prefix + 'BEAK' + this.continuum[n]);
        }
    }
);

var stim_race_lace = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: [NaN, NaN],
        mediaType: 'audio',
        filenames: ['LACE1', 'LACE9']
    }
)

var stim_ray_lei = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: [NaN, NaN],
        mediaType: 'audio',
        filenames: ['LEI1', 'LEI9']
    }
)

var stim_rake_lake = new Stimuli(
    {
        prefix: 'stimuli_vot/',
        continuum: [NaN, NaN],
        mediaType: 'audio',
        filenames: ['LAKE1', 'LAKE9']
    }
)

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


// repetitions for high and low variance, and 
var bp_reps_highvar = [1, 4, 9, 10, 9, 5, 5, 9, 10, 9, 4, 1];
var bp_reps_lowvar  = [0, 1, 9, 18, 9, 1, 1, 9, 18, 9, 1, 0];
var lr_reps         = [38, 38];

var condition = 'highvar';
var bp_reps;
switch(condition) {
case 'highvar':
    bp_reps = bp_reps_highvar;
    break;
case 'lowvar':
    bp_reps = bp_reps_lowvar;
    break;
default:
    throw('Invalid condition' + condition);
}

// lists define the pairings between stimulus continua and response images
var stimuli_arty_fs;
stimuli_arty_fs.prefix = 'stimuli_arty_fs/';
var lists_fs_test = [
    {
        stimuli: stimuli_arty_fs,
        images: ['beach', 'peach'],
        reps: [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
];

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

$(document).ready(function() {

                      e = new Experiment();
                      e.init();
                      
                      var vwb = new VisworldBlock({lists: lists,
                                                   images: stim_images});

                      vwb.init();
                      vwb.next();
                  });