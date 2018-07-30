let handleActions = require('../../utils/handleActions');
let asyncActionWrapper = require('../../utils/asyncActionWrapper');


let reducer = handleActions({

    ['counter/ADD'] : (state, action) =>{

       state.num++;
       
       return {...state};
    },

    ['counter/REDUCE'] : (state, action) => {

        state.num--;
       
        return {...state};
    }

}, {
   num : 0
})


reducer.add = asyncActionWrapper(function(payload, {store, state, dispatch}){

    dispatch({
        type : 'counter/ADD',
    })

})

reducer.reduce = asyncActionWrapper(function(payload, {store, state, dispatch}){

    dispatch({
        type : 'counter/REDUCE',
    })

})


module.exports = reducer;