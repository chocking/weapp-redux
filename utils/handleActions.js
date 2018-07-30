/**
 * 实现redux-actions 的 handleActions
 *
 * @param {*} actions
 * @param {*} state
 */
module.exports = function(actionHandler, initialState){

    return function(state, action){
        state = initialState;

        if( action && typeof actionHandler[action.type] === 'function' ){
            state = actionHandler[action.type]( state, action );
        }

        return state;
    }
}