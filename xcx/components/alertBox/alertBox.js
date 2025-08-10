// components/AlertBox/AlertBox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: false
    },
  },

  observers: {
    "isShow": function (v) {
      console.log(v);
      const _this = this;
      _this.setData({
        isShowMy: v
      });
      // if (v) {
      //   _this.setData({
      //     isShowMy: true
      //   });
      //   setTimeout(function () {
      //     _this.setData({
      //       isclass: 'active'
      //     })
      //   }, 100);
      // } else if (!v) {
      //   _this.setData({
      //     isclass: ""
      //   });
      //   setTimeout(function () {
      //     _this.setData({
      //       isShowMy: false
      //     })
      //   }, 150);
      // }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 弹窗显示隐藏
    isShowMy: false,
    // 显示样式名称
    isclass: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindClose() {
      console.log('=============1');
      this.triggerEvent('close');
    }
  }
})
