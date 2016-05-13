var R = require('ramda')
  , list_balancing_counts = require('./list_balancing_counts');

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
// vary /b/ mean
var b_conditions = R.map(make_cond(R.__, 50), [-20, -50, -80]);
// vary /p/ mean
var p_conditions = R.map(make_cond(10, R.__), [50, 80]);


// add list_id to list objects
var add_list_id = function(c, id) {return R.assoc('list_id', id, c);};
// a map function which provides index to f
var mapIndex = R.addIndex(R.map); 
var lists = mapIndex(add_list_id, R.concat(b_conditions, p_conditions));

// add list balancing counts
var merge_one_by = R.curry(function(prop, cs, l) {
    var find_match_by_prop = R.find(R.propEq(prop, R.prop(prop, l)));
    return R.merge(l, find_match_by_prop(cs));
});
lists = R.map(merge_one_by('list_id', list_balancing_counts), lists);


module.exports = lists;
