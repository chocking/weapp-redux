
var hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}

let util = {};

    /*isNull*/
util.isNull = function(item) {
    return item === null || item === undefined || item === '';
}

//copy from react-redux https://github.com/reactjs/react-redux/blob/master/src/utils/shallowEqual.js
util.shallowEqual = function(objA, objB) {
    if (is(objA, objB)) return true;
    
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
        return false;
    }
    
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    
    if (keysA.length !== keysB.length) return false;
    
    for (var i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
            return false;
        }
    }
    
    return true;

    
}


module.exports = util;