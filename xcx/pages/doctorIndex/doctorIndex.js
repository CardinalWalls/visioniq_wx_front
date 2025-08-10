// pages/doctorIndex/doctorIndex.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');

let _this = "", timer = null, allObj = {};
Page({                       

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "",
      prev: false,
      info: {
        avater: '',
        name: ''
      },
      type: 0
    },

    shareObj: {
      path: 'pages/login/login'
    },

    // swiper
    banner: [],

    // 在线对话
    datas: {
      pageNum: 1,
      pageSize: 30
    },
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

    // 当前专家信息
    http.expertInfo().then(res => {
      _this.setData({
        expert: res
      })
      // 用于分享携带专家参数
      wx.setStorageSync('shareExpertId', res.id)
      // console.log('shareExpertId='+wx.getStorageSync('shareExpertId'))
    })

    if(timer) clearInterval(timer)
    // 顶部banner
    http.adList({
      positionCode: 'DOCTORBANNER'
    }).then(res => {
      _this.setData({
        banner: res
      });
    });

    // 用户信息
    http.userInfo().then(res => {
      let {nvabarData} = _this.data;
      nvabarData.info = {
        avatar: res.avatar,
        name: res.realName || res.wxName
      }
      _this.setData({
        nvabarData,
        user: res
      })
    });

    // 数据初始化
    _this.getData(_this.data.datas);

    // 专家统计
    _this.getTJ();
    // timer = setInterval(function(){
    //   _this.getTJ(function(v) {
    //     if (v.totalUnread > 0) {
    //       let {d, datas} = _this.data;
    //       http.userArchivePage({
    //         pageSize: d.total < 30 ? 30: d.list.length
    //       }).then(res => {
    //         for (let i  =0; i < res.list.length; i++) {
    //           let cur = res.list[i]
    //           allObj[cur.id] = cur.unread || 0;
    //         }
    //         _this.setData({ allObj})
    //         console.log(allObj,'===========')
    //         if (JSON.stringify(res.list) !== JSON.stringify(d.list)) {
    //           if (Math.ceil(res.list/datas.pageSize) != datas.pageNum) {
    //             datas.pageNum = Math.ceil(res.list/datas.pageSize);
    //             _this.setData({datas})
    //           }
    //           d.list = res.list;
    //           d.total = res.total;
    //           d.pages = Math.ceil(res.total/datas.pageSize);
    //           _this.setData({
    //             d
    //           });
    //         }
    //       }).catch(res => {
    //         if(timer) clearInterval(timer)
    //       })
    //     }
    //   })
    // }, 2000)
  },
  getTJ(cb) {
    http.expertStatistics().then(res => {
      _this.setData({
        tj: res
      })
      if (cb) cb(res)
    })
  },
  /**
   * @method getData
   * @param 
   * 
   */
  getData(data, v) {
    if(timer) clearInterval(timer)

    http.userArchivePage(data).then(res => {
      for (let i  =0; i < res.list.length; i++) {
        let cur = res.list[i]
        allObj[cur.id] = cur.unread || 0;
      }
      if (v) {
        let d = _this.data.d;
        d.pageNum = res.pageNum;
        d.list = d.list.concat(res.list);

        let datas = _this.data.datas;
        datas.pageNum = res.pageNum;
        _this.setData({
          d,
          datas,
          allObj
        });
      } else {
        _this.setData({
          d: res,
          allObj
        });
      }
    }).catch(res => {
      if(timer) clearInterval(timer)
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
    console.log('onShow')
    if(timer) clearInterval(timer)
    if(!util.isMinuser()) return
    _this.getTJ(function(v) {
      if (v.totalUnread > 0) {
        let {d, datas} = _this.data;
        http.userArchivePage({
          pageSize: d.total < 30 ? 30: d.list.length
        }).then(res => {
          for (let i  =0; i < res.list.length; i++) {
            let cur = res.list[i]
            allObj[cur.id] = cur.unread || 0;
          }
          _this.setData({ allObj})
          if (JSON.stringify(res.list) !== JSON.stringify(d.list)) {
            if (Math.ceil(res.list/datas.pageSize) != datas.pageNum) {
              datas.pageNum = Math.ceil(res.list/datas.pageSize);
              _this.setData({datas})
            }
            d.list = res.list;
            d.total = res.total;
            d.pages = Math.ceil(res.total/datas.pageSize);
            _this.setData({
              d
            });
          }
        }).catch(res => {

        })
      } else if (_this.data.allObj !== {}) {
        _this.setData({
          allObj: {}
        })
      }
    })

    timer = setInterval(function(){
      _this.getTJ(function(v) {
        if (v.totalUnread > 0) {
          let {d, datas} = _this.data;
          http.userArchivePage({
            pageSize: d.total < 30 ? 30: d.list.length
          }).then(res => {
            for (let i  =0; i < res.list.length; i++) {
              let cur = res.list[i]
              allObj[cur.id] = cur.unread || 0;
            }
            _this.setData({ allObj})
            if (JSON.stringify(res.list) !== JSON.stringify(d.list)) {
              if (Math.ceil(res.list/datas.pageSize) != datas.pageNum) {
                datas.pageNum = Math.ceil(res.list/datas.pageSize);
                _this.setData({datas})
              }
              d.list = res.list;
              d.total = res.total;
              d.pages = Math.ceil(res.total/datas.pageSize);
              _this.setData({
                d
              });
            }
          }).catch(res => {
            if(timer) clearInterval(timer)
          })
        } else if (_this.data.allObj !== {}) {
          _this.setData({
            allObj: {}
          })
        }
      })
    }, 2000)
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('onHide')
    if(timer) clearInterval(timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('onUnload')
    if(timer) clearInterval(timer)
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
  onPullDownRefresh: function () {
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
  onReachBottom: function () {
    let { datas, d } = _this.data;
    datas.pageNum = datas.pageNum + 1;
    if (datas.pageNum >= d.pages) {
      return;
    }
    

    _this.getData(datas, 'add');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})