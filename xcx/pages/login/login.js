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
      title: '视力问题',
      prev: false,
      type: 6
    },

    datas: {
      pageSize: 20,
      pageNum: 1,
      typeGroupName: "相关知识",
      isOrdinary: 1,
      isRecommend: 1
    },

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

  onShow() {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
      isLogin: util.isMinuser()
    });
    if(util.isMinuser()) {
      _this.navback();
    }
  },
  // 授权登录
  minuserChange () {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
      isLogin: util.isMinuser()
    });
    // console.log(wx.getStorageSync('minuser'))
    if (!util.isMinuser()) {
      util.getPrivacyInit(res=> {
        _this.setData({
          showPrivacy: res.needAuthorization,
          privacyObj: res
        })
      });
      
      // 顶部banner
      http.adList({
        positionCode: 'NOLOGINBANNER'
      }).then(res => {
        _this.setData({
          banner: res
        });
      });

      // 初始化数据
      _this.getData(_this.data.datas);
    } else {
      _this.navback();
    }
  },

  // 授权登录
  minuserChange2 () {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
      isLogin: util.isMinuser()
    });
    // console.log(wx.getStorageSync('minuser'))
    if (!util.isMinuser()) {
      util.getPrivacyInit(res=> {
        _this.setData({
          showPrivacy: res.needAuthorization,
          privacyObj: res
        })
      });
      
      // 顶部banner
      http.adList({
        positionCode: 'NOLOGINBANNER'
      }).then(res => {
        _this.setData({
          banner: res
        });
      });

      // 初始化数据
      _this.getData(_this.data.datas);
    } else {
      _this.setData({
        isResult: true
      })
      _this.navback();
    }
  },
  // 初始化数据
  getData(data, v) {
    http.newsPage(data).then(res => {
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
        } else if(_this.data.isResult === true) {
          wx.reLaunch({
            url: '/pages/addArchives/addArchives',
          })
        } else {
          wx.reLaunch({
            url: '/pages/user/newuser/newuser',
          })
        }
      })
      
    }
  },

  /**
   * 页面滚动的处理函数
   */
  onPageScroll: function (e) {
    // let {nvabarData} = _this.data;

    // // 导航样式切换
    // if (e.scrollTop >= 10 && nvabarData.type === 0) {
    //   nvabarData.type = 1;
    //   _this.setData({
    //     nvabarData
    //   });
    // } else if (e.scrollTop < 10 && nvabarData.type === 1) {
    //   nvabarData.type = 0;
    //   _this.setData({
    //     nvabarData
    //   });
    // }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let {datas} = _this.data;
    datas.pageNum = 1;
    _this.setData({
      datas
    })
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { datas, d } = _this.data;
    if (datas.pageNum >= d.pages) {
      return;
    }
    datas.pageNum = datas.pageNum + 1;
    _this.getData(datas, 'add');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})