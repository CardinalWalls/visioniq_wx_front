// components/nav-tab/nav-tab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentTab: {
      type: Number,
      value: 0
    }
  },
  ready() {},

  // 组件所在页面的生命周期
  pageLifetimes: {
    show: function () {}
  },

  /**
   * 组件的初始数据
   */
  data: {
    cart: {},
    list: [{
      "iconPath": "../images/tab-icon1.png",
      "selectedIconPath": "../images/tab-icon1-active.png",
      "pagePath": "/pages/tabBar/home/home",
      "text": "首页"
    },
    {
      "iconPath": "../images/tab-icon2.png",
      "selectedIconPath": "../images/tab-icon2-active.png",
      "pagePath": "/pages/tabBar/user/user",
      "text": "我的"
    }
  ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 按钮跳转方法
    gopage(e) {
      const v = e.currentTarget.dataset;
      if (v.index === this.data.currentTab) {
        // 当前选中栏目不可点击
        wx.pageScrollTo({ scrollTop: 0 })
        return;
      }
      wx.switchTab({
        randTime: new Date().getTime(),
        url: v.url,
      });
    }
  }
})
