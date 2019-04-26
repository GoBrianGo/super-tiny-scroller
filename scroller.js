function scroller({scrollMask, scrollTarget, perItemHeight, range, onScrollEnd}) {
    this.target = scrollTarget // 实际滚动的dom
    this.onScrollEnd = onScrollEnd // 每次滚动结束后会调用的事件
    this.perItemHeight = perItemHeight // 每一个选项的高度
    this.range = range // 可滚动的范围
    this.duration = 0 // touchstart -> touchstart用的时间，用来计算滑动的速度
    this.originalY = 0 // touchstart开始的y坐标，后续在touchmove touchend也不会变
    this.startY = 0 // touchstart开始的y坐标,当触发touchmove的时候会把moveY的值替换
    this.moveY = 0 // touchmove的y坐标
    this.transformY = 0 // 实际滚动了的y坐标
    this.direction = 0 // 0: 向上滑动 1：向下滑动

    scrollMask.addEventListener('touchstart', this.scrollStartHandler.bind(this))
    scrollMask.addEventListener('touchmove', this.scrollMoveHandler.bind(this))
    scrollMask.addEventListener('touchend', this.scrollEndHandler.bind(this))

    scrollTarget.addEventListener('webkitTransitionEnd', this.transitionEnd.bind(this))
    scrollTarget.addEventListener('transitionEnd', this.transitionEnd.bind(this))
}

scroller.prototype.scrollStartHandler = function(evt) {
    evt.preventDefault()
    this.duration = +new Date()
    this.originalY = this.startY = evt.targetTouches[0].clientY
}

scroller.prototype.scrollMoveHandler = function(evt) {
    // 阻止滚动默认事件
    evt.preventDefault()
    this.moveY = evt.targetTouches[0].clientY
    this.direction = this.moveY > this.startY ? 1 : 0
    this.transformY += this.moveY - this.startY
    this.transform(this.transformY)
    this.startY = this.moveY
}

scroller.prototype.scrollEndHandler = function(evt) {
    evt.preventDefault()

    this.duration = +new Date() - this.duration

    let trnasformDuration = '0.3s'
    let moveDistance = evt.changedTouches[0].clientY - this.originalY
    let speed = Math.abs(moveDistance) / this.duration

    // 当滑动速度超过一定速度时，则页面快速滚动
    if (speed > 0.2) {
        let distance = speed * (speed > 0.6 ? 400 : 150)
        this.transformY += moveDistance < 0 ? -distance : distance
        trnasformDuration = '1s'
    }

    this.transformY = this.transformY < this.range[0] ? this.range[0] : this.transformY > this.range[1] ? this.range[1] : this.transformY
    this.transform(this.transformY, trnasformDuration)
}

scroller.prototype.transform = function(y = this.transformY, transitionDuration) {
    if (transitionDuration) {
        this.setTransitionStyle(transitionDuration)
    }

    this.target.style.transform = `translate3d(0, ${y}px, 0)`
    this.target.style.webkitTransform = `translate3d(0, ${y}px, 0)`
}

scroller.prototype.setTransitionStyle = function(transitionDuration = '0s') {
    this.target.style.transitionDuration = transitionDuration
    this.target.style.webkitTransitionDuration = transitionDuration
}

scroller.prototype.transitionEnd = function() {
    this.setTransitionStyle()
    this.onScrollEnd(this.transformY)
}
