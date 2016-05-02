var R = require('ramda');

// make lists that look like:
// 
// [
//     {
//         'list_id': 0,
//         'condition': {
//             'mean_vots': {'b': 0, 'p': 60},
//             'supunsup': 'unsupervised'
//         }
//     }, 
//     {
//         'list_id': 1,
//         'condition': {
//             'mean_vots': {'b': 10, 'p': 60},
//             'supunsup': 'unsupervised'
//         }
//     }, 
//     {
//         'list_id': 2,
//         'condition': {
//             'mean_vots': {'b': 10, 'p': 70},
//             'supunsup': 'unsupervised'
//         }
//     }
//     ...


// 
var make_cond = R.curry(function(bvot, pvot) {
    return {
        'condition': {
            'mean_vots': {'b': bvot, 'p': pvot},
            'supunsup': 'unsupervised'
        }
    };
});

// generate list objects with conditions:
// vary /b/ mean, from -40 to 10 (with /p/ mean always 50).
var b_conditions = R.map(make_cond(R.__, 50), [10, 0, -10, -20, -30, -40]);
// vary /p/ mean, from 40 to 90 (with /b/ mean always 0).
var p_conditions = R.map(make_cond(0, R.__), [40, 50, 60, 70, 80, 90]);


// add list_id to list objects
var add_list_id = function(c, id) {return R.assoc('list_id', id, c);};
// a map function which provides index to f
var mapIndex = R.addIndex(R.map); 
var lists = mapIndex(add_list_id, R.concat(b_conditions, p_conditions));

module.exports = lists;
