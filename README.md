The live version is [here](https://www.hlp.rochester.edu/mturk/mtadapt/sup-unsup/) (open up the javascript console if you want to see the output).

## Pilot turk experiment

This is a pilot of the proposed imaging design to see how the synthetic stimuli work with the amount of exposure we're looking to use.

Goal is to see if a "supervised" version where at least the most prototypical items are shown with only one possible answer speeds things up at all.  Category mean stimuli will be shown with only one plausible answer, e.g. "[bp]each" with a picture of a beach and a peak.  The "shoulder" stimuli (mean plus or minus 10ms VOT) will be shown as minimal pairs.  All others will be like the centers (for about 50/50 supervised/unsupervised trials).

* /b/ VOT starting mean of 0ms, 10ms, 20ms, or 30ms
* Unsupervised vs. supervised.

* 30 subjects per condition (240 overall)

### Stimuli

Stimuli will be b/p items from the Clayards et al. (2008) study:

* beach/peach
* beak/peak
* bees/peas

### Design

Each trial will have two images, one /b/ and one /p/.  On _unsupervised_ trials, the two options will be a minimal pair.  On _supervised_ trials, they will be a non-minimal pair.

There will be a total of 222 trials, which works out to be about 3/4 of the Munson (2011) design (for one talker over both sessions).  Thus for each category (b/p)/word, there will be the following number of repetitions (where +0ms refers to the category mean):

offset      | -20ms | -10ms | +0ms  | +10ms | +20ms
--------|-------|-------|-------|-------|-------
category  | 3         | 27       | 51       | 27       | 3
word       | 1         | 9         | 17       | 9         | 1

The /b/ category mean will be 0ms, 10ms, 20ms, or 30ms, depending on the condition, with the /p/ category mean 40ms higher.

In the supervised condition, the +0ms and +/-20ms words will all be supervised trials (total of 57 per category, 29 per word), while the +/-10ms words will all be unsupervised

#### Lists

This all results in these lists (for the supervised condition):

* Supervised trials:
    * Images: beach/peas:
        * beach + [-20, 0, 20]
        * peas + [-20, 0, 20]
    * Images: bees/peak:
        * bees + [-20, 0, 20]
        * peak + [-20, 0, 20]
    * Images: beak/peach:
        * beak + [-20, 0, 20]
        * peach + [-20, 0, 20]
* Unsupervised trials:
    * Images: beach/peach:
        * beach + [-10, 10]
        * peach + [-10, 10]
    * Images: bees/peas:
        * bees + [-10, 10]
        * peas + [-10, 10]
    * Images: beak/peak:
        * beak + [-10, 10]
        * peak + [-10, 10]

For the unsupervised condition, the images for the "supervised" trials will be replaced by the corresponding minimal pair images.

## Timing and payment: 

Based on my testing, looks like the instructions will take like 5-6 minutes, and each block of 100 trials takes 5-6 minutes, for about 10-15 minutes overall.  20 minutes for the whole thing should be fine.
