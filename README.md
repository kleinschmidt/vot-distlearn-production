# Visual world documentation

The relevant files for creating your own visual world experiment are:

* `expt_clayards08.js`: the experiment-specific logic, lists, etc.
* `js-adapt/visworldBlock.js`: the definition of the `VisworldBlock` class, which dispalys images, plays stimuli, and collects responses.  There's also a built-in familiarization practice section which displays the images with their names, which people click through.
* `js-adapt/vw-style.css`: additional stylesheet information for the visual world task, which defines the world div and the positions of the images.

Right now, the code shows images in the four corners of the visual world `div`.  The data structure which specifies the actual experiment and stimuli has three parts.

1. The acoustic stimuli to be played, which are specified in a `Stimuli` object (see `js-adapt/stimuli.js`).
2. The images to be display, which are stored in a json object whose values are the (local) path to each image file and the keys are used as shorthand names later on.  For instance, for the Clayards et al. (2008) replication (below), the images are defined as

        :::javascript
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

3. The actual experimental lists, which are specified as an array of json objects.  Each list object has three fields: 

        :::javascript
        var lists = [
            {
                stimuli: stim_beach_peach,
                images: ['beach', 'peach', 'race', 'lace'],
                reps: bp_reps
            },
        ...
The `reps` field is an array of how many repetitions for each continuum item in the `stimuli` field.

# Demo: Clayards (2008) replication

There is a demo experiment that uses a visual world paradigm, a replication of

*  Clayards, M. A., Tanenhaus, M. K., Aslin, R. N., & Jacobs, R. A. (2008). Perception of speech reflects optimal use of probabilistic speech cues. _Cognition, 108(3)_, 804–9. [doi:10.1016/j.cognition.2008.04.004](http://dx.doi.org/10.1016/j.cognition.2008.04.004)

## Design

Clayards et al. (2008) used a /b/-/p/ contrast that varied in VOT (and, from the sound of it, other cues, like F1), exposing listeners to distributions with means of 0 and 50ms VOT, and variances of about 70 in the low-variance condition and 180 in the high-variance condition.  Their design used a visual world word identification task, where listeners clicked on a picture matching the spoken word.  The minimals pairs used were

* beach-peach
* bees-peas
* beak-peak
* rake-lake
* ray-lei
* race-lace
 
with the /r/-/l/ pairs acting as controls and exhibiting no variability.  76 tokens were presented from each pair, for a total of 456 trials (including 228 fillers).  The dependent measure was a combination of eye movements (looks to the distractor indexing uncertainty), reaction times, and classification decisions (since the competitor was present on every trial)

The stimulus image arrays were three unique arrays: beach+race, bees+rake, and beak+ray, with the positions of the four images randomly set on each trial.  The trials were randomly ordered (based on the lists Mehgan sent, and the Methods section of the paper).

Breaks were provided every 100 trials.  Images were introduced by a passive viewing familiarization task with written labels.  For the MTurk version, I've added a sound check.  We'll have to check boundaries after the fact...

## Stimuli

Stimuli were synthesized using Klattworks.  VOT continua vary from -30ms to +80ms, with apparent corresponding changes in f0/F1 onset at positive VOTs.  

## Timing and payment: 

Based on my testing, looks like the instructions will take like 5-6 minutes, and each block of 100 trials takes 5-6 minutes, for about 30 minutes overall.  45 minutes for the whole thing should be fine.
