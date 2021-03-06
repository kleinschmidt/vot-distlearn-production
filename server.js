var express = require('express')
  , bodyParser = require('body-parser')
  , browserify = require('browserify-middleware')
  , mturk_helpers = require('./js-adapt/mturk_helpers.js')
  , db = require('./server/db.js')
  , config = require('./experiment_config')
  , assign_condition = require('./server/conditions.js')(config)
  , update_status = require('./server/status.js')
  , logger = require('./server/logger')
  ;


var app = express();

// for PUT requests in status
app.use(bodyParser.urlencoded({extended: false}));

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

// assign conditions
app.get('/condition', assign_condition);

// middleware to update status
app.put('/status/:status', update_status);

// debugging middleware: blow up the database
if (process.env.NODE_ENV === 'development') {
    logger.info('GET /blammo to delete assignment records' +
                ' (filtered by query parameters)');
    app.use('/blammo', function(req, res, next) {
        db('assignments')
            .where(req.query)
            .del()
            .then(function(n) {
                logger.info('Blew up assignments table');
                res.send('blew up ' + n + ' rows. blammo!');
            });
    });
}

// Error handling

function logErrors(err, req, res, next) {
    if (err.stack) {
        logger.error(err.stack);
    } else {
        logger.error(err);
    }
    next(err);
}

function clientErrors(err, req, res, next) {
    res.status(500).send(err);
}

app.use(logErrors);
app.use(clientErrors);

// Start server

app.listen(3000, function() {
    logger.info('Experiment server running "%s" ("%s") in %s environment',
                config.experiment, config.batch, process.env.NODE_ENV);
});
