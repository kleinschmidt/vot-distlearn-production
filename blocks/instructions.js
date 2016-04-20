var InstructionsSubsectionsBlock = require('../js-adapt/instructionssubsectionsBlock')
, SoundcheckBlock = require('../js-adapt/soundcheckBlock')
;

module.exports = function(e) {
    return new InstructionsSubsectionsBlock(
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
};
