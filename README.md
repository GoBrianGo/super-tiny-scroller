## 一个简单的移动端滚动插件

## 使用方法
```
new scroller({
    scrollMask: document.getElementsByClassName('list')[0], // 当touch滑动的dom和真正滚动的dom不是同一个的时候用到，当是同一个时则写相同的dom即可
    scrollTarget: document.getElementsByClassName('list')[0], // 真正滚动的dom
    perItemHeight: 34, // 回弹的距离为该参数的2倍
    range: [-223, 0], // 滑动的返回
    onScrollEnd: function(y) {
        // 每次滑动结束后的回掉
    },
})
```