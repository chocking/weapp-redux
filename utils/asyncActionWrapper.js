let { getStore } = require('../store/index.js');

module.exports = function(fn){

	return function(){
		let store = getStore(),
			state = store.getState(),
			dispatch = store.dispatch;

		//多参数用对象作为参数
		let payload = arguments[0];
		return fn.call( null, payload, {store, state, dispatch} );
	}
}