/* 
    手动给connectData 函数添加_deps数组
    e.g. : 
        srcFn : depsWrapper(['a','b','c'], ({state , page})=>{})
                =>


        srcFn = ({state , page})=>{};
        srcFn._deps = ['a','b','c']
*/


module.exports = function(depsArr, srcFn){
    if( !(depsArr instanceof Array) || typeof srcFn !== 'function' ){
        console.error('depsWrapper only receives (Array, Function) as args');
        return;
    }

    srcFn._deps = depsArr;

    return srcFn;
}