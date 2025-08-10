// pages/PersonalCenter/PromoteRule/PromoteRule.js 
let _this = "";
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');
var WxParse = require('../../../components/wxParse/wxParse.js');

let opts = {};
Page({

  /** 
   * 页面的初始数据 
   */
  data: {
    nvabarData: {
      title: ''
    },
    d: ""
  },


  /** 
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    _this = this;
    opts = options;

    _this.getData();
  },

  /**
   * 数据初始化
   */
  getData() {
    WxParse.wxParse('article', 'html', '', _this, 5);
    http.dictionarySingle({
      dataKey: opts.type,
      dictCode: "ruleProtocol"
    }).then(v => {
      if (!v.dataValue) {
        return;
      }
      http.newsAdd(v.dataValue).then(res => {
        let nvabarData = _this.data.nvabarData;
        nvabarData.title = res.title;

        _this.setData({
          nvabarData,
          d: res
        });

        WxParse.wxParse('article', 'html', res.content, _this, 5);
      })
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    _this.getData();
    wx.stopPullDownRefresh();
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

  },

  /** 
   * 生命周期函数--监听页面隐藏 
   */
  onHide: function () {

  },

  /** 
   * 生命周期函数--监听页面卸载 
   */
  onUnload: function () {

  }
})