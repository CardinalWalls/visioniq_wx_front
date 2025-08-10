// components/nav-tab/nav-tab.js
const app = getApp();
const appg = app.globalData;
const util = require('../../utils/util.js');
Component({
  // 继承app.wxss样式
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    navbarData: {
      type: Object,
      observer: function (newVal, oldVal) {
        // console.log(newVal, oldVal)
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    appg: {
      navpd: 20,
      navheight: 60
    },
    // 上次点击时建
    lastTapTime: 0
  },

  /**
   * 初始化
   */
  attached() {
    this.setData({
      appg: app.globalData
    });
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 返回上一页
    navback() {
      const pages = getCurrentPages();
      const minuser = wx.getStorageSync('minuser');
      if (pages.length === 1 && util.isMinuser() && minuser.type == 2) {
        wx.reLaunch({
          url: '/pages/doctorIndex/doctorIndex',
        })
      } else if (pages.length === 1 && util.isMinuser() && minuser.type == 3) {
        wx.reLaunch({
          url: '/pages/operatorIndex/operatorIndex',
        })
      } else if (pages.length === 1) {
        wx.reLaunch({
          url: '/pages/userIndex/userIndex',
        })
      } else {
        // var prePage = pages[pages.length - 2];
        // if (prePage.minuserChange && appg.minuser !== "") prePage.minuserChange(appg.minuser);
        wx.navigateBack();
      }
    },

    // 双击标题，回顶部
    doubleClick(e) {
      var curTime = e.timeStamp
      var lastTime = e.currentTarget.dataset.time // 通过e.currentTarget.dataset.time 访问到绑定到该组件的自定义数据
      // console.log("上一次点击时间：" + lastTime)
      // console.log("这一次点击时间：" + curTime)
      // console.log('------------------------------');
      if (curTime - lastTime > 0) {
        if (curTime - lastTime < 300) { //是双击事件
          console.log("挺快的双击，用了：" + (curTime - lastTime));
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 300,
          })
        }
      }

      this.setData({
        lastTapTime: curTime
      });
    },

    // 返回顶部-弃用20201103
    backTop() {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
  },
})
