# 微信小程序 + redux 简单实现

---

## 最终目的

> * 全局共享的状态管理
> * 全局状态能绑定到page的data上并同步更新
> * 页面或组件能触发状态更新的action
> * 无需构建

## 思路

 1. 使用`npm`下载`redux`并使用其dist目录中的redux.min.js
 2. 创建全局store，提供订阅和取消订阅`钩子`，在自定义中间件中执行钩子
 3. store由多个reducer组成，每个reducer充当特定领域模型并提供action函数(`支持异步`)
 4. 实现`pageWrapper`函数，对page的参数进行预处理，对其`connectData`跟全局store作绑定

## 准备工作

从`npm`找一个`redux.js`

```javascript
npm install redux
cp ./node_modules/redux/dist/redux.min.js ./utils/
```


## 开始

> 创建store `store/index.js`

```javascript
...
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
...
```
使用了redux提供的中间件api监听action变化，为同步更新试图提供了基础条件

> 仿照redux-actions创建handleActions函数`utils/handleActions.js`
```javascript
module.exports = function(actionHandler, initialState){

    return function(state, action){
        state = initialState;

        if( action && typeof actionHandler[action.type] === 'function' ){
            state = actionHandler[action.type]( state, action );
        }

        return state;
    }
}
```
整个函数就几行代码，传参和redux-actions的handleActions函数一样，本来可以直接使用npm下载redux-actions来使用，但是新版本的redux-actions生成文件使用了window、eval关键字，不支持在小程序中直接引用，而且文件也比较多用不到的方法函数，所以几行简单代码替代了redux-actions

> reducer示例
```javascript
let personReducer = handleActions({

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

personReducer.getList = asyncActionWrapper(function(payload, {store, state, dispatch}){

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
```
其中asyncActionWrapper为封装函数，其实也可以在生成action的时候统一用asyncActionWrapper，省去了每个action都要包装一次的麻烦

> 实现pageWrapper函数，供页面绑定store中的数据。`utils/pageWrapper.js`

这里的思路是：
**onload**的时候初始化其绑定数据并建立钩子函数；
**onShow**时把钩子扔到store的钩子数组中；
**onHide**和**onUnload**时移除钩子。

具体实现可看源码，这里有几个注意点：

 1. 在拿到新的store数据(newConnectData)准备更新页面的data时,如果newConnectData中含有undefined的值，小程序进行page.setData会报错，所以把undefined置换成null
 2. 一个页面可能有多个connectData项，为了减少setData的调用，把所有需要更新的项计算出来之后才进行一次setData
 3. 在判断connectData某一项是否要更新时，是采用了react-redux中一样的**shallowEqual**算法，所以在某些场景可能造成意料之外的结果
**例如** connectData中某一项是原样返回state.person.list &lt;Array&gt;
 
 ```javascript
    connectData : {
        list({state , page})=>{
            return state.person.list;
        }
    }
 ```
 而同时personReducer中的某个actionHandler中没有对对象属性做特殊处理
 ```javascript
    ['person/INSERT'] : (state, action) => {
        state.list.push('Mark John');
        return {...state}; // state.list引用没变
        /*return {
            ...state, 
            list: [...state.list]
        }; 
            state.list引用变了
        */
    }
 ```
这时候connectData在对list的脏值判断中，因为**shallowEqual**对同一引用视作相等，所以'person/INSERT'不会触发页面的更新,解决方法之一就是像上述代码的注释一样，对对象类型的属性做特殊处理，另一个方法是在connectData中对对象类型的数据用解构赋值产生新的对象
 ```javascript
    connectData : {
        list({state , page})=>{
            return [...state.person.list];
        }
    }
 ```
 
> page的示例用法

```javascript
...
Page(pageWrapper({
    connectData : {
        counterNum : depsWrapper(['counter'], ({state , page})=>{
            return state.counter.num + page.data.afterAddon;
        }),
        persons : depsWrapper(['person'], ({state , page})=>{
            return [...state.person.list];
        })
    }
},{
    data: {
        afterAddon : '个',
    },
    onShow(){
        console.log(this.$store);
        console.log(this._update);
    }
})
...
```

其中**depsWrapper**封装函数是用来注明依赖的reducer的，action.type不属于依赖的reducer则会跳过脏值判断，更geek的做法是用UglifyJs对connectData函数做AST(抽象语法数)解析，找出其中对哪些reducer有依赖，但是这意味着需要对代码做构建，和这次的简单实现有悖，所以不做实现。

> 最后参照`index.wxml`看一下实际的效果
```html
<view class='container'>
    counterNum : {{counterNum}}
    <view class='btns'>
        <button size='mini' bind:tap='onReduce'>-</button>
        <button size='mini' bind:tap='onAdd'>+</button>
    </view>

    <view class='list'>
        <view wx:for="{{persons}}" wx:key="*">{{item}}</view>
    </view>

    <view class='btns'>
        <button size='mini' bind:tap='onGetList'>getList</button>
        <button size='mini' bind:tap='onClear'>clear</button>
    </view>
</view>
```
![g](https://user-images.githubusercontent.com/9400461/43399457-af631454-943d-11e8-8ede-71f96dd3086a.gif)