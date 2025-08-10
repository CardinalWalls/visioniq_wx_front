// components/mainContainer/mainContainer.js
let _this;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 容器高度
    height: {
      type: Number,
      value: 400
    },
    // 设置竖向滚动条位置
    scrollTop: {
      type: Number,
      value: 0
    },
     // 在设置滚动条位置时使用动画过渡
    scrollWithAnimation: {
      type: Boolean,
      value: false
    },
    // 滑动减速速率控制 (同时开启 enhanced 属性后生效)
    fastDeceleration: {
      type: Boolean,
      value: false
    },
    // 是否开始下拉
    refresherEnabled: {
      type: Boolean,
      value: true
    },
    // 是否显示滚动条
    showScrollbar: {
      type: Boolean,
      value: true
    },
    // 是否允许滚动
    scrollY: {
      type: Boolean,
      value: true
    },
    // 是否允许滚动
    enhanced: {
      type: Boolean,
      value: false
    }, 
    refresherDefaultStyle: {
      type: String,
      value: 'black' // black | white | none
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //是否开启刷新
    refresher: false,
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    console.log('child attached');
  },
  // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function () {
    _this = this;
    console.log('child ready');
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
   * 自定义下拉刷新控件被下拉
   */
    _pulling() { 
      console.log('child pull');
      this.triggerEvent('pulling', {});
    },

    /**
     * 自定义下拉刷新被触发
     */
    _refresh: function () {
      if (this._freshing) return
      this._freshing = true
      setTimeout(() => {
        this.setData({
          refresher: false,
        })
        this._freshing = false
      }, 1000)

      console.log('child refresh');
      this.triggerEvent('refresh', {});
    },

    /**
     * 自定义下拉刷新被复位
     */
    _restore() {
      console.log('child restore2');
    },

    /**
     * 自定义下拉刷新被中止
     */
    _abort() {
      console.log('child abort');
    },

    /**
     * 自定义滚动到底部，翻页
     */
    _lower: function (e) {
      console.log('child add');
      this.triggerEvent('lower', {});
    },

    /**
     * 滚动到顶部/左边时触发
     */
    _toupper: function() {
      console.log('child toupper');
      this.triggerEvent('toupper', {});
    },

    // 滚动时触发
    _scroll: function (e) {
      // console.log(e.detail);
      // console.log('child scroll');
      this.triggerEvent('scroll', e.detail);
    },

    // 滑动事件 开始 (同时开启 enhanced 属性后生效) detail { scrollTop, scrollLeft }
    _dragstart: function (e) {
      // console.log(e.detail);
      // console.log('child scroll');
      this.triggerEvent('dragstart', e.detail);
    },

    // 滑动事件，滑动中 (同时开启 enhanced 属性后生效) detail { scrollTop, scrollLeft }
    _dragging: function (e) {
      // console.log(e.detail);
      // console.log('child scroll');
      this.triggerEvent('dragging', e.detail);
    },

    // 滑动结束事件 (同时开启 enhanced 属性后生效) detail { scrollTop, scrollLeft, velocity }
    _dragend: function (e) {
      // console.log(e.detail);
      // console.log('child scroll');
      this.triggerEvent('dragend', e.detail);
    }
  }
})
