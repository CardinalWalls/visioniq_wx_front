// components/SwiperPages/SwiperPages.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    banners: {
      type: Array,
      value: [],
    },
    height: {
      type: Number,
      value: 300,
    },
    classname: {
      type: String,
      value: ""
    },
    isShowDots: {
      type: Boolean,
      value: true,
    },
    imgKey: {
      type: String,
      value: "img"
    },
    mode: {
      type: String,
      value: 'aspectFill'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pagesIndex: 0,
    autoplay: true
  },
  ready() {
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      // console.log('swiper child show');
      if (!this.data.autoplay) {
        this.setData({
          autoplay: true
        });
      }
     },
    hide: function () {
      // console.log('swiper child hide');
      this.setData({
        autoplay: false
      });
     },
    resize: function () { },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    CurrentChange: function (e) {
      const { current, source } = e.detail;
      if (source === "autoplay" || source === "touch") {
        this.setData({
          pagesIndex: current
        })
      }
    },
  }
})
