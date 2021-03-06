////////////////////////////////////////////////////////////////////////////////
// GUI/helper things

var $ = require('jquery')
  ;

// display a "continue" button which executes the given function
module.exports.continueButton = function continueButton(fcn, validateFcn) {
    $("#continue")
        .show()
        .unbind('click.cont')
        .bind('click.cont', function() {
                  if (typeof(validateFcn) !== 'function' || 
                      typeof(validateFcn) === 'function' && validateFcn()) 
                  {
                      $(this).unbind('click.cont');
                      $(this).hide();
                      fcn();
                  }
              });
};


// collect a keyboard response, with optional timeout
module.exports.collect_keyboard_resp = function collect_keyboard_resp(fcn, keys, to, tofcn) {
    var namespace = '._resp' + (new Date()).getTime();
    $(document).bind('keyup' + namespace, function(e) {
        if (!keys || keys.indexOf(String.fromCharCode(e.which)) != -1) {
            $(document).unbind(namespace);
            fcn(e);
            e.stopImmediatePropagation();
            return false;
        } else {
            return true;
        }
    });

    if (typeof tofcn !== 'undefined') {
        $(document).bind('to' + namespace, function() {
                             $(document).unbind(namespace);
                             tofcn();
                         });
    }

    if (typeof to !== 'undefined') {
        // timeout response after specified time and call function if it exists
        setTimeout(function(e) {
                       $(document).trigger('to' + namespace);
                       $(document).unbind(namespace);
                   }, to);
    }
};

// display an error message
module.exports.errorMessage = function errorMessage(message) {
    $("#textContainer")
        .children()
        .hide();

    $("#textContainer")
        .append('<div class="error"><h1>Sorry, something went wrong</h1>' +  
                '<p>If there\'s been a technical error, ' + 
                'please <a href="mailto:hlplab@gmail.com">let us know</a>'+
                ' what happened so we can get things sorted out.</p> </div>')
        .show();

    console.log('ERROR:', message);
};
