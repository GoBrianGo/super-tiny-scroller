function scroller({scrollMask, scrollTarget, perItemHeight, range, onScrollEnd}) {
    this.target = scrollTarget // 实际滚动的dom
    this.onScrollEnd = onScrollEnd // 每次滚动结束后会调用的事件
    this.perItemHeight = perItemHeight // 每一个选项的高度
    this.overHeight = 2 * perItemHeight // 头部或尾部滚动最多超多的高度
    this.LINEAR_FUNCTION = 'linear'
    this.CUBIC_FUNCTION = 'cubic-bezier(0, 0.78, 0.37, 1.01)'
    this.LINEAR_TIME = '0.15s'
    this.CUBIC_SHORT_TIME = '0.3s'
    this.CUBIC_LONG_TIME = '1s'
    this.range = range // 可滚动的范围
    this.duration = 0 // touchstart -> touchstart用的时间，用来计算滑动的速度
    this.originalY = 0 // touchstart开始的y坐标，后续在touchmove touchend也不会变
    this.startY = 0 // touchstart开始的y坐标,当触发touchmove的时候会把moveY的值替换
    this.moveY = 0 // touchmove的y坐标
    this.lastTransformY = 0 // 上一次的滚动的y坐标
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

    if (this.lastTransformY < this.range[0]) {
        this.transformY += (this.overHeight - (this.range[0] - this.lastTransformY)) / this.overHeight * (this.moveY - this.startY)
    }else if (this.lastTransformY > this.range[1]) {
        this.transformY += (this.overHeight - (this.lastTransformY - this.range[1])) / this.overHeight * (this.moveY - this.startY)
    }else {
        this.transformY += this.moveY - this.startY
    }

    this.transform(this.transformY)
    this.startY = this.moveY
}

scroller.prototype.scrollEndHandler = function(evt) {
    evt.preventDefault()

    if (this.lastTransformY < this.range[0] || this.lastTransformY > this.range[1]) {
        this.transformY = this.lastTransformY < this.range[0] ? this.range[0] : this.range[1]
        this.transform(this.transformY, this.CUBIC_SHORT_TIME)
        return
    }

    this.duration = +new Date() - this.duration

    let trnasformDuration = this.CUBIC_SHORT_TIME
    let moveDistance = evt.changedTouches[0].clientY - this.originalY
    let speed = Math.abs(moveDistance) / this.duration

    // 当滑动速度超过一定速度时，则页面快速滚动
    if (speed > 0.2) {
        let distance = speed * (speed > 0.6 ? 400 : speed > 0.35 ? 300 : 150)
        this.transformY += moveDistance < 0 ? -distance : distance
        trnasformDuration = this.CUBIC_LONG_TIME
    }

    // 当上一次y的坐标在range范围内，可是当前计算出来的transformy则不在range范围的情况下
    if ( (this.lastTransformY > this.range[0] && this.lastTransformY < this.range[1]) &&
         (this.transformY < this.range[0] || this.transformY > this.range[1]) ) {
        trnasformDuration = this.LINEAR_TIME
        this.setTransitionFunction(this.LINEAR_FUNCTION)
    }

    // 回弹的距离最多不超过overheight这个高度
    this.transformY = this.transformY < this.range[0] - this.overHeight ? this.range[0] - this.overHeight : this.transformY > this.range[1] + this.overHeight ? this.range[1] + this.overHeight : this.transformY

    // if (Math.abs(this.transformY - this.lastTransformY) < )
    this.transform(this.transformY, trnasformDuration)
}

scroller.prototype.transform = function(y = this.transformY, transitionDuration) {
    if (transitionDuration) {
        this.setTransitionDuration(transitionDuration)
    }

    this.lastTransformY = y
    this.target.style.webkitTransform = `translate3d(0, ${y}px, 0)`
    this.target.style.transform = `translate3d(0, ${y}px, 0)`
}

scroller.prototype.setTransitionDuration = function(transitionDuration = '0s') {
    this.target.style.webkitTransitionDuration = transitionDuration
    this.target.style.transitionDuration = transitionDuration
}

scroller.prototype.setTransitionFunction = function(transitionFunction) {
    this.target.style.webkitTransitionTimingFunction = transitionFunction
    this.target.style.transitionTimingFunction = transitionFunction
}

scroller.prototype.transitionEnd = function() {
    this.setTransitionDuration()
    this.onScrollEnd(this.transformY)

    if (this.transformY < this.range[0] || this.transformY > this.range[1]) {
        this.transformY = this.transformY < this.range[0] ? this.range[0] : this.transformY > this.range[1] ? this.range[1] : this.transformY
        this.setTransitionFunction(this.CUBIC_FUNCTION)
        this.transform(this.transformY, this.CUBIC_SHORT_TIME)
    }
}

