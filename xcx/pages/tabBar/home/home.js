
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');
var WxParse = require('../../../components/wxParse/wxParse.js');

let _this = "", timer = null, chatObj = {};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "首页",
      prev: false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    _this.setData({
      navheight: appg.navheight
    });
  },

  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面滚动的处理函数
   */
  onPageScroll: function (e) {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})