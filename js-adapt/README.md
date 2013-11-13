# J'Adapt read-me

This is the core set of javascript files for j'adapt, a paradigm for running phonetic adaptation experiments over the internet, in subjects' web browsers.

# Block interfaces

## Experiment control and instructions blocks

## `InstructionSubsectionsBlock`

This shows information (text, images, etc.) in an interactive way, organized into subsections.  Each subsection starts off collapsed (just headline visible), and each has a button or checkbox to advance to the next subsection.  Checkboxes must all be checked to advance to the next block.

Input is specified as a JSON object, with fields 

- `title`: overall title for instructions (always shown)
- `mainInstructions`: general instructions (always shown)
- `subsections`: an array of JSON objects specifying each subsection.
 
Each subsection is also a JSON object, with fields

- `title`: the headline for the subsection (always shown)
- `content`: the actual body of the subsection, which will be hidden until the subject advances to this subsection.  Can be a string (which will be wrapped in `<p></p>`), an array of strings (each of which will be wrapped in `<p></p>`, or an array of `{subtitle: 'text', content: 'text'}` objects, which can be used for further divisions within the subsection.  
- `checkboxText` (optional): Text label for a confirmation checkbox.  If omitted, no checkbox will be shown and there will be a button to advance to the next section.

Because everyone likes examples: 

    :::javascript
    var instructions = new InstructionsSubsectionsBlock(
        {
            title: 'the title of the instructions!',
            mainInstructions: 'Here\'s some text describing the instructions that should always appear',
            subsections: [
                {
                    title: 'section 1', 
                    contentHTML: '<h4>subheader</h4> <p>here\'s what is up w/ section one</p>', 
                    checkboxText: 'make sure you click this'
                },
                {
                    title: 'section 2!',
                    content: 'and this is some stuff about section 2'
                },
                {
                    title: 'yet another section',
                    content: ['here\'s a paragraph.', 'here is another paragraph!'],
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
