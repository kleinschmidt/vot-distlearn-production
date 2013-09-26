# VOT variance experiment

This experiment is an attempt to replicate the results of Clayards et al. (2008) using a more selective adaptation-like paradigm, over MTurk.  

# Clayards (2008) replication

Before doing the selective adaptation-like paradigm, we want to make sure that we can replicated the original findings using the original visual world paradigm.

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

Breaks were provided every 100 trials.  Images were introduced by a passive viewing familiarization task with written labels (TODO).  For the MTurk version, we'll probably want to add some kind of test to make sure people aren't being idiots (TODO).  We'll also probably want to add some kind of phonetic validation (TODO).

## Stimuli

Stimuli were synthesized using Klattworks.  VOT continua vary from -30ms to +80ms, with apparent corresponding changes in f0/F1 onset at positive VOTs.  

# Follow up: from words to syllables

## Extracting /bi/-/pi/ continuum

Based on eyeballing things in Praat, taking the first 350 ms of each token seems to get the onset C and the vowel no problem.  Everything is aligned such that the release is at the same time in each consonant (at 100ms).  The vowel is 240ms long.

I decided to go with the "beach"-"peach" continuum because it ends in a alveolar stop and has relatively little movement of the formants (compared to "beak"), and because it ends in a voiceless stop (unlike "bees") so it's easy to identify the end of the vowel.

## Serving locally for testing

I've had a lot of success with using a node.js server.  In particular, the [http-server](https://npmjs.org/package/http-server) package makes the whole process very simple.