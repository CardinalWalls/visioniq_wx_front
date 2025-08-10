// pages/home/home.js
const app = getApp();
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');

let _this = "";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: '微信登录',
      prev: false,
    },
    path: "",
    logo: util.getNetworkImg('login-img.png'),
    loginbg: util.getNetworkImg('loginbg.png'),
    // 协议复选款
    checked: false,

    // 用户隐私保护提示
    privacyObj: {
      needAuthorization: false
    },
    showPrivacy: false
  },
  // 用户隐私保护提示
  privacyAuth(e) {
    _this.setData({ 
      showPrivacy: true,
    })
  },
  agree(e) {
    _this.setData({ 
      showPrivacy: false,
      checked: true
    })
    util.getPrivacyInit(res=> {
      _this.setData({
        privacyObj: res
      })
    });
  },
  disagree(e) {
    _this.setData({ 
      showPrivacy: false,
      checked: false
    })
  },

  logintap() {
    app.toast({
      title: '同意协议后才能登录注册'
    })
  },

  checkboxTap() {
    _this.setData({
      checked: !_this.data.checked
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    _this.setData({
      navheight: app.globalData.navheight
    });
    
    _this.minuserChange();
  },

  // 授权登录
  minuserChange () {
    _this.setData({
      isLogin: util.isMinuser()
    });
    if (!util.isMinuser()) {
      util.getPrivacyInit(res=> {
        _this.setData({
          privacyObj: res,
          showPrivacy: res.needAuthorization,
          checked: res.needAuthorization
        })
      });
    } else {
      _this.navback();
    }
    
  },

  // 返回上一页
  navback() {
    const minuser = wx.getStorageSync('minuser');
    if (util.isMinuser() && minuser.type == 2) {
      wx.reLaunch({
        url: '/pages/doctorIndex/doctorIndex',
      })
    } else if (util.isMinuser() && minuser.type == 3) {
      wx.reLaunch({
        url: '/pages/operatorIndex/operatorIndex',
      })
    } else if (util.isMinuser() && minuser.type == 1) {
      http.userArchivePage({ pageSize: 1}).then(res => {
        if (res.total > 0) {
          wx.reLaunch({
            url: '/pages/userIndex/userIndex',
          })
        } else {
          wx.reLaunch({
            url: '/pages/user/newuser/newuser',
          })
        }
      })
      
    }
  },

})