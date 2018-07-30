const { combineReducers } = require('../../utils/redux.min.js');


let counter = require('./counter');
let person = require('./person');


let rootReducer = combineReducers({
	counter,
	person
});

module.exports = rootReducer;