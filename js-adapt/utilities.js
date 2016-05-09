
module.exports = {
    // repeat x, n times
    repeat: function repeat(x, n) {
        if (typeof(n) !== "number") {
            throw "Number of reps must be numeric";
        } else {
            var y=Array(n);
            for (var i=0; i<n; i++) {
                y[i] = x;
            }
            return(y);
        }
    },

    // repeat Array x until length is n, slicing long arrays to make them length n
    repeatToLength: function repeatToLength(x, n) {
        // put x in an array if it's naked
        x = [].concat(x);
        var y = x;
        while (y.length < n) {
            y = y.concat(x);
        }
        return(y.slice(0,n));
    },

    // function to create a truly random (shuffled) item order, either from an array
    // of repetition numbers or from a uniform number of repetitions and number of items n.
    randomOrder: function randomOrder(reps, n) {
        // if reps is specified as a constant, convert to an array
        if (typeof(reps) === "number" || reps.length == 1) {
            if (typeof(n) !== "undefined") {
                reps = (function(N) {var x=[]; for (var i=0; i<N; i++) {x[i] = reps;}; return(x);})(n);
            } else {
                throw "Must provide either vector of repetitions or number of stimuli";
            }
        }

        var itemOrder = [];
        for (var i=0; i<reps.length; i++) {
            for (var j=0; j<reps[i]; j++) {
                itemOrder.push(i);
            }
        }

        return this.shuffle(itemOrder);
    },

    // function to pseduo-randomize stimuli lists.  takes either vector of repetitions for
    // each item, or (scalar) number of repetitions for each item and the length of the continuum.
    pseudoRandomOrder: function pseudoRandomOrder(reps, n, method) {
        // if reps is specified as a constant, convert to an array
        if (typeof(reps) === "number" || reps.length == 1) {
            if (typeof(n) !== "undefined") {
                reps = (function(N) {var x=[]; for (var i=0; i<N; i++) {x[i] = reps;}; return(x);})(n);
            } else {
                throw "Must provide either vector of repetitions or number of stimuli";
            }
        }

        // method of pseudorandomization
        if (typeof(method) === 'undefined') {
            // default to extreme_early
            method = 'extreme_early';
        } else if (method == 'shuffle') {
            // if specifying "shuffle", do a full randomization.
            return this.randomOrder(reps, n);
        } else if (method == 'fixed') {
            var itemOrder = [];
            for (var i=0; i<reps.length; i++) {
                for (var j=0; j<reps[i]; j++) {
                    itemOrder.push(i);
                }
            }
            return itemOrder;
        }

        // pseudo-random order for stimuli: create blocks with one of
        // each stimulus, shuffle within each block and shuffle order
        // of blocks (only necessary because of non-uniform repetitions)
        var repsRem = reps.slice(0);
        var block = [];
        var blocks = [];
        do {
            block = [];
            for (var i=0; i<repsRem.length; i++) {
                if (repsRem[i] > 0) {
                    block.push(i);
                    repsRem[i]--;
                }
            }
            // randomize order of stimuli in THIS block
            blocks.push(this.shuffle(block));
        } while (block.length > 0);

        // DON'T RANDOMIZE order of blocks, so that extreme stimuli are guaranteed
        // to be more common early on
        // ...and concatenate each shuffled block to list of trials
        var stims = [];
        switch(method) {
        case 'extreme_early':
            for (var i=0; i<blocks.length; i++) {
                stims = stims.concat(blocks[i]);
            }
            break;
        case 'extreme_late':
            for (var i=blocks.length; i>0; i--) {
                stims = stims.concat(blocks[i-1]);
            }
            break;
        case 'shuffle_blocks':
            blocks = this.shuffle(blocks);
            for (var i=0; i<blocks.length; i++) {
                stims = stims.concat(blocks[i]);
            }
            break;
        default:
            if (console) {console.log('ERROR: bad randomization method: ' + method);}
            throw('bad randomization method: ' + method);
        }

        return(stims);
    },



    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [rev. #1]
    //  shuffle the input array
    shuffle: function shuffle(v){
        for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
        return v;
    },


    // reverse map lookup (get key given value)
    valToKey: function valToKey(obj, v) {
        var keys = [];
        for (var k in obj) {
            if (obj[k]==v) {
                keys.push(k);
            }
        }
        return(keys);
    },

    // Function to detect if object is an array, from http://stackoverflow.com/a/1058753
    isArray: function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

};                              // end module.exports

// Some vector math helper functions (get max, min, range, and sum of a numeric Array)
Array.max = function( array ){
    return Math.max.apply( Math, array );
};
Array.min = function( array ){
    return Math.min.apply( Math, array );
};
Array.range = function(array) {
    return Array.max(array) - Array.min(array);
};
Array.prototype.sum = function() {
    var s=0;
    for (var i=0; i<this.length; i++) {
        s += this[i];
    };
    return(s);
};

// python style string formatting.  Replace {0} with first argument, {1} with second, etc.
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};
