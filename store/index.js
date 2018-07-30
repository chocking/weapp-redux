const { createStore, applyMiddleware } = require('../utils/redux.min.js');

let store;

let _hooks = [];  //页面钩子

/**
 * 初始化store 单例
 *
 * @param {*} rootReducer
 * @returns
 */
function initializeStore(rootReducer){ 
	if( store ){
		return store;
	}

	store = createStore(rootReducer, applyMiddleware(hookMiddleware));

	store._hooks = _hooks;

	return store;
}

/**
 * 返回全局单例store
 *
 * @returns
 */
function getStore(){
	return store;
}


/**
 * 
 *
 * @param {*} {getState, dispatch}
 * @returns
 */
function hookMiddleware({getState, dispatch}){
	return next => action => {
        // before dispatch

        // Call the next dispatch method in the middleware chain.
        let returnValue = next(action)

        let state = getState();

        // after dispatch

		// 触发页面钩子 按需更新page.data
		_hooks.forEach(hook=>{
			hook( action.type, state );
		})
  
        
        return returnValue;
    }
}

/**
 * page.onLoad时插入钩子
 *
 * @param {*} hook
 */
function subscribe( hook ){

	if( _hooks.indexOf( hook ) === -1 ){

		_hooks.push( hook );

	}
}

/**
 * page.onUnload时移除钩子
 *
 * @param {*} hook
 */
function unsubscribe( hook ){

	let index = _hooks.indexOf( hook );

	if( index !== -1 ){
		_hooks.splice(index, 1);

	}

}

module.exports = {
	initializeStore,
	getStore,
	subscribe,
	unsubscribe,
}