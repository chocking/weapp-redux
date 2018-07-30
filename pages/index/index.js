// pages/index/index.js
let pageWrapper = require('../../utils/pageWrapper');
let depsWrapper = require('../../utils/depsWrapper');

let {add, reduce} = require('../../store/reducers/counter');
let {getList, clear} = require('../../store/reducers/person');

Page(pageWrapper({
    
    connectData : {
        counterNum : depsWrapper(['counter'], ({state , page})=>{
            return state.counter.num + page.data.afterAddon;

        }),

        persons : depsWrapper(['person'], ({state , page})=>{
            return [...state.person.list];

        }),
    }

    

 
},{
    data: {
        afterAddon : '个',
    },

    onShow(){
        console.log(this.$store);
        console.log(this._update);
    },

    onAdd(){
        add();
    },

    onReduce(){
        reduce();
    },

    onGetList(){
        wx.showLoading({
            title : '异步加载中',
            mask : true
        });

        getList().then(()=>{
            wx.hideLoading();
        })
    },

    onClear(){
        clear();        
    }
}))
