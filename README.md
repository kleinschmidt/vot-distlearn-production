# JS Adapt Demo

This is a fully worked replication of an audio-visual speech adaptation study (with some extensions), which we ran over Mechanical Turk [and presented at CogSci 2012](http://www.academia.edu/1532335/Kleinschmidt_D._F._and_Jaeger_T._F._2012_._A_continuum_of_phonetic_adaptation_Evaluating_an_incremental_belief-updating_model_of_recalibration_and_selective_adaptation._In_CogSci12).  With these files you should be able to get off the ground with similar web-based speech perception experiments.  

## Quickstart

To just run the demo of the experiment for yourself, download the source and point your browser to your local copy of `file:///path/to/mtadapt-demo/expt_vroomen_replication.html?condition=ambig`

## Workflow

This repository also contains all the files necessary for using Mechanical Turk to recruit participants and collect and retrieve data.  In order to do this, you need to host the HTML, JavaScript, and CSS files from the demo somewhere with a publicly visible URL.  The easiest way to do this is probably via a service like Dropbox, where you can drop the whole `mtadapt-demo` directory in and make it publicly visible.  Once you have an `http://` URL for the experiment HTML file, the workflow for running the experiment has NNN steps:

1. Create the input files for the Amazon MT command line interface.  Examples are found in the `hits` subdirectory.  
  * The `[experiment_name].properties` file specifies all the information visible to Turkers, including the title and description of the experiment HIT, the payment amount, and the amount of time they will have to complete the HIT.  The `.properties` file also specifies the number of assignments requested per HIT.
  * The `[experiment_name].input` file specifies the parameters of each HIT to be run, one on each line.  The first line gives the names of the parameters.
  * The `[experiment_name].question` file specifies how the parameters in the `.input` file are converted into something Mechanical Turk can actually display.  In this example, this is just a template for combining the parameters in the `.input` file into a URL, which Mechanical Turk automatically embeds in an `<iframe>` on the HIT's page.

2. Post the batch of HITs to Mechanical Turk, using the `mturk-utils/run.sh` script.  This script takes the prefix of the files described above (the `[experiment name]` part), and optional flags for running on the Sandbox (rather than the production, recommended for debugging), `-sandbox`, or doing nothing at all but echoing the commands that would be run (useful to check that the right input files are being used), `-n`
    mtadapt-demo $ mturk-utils/run.sh hits/vroomen-replication [-sandbox] [-n]
    
3. When results are available, they can be fetched using the `mturk-utils/retrieve.sh` script.  The resulting `.results` file can be parsed into `.csv` files, concatenating data from all subjects together by section and creating one file for each section (as specified in a configuration file).


# Core library

The core `js-adapt` javascript library orders and displays the stimuli, coordinates the various blocks of the experiment, excludes people who fail the pretest, collects the responses, and sends everything back to Amazon at the end.  It's included in this project (as a [subtree](http://psionides.eu/2010/02/04/sharing-code-between-projects-with-git-subtree/)), and is a separate repository that can be cloned [here](https://bitbucket.org/dkleinschmidt/jadapt) in case you want to include it in another project.  

