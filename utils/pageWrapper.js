/**
*		wrap page for redux
*		e.g.:
			Page(pageWrapper({
				connectData : {
					b({state, page}){
						return state.reducer_x.b;
					},
				},
			},{
				...page
			}))

		=======>

			page : {
				connectData : {...},
				data :{
					...(page.data),
					(...page.connectData)(),
				

				},
				//...methods
			}


*/
let util = require('util.js');
let { getStore, subscribe, unsubscribe } = require('../store/index.js');

//初始化pageInstance的connectData
function initConnectData(state, initPageOptions){
	if( initPageOptions.hasOwnProperty('connectData') ){
		initPageOptions.data = initPageOptions.data || {};

		Object.keys(initPageOptions.connectData).forEach(key=>{

			if( typeof initPageOptions.connectData[key] === 'function' ){

				if( initPageOptions.data.hasOwnProperty(key) ){
					console.error(`page已有${key}属性，将会覆盖`);
				}
	
				initPageOptions.data[key] = initPageOptions.connectData[key]({ state, page : initPageOptions });

			}

		})

	}

	return initPageOptions;
}
//刷新pageInstance的connectData
function updateConnectData(state, pageInstance){
	
	if( pageInstance.hasOwnProperty('connectData') ){
		updateConnectDataByKeys(state, pageInstance, Object.keys( pageInstance.connectData ));
	}
}

//根据keys刷新pageInstance的connectData
function updateConnectDataByKeys(state, pageInstance, keys){
	if( pageInstance.hasOwnProperty('connectData') ){

		if( !(keys instanceof Array) ){
			keys = [ keys ];
		}

		let connectData = {};

		keys.forEach(key=>{

			if( typeof pageInstance.connectData[key] === 'function' ){

				connectData[key] = pageInstance.connectData[key]({ state, page : pageInstance });

			}

		})

		updateConnectDataByData(state, pageInstance, connectData);
	}
}

//根据data刷新pageInstance的connectData
function updateConnectDataByData(state, pageInstance, data){

	if( Object.keys(data).length == 0 ){
		return;
	}

	
	let connectData = data;
	
	// 微信 把data set成undefined会报错
	Object.keys(connectData).forEach(key=>{
		if( connectData[key] === undefined ){
			connectData[key] = null;
		}
	})
	
	pageInstance.setData( connectData );
	
}


function buildHook(pageInstance){
	
	let hook = function(actionType, state){


		//  处理page级别的connectData
		if( pageInstance.connectData instanceof Object ){

			let data = {};

			Object.keys(pageInstance.connectData).forEach(key=>{
				
				if( typeof pageInstance.connectData[key] !== 'function' ){
					
					return;
				}
				/* 
					connectData[key]._deps中没有依赖接收此 actionType 的 store 的话，直接跳过
				*/

				let nameSpace = actionType.split('/')[0];

				if( pageInstance.connectData[key]._deps instanceof Array ){
					if( pageInstance.connectData[key]._deps.indexOf( nameSpace ) === -1 ){
						
						return;
					}
				}

				let nextConnectData = pageInstance.connectData[key]({ state, page : pageInstance });

				if( !util.shallowEqual( nextConnectData, pageInstance.data[key] ) ){
					data[key] = nextConnectData;
				}
				
			})

			updateConnectDataByData( state, pageInstance, data );
		}

	}

	return hook.bind(pageInstance);
}

function buildUpdateFunction(pageInstance){

	let updateFunction = function( updateKey ){

		let store = getStore(),
			state = store.getState();

		updateConnectDataByKeys( state, pageInstance, updateKey );

	}

	return updateFunction.bind(pageInstance)
}



module.exports = function(options, page){

	let store = getStore(),
		state = store.getState();
	
	let assignKeys = ['connectData'];

	assignKeys.forEach(key=>{
		if( options.hasOwnProperty( key ) ){

			if( key == 'connectData' && options[key] instanceof Object ){
				page[key] = options[key];
				page = initConnectData( state, page );
			}

		}
	})

	let srcOnLoad = page.onLoad,
		srcOnUnload = page.onUnload,
		srcOnShow = page.onShow,
		srcOnHide = page.onHide;

	//override the onLoad and onUnload for adding subscribe and unsubscribe abilities
	page.onLoad = function(){

		let store = getStore(),
			state = store.getState();

		let pageInstance = this;

		pageInstance.$store = store;


		//重新新建hook 防止微信的page实例复用时_hook 绑定的是之前的page实例
		this._hook = buildHook(this);

		//给page提供_update函数，主动更新connectData
		this._update = buildUpdateFunction(this);


		srcOnLoad && srcOnLoad.apply( this, arguments );
	}
	page.onUnload = function(){

		if( this._hook ){

			unsubscribe( this._hook );
		}

		srcOnUnload && srcOnUnload.apply( this, arguments );
	},

	page.onShow = function(){
		let store = getStore(),
			state = store.getState();

		let pageInstance = this;

		subscribe( this._hook );

		updateConnectData( state, pageInstance );

		srcOnShow && srcOnShow.apply( this, arguments );

	},
	page.onHide = function(){

		if( this._hook ){

			unsubscribe( this._hook );
		}

		srcOnHide && srcOnHide.apply( this, arguments );
	}

	return page;
}