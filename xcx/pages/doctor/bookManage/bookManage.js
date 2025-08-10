// pages/doctor/bookManage/bookManage.js
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
      title: "预约管理",
      type: 6
    },

    // 本地生活分类数据
    tabCur: 0,
    tabData: ["最新预约", "历史预约"],

    datas: {
      pageNum: 1,
      pageSize: 20
    },
  },

  tabChange(e) {
    const { index } = e.detail;
    let { tabCur, datas } = _this.data;

    if (tabCur === index) {
      return;
    }
    datas.pageNum = 1;
    _this.setData({
      datas,
      tabCur: index
    });
    _this.getData(_this.data.datas);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    _this.setData({
      navheight: appg.navheight,
      getSystemInfo: appg.getSystemInfo
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
    });

    if (!util.isMinuser()) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    _this.getData(_this.data.datas)
  },
  /**
   * @method getData
   * @param 
   * 
   */
  getData(data, v) {
    const { tabCur } = _this.data;
   
    if (tabCur == 0) {
      const currentDate = util.addOrReduceDate("D", '', 0);
      data.targetTimeStart = currentDate.date
      delete data.targetTimeEnd
    } else if (tabCur == 1) {
      const currentDate = util.addOrReduceDate("D", '', -1);
      data.targetTimeEnd = currentDate.date
      delete data.targetTimeStart
    }
    
    http.bookPage(data).then(res => {
      if (v) {
        let d = _this.data.d;
        d.pageNum = res.pageNum;
        d.list = d.list.concat(res.list);

        let datas = _this.data.datas;
        datas.pageNum = res.pageNum;
        _this.setData({
          d,
          datas
        });
      } else {
        _this.setData({
          d: res
        });
      }
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
    let { datas } = _this.data;
    datas.pageNum = 1;

    _this.setData({
      datas
    });
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let { datas, d } = _this.data;
    if (datas.pageNum >= d.pages) {
      return;
    }
    datas.pageNum = datas.pageNum + 1;
    _this.getData(datas, 'add');
  }
})