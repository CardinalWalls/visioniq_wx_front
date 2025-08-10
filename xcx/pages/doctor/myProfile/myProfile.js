// pages/doctor/myProfile/myProfile.js
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');

let _this = null, opts = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "",
      type: 6
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    opts = options;
    _this.setData({
      opts
    })
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

    // 家庭医生
    if (!util.isMinuser()) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    let {minuser, nvabarData} = _this.data;
    nvabarData.title = (minuser.type === 1 ? '家庭医生':'我的资料');
    _this.setData({
      nvabarData
    })
    // 当前专家信息
    let obj = {};
    if(opts.id) {
      obj.id = opts.id
    }
    http.expertInfo(obj).then(res => {
      let arr = [];
      if (res.jobPosition !== '') {
        arr.push(res.jobPosition)
      }
      if (res.title !== '') {
        arr.push(res.title)
      }
      res.str = arr.join('、')
      
      _this.setData({
        expert: res
      })
    })
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
    _this.minuserChange();
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