// pages/user/manageCheck/manageCheck.js
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');

let _this = "",
  opts = {},
  isClick = false // 阻止连续重复点击
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "视力档案",
      type: 0
    },

    datas: {
      pageNum: 1,
      pageSize: 10
    },
    // 视力折线图
    vision: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    opts = options;
    _this = this;
    let {datas} = _this.data;
    datas.userArchiveId = opts.userArchiveId
    _this.setData({
      datas,
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

    // 档案详情
    http.userArchiveDetail(opts.userArchiveId).then(res => {
      _this.setData({
        archive: res
      })
    }).catch(res => {
      app.toast({
        title: res.body.message
      })
    })

    _this.getData(_this.data.datas)
  },

  /**
   * @method getData
   * @param 
   * 
   */
  getData(data, v) {
    http.userInspectReportPage(data).then(res => {
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
          vision: res.list,
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
    if (_this.data.isRefresh === true) {
      let { datas } = _this.data;
      datas.pageNum = 1;
      _this.setData({
        datas
      });
      _this.getData(_this.data.datas)
    }
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
   * 页面滚动的处理函数
   */
  onPageScroll: function (e) {
    let {nvabarData} = _this.data;

    // 导航样式切换
    if (e.scrollTop >= 10 && nvabarData.type === 0) {
      nvabarData.type = 1;
      _this.setData({
        nvabarData
      });
    } else if (e.scrollTop < 10 && nvabarData.type === 1) {
      nvabarData.type = 0;
      _this.setData({
        nvabarData
      });
    }
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