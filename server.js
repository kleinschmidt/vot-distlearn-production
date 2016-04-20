var express = require('express')
  , browserify = require('browserify-middleware')
  , mturk_helpers = require('./js-adapt/mturk_helpers.js')
  ;

var app = express();

app.get('/bundle.js', browserify(__dirname + '/expt_supunsup.js'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/expt_supunsup.html');
});

// for stimuli, imgs, etc.
app.use(express.static(__dirname + '/static'));

// for static HTML/css resources
app.use('/js-adapt', express.static(__dirname + '/js-adapt')); 

app.get('/condition', function(req, res) {
    console.log('Requested condition with query', req.query);
    console.log('Preview mode?', mturk_helpers.checkPreview(req.query));
    res.json({
        'mean_vots': {'b': 0, 'p': 60},
        'supunsup': 'unsupervised'
    });
});

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
