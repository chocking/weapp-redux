let { initializeStore } = require('./store/index.js');
let rootReducer = require('./store/reducers/index.js');

let store = initializeStore( rootReducer );


App({
    store
})