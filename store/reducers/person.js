let handleActions = require('../../utils/handleActions');
let asyncActionWrapper = require('../../utils/asyncActionWrapper');


let reducer = handleActions({

    ['person/CLEAR'] : (state, action) =>{

       state.list = [];
       
       return {...state};
    },

    ['person/SET'] : (state, action) => {

        state.list = action.payload;
       
        return {...state};
    }

}, {
   list : []
})


reducer.clear = asyncActionWrapper(function(payload, {store, state, dispatch}){

    dispatch({
        type : 'person/CLEAR',
    })

})

reducer.getList = asyncActionWrapper(function(payload, {store, state, dispatch}){

    return new Promise((resolve, reject)=>{

        setTimeout(()=>{

            dispatch({
                type : 'person/SET',
                payload : ['Jack Ma', 'Jackon Ma', 'Pony Ma', 'Tony Ma']
            })

            resolve();
        }, 1500);
        
    })

})


module.exports = reducer;