// pages/user/newuser/newuser.js
const app = getApp()
const appg = app.globalData;
const util = require('../../../utils/util.js');
const http = require('../../../utils/http.js');
let _this = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: '用户中心',
      prev: false,
      type: 3
    },

    bg: util.getNetworkImg('newuser-bg.png'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    _this.setData({
      navheight: appg.navheight
    });

    _this.minuserChange();
  },
  /**
   * @method 登录接口执行完成后，才执行的数据初始化
   * 
   */
  minuserChange() {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
      isLogin: util.isMinuser()
    });
    
    if (!util.isMinuser()) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    let {minuser} = _this.data;
      minuser.phonePwd = util.phonePwd(minuser.phone)
    _this.setData({ minuser })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})