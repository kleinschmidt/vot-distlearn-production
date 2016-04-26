var express = require('express')
  , browserify = require('browserify-middleware')
  , mturk_helpers = require('./js-adapt/mturk_helpers.js')
  , db = require('./server/db.js')
  , lists = require('./lists')
  , assign_condition = require('./server/conditions.js')(lists)
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

// middleware to detect preview mode
app.use(function (req, res, next) {
    req.preview_mode = mturk_helpers.checkPreview(req.query);
    next();
});

app.get('/condition', assign_condition);


// debugging middleware: blow up the database
if (process.env.NODE_ENV === 'development') {
    console.log('GET /blammo to delete assignment records' +
                ' (filtered by query parameters)');
    app.use('/blammo', function(req, res, next) {
        db('assignments')
            .where(req.query)
            .del()
            .then(function(n) {
                console.log('Blew up assignments table');
                res.send('blew up ' + n + ' rows. blammo!');
            });
    });
}

// Error handling

function logErrors(err, req, res, next) {
    console.error(err);
    next(err);
}

function clientErrors(err, req, res, next) {
    res.status(500).send(err);
}

app.use(logErrors);
app.use(clientErrors);

// Start server

app.listen(3000, function() {
    console.log('Listening on port 3000');
});
