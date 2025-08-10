// pages/doctorIndex/doctorIndex.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');

let _this = "", timer = null, allObj = {}, isClick = true;
Page({                       

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "我的",
      prev: false,
      info: {
        avater: '',
        name: ''
      },
      type: 0
    },

    // swiper
    banner: [],

    // 在线对话
    datas: {
      pageNum: 1,
      pageSize: 30,
      // regionIds: '500101',
      // expertId: '510022215358480384'
    },

    regions: [],
    selectRegions: {},
    regionsShow: false,

    experts: [],
    selectExperts: {},
    expertsShow: false,

  },
  lookAll() {
    if(timer) clearInterval(timer)
    let { datas } = _this.data
    datas.pageNum = 1;
    datas.regionIds = ''
    datas.expertId = ''
    _this.setData({
      datas,
      selectExperts: {},
      selectRegions: {}
    })
  },
  submitRegion() {
    _this.setData({ regionsShow: false })
    let { selectRegions, datas } = _this.data
    let arr = []
    for (let k in selectRegions) {
      arr.push(k)
    }
    if(timer) clearInterval(timer)
    datas.regionIds = arr.join(',')
    datas.pageNum = 1
    _this.setData({ datas })
    _this.getRestInit()
  },
  submitExpert() {
    _this.setData({ expertsShow: false })
    let { selectExperts, datas } = _this.data
    let arr = []
    for (let k in selectExperts) {
      arr.push(k)
    }
    if(timer) clearInterval(timer)
    datas.expertId = arr.join(',')
    datas.pageNum = 1
    _this.setData({ datas })
    _this.getRestInit()
  },
  tapExpert(e) {
    const { index, id } = e.currentTarget.dataset
    let { experts, selectExperts } = _this.data
    if (selectExperts[id]) delete selectExperts[id]
    else selectExperts[id] = experts[index]

    _this.setData({
      selectExperts
    })
  },
  tapRegion(e) {
    const { index, id } = e.currentTarget.dataset
    let { regions, selectRegions } = _this.data
    if (selectRegions[id]) delete selectRegions[id]
    else selectRegions[id] = regions[index]

    _this.setData({
      selectRegions
    })
  },
  openRegion() {
      _this.setData({ regionsShow: true })
  },
  openExpert() {
    _this.setData({ expertsShow: true })
  },

  getRestInit() {
    // 数据初始化
    _this.getData(_this.data.datas);
    // timer = setInterval(function(){
    //   _this.getTJ(function(v) {
    //     if (v.totalUnread > 0) {
    //       let {d, datas} = _this.data;
    //       http.pageForOperator(datas).then(res => {
    //         for (let i  =0; i < res.list.length; i++) {
    //           let cur = res.list[i]
    //           allObj[cur.id] = cur.unread || 0;
    //         }
    //         _this.setData({ 
    //           allObj,
    //           d: res
    //         })
    //       }).catch(res => {
    //         if(timer) clearInterval(timer)
    //       })
    //     }
    //   })
    // }, 3000)
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
  // 跳转聊天窗口
  tapLinkChatWindow(e) {
    const { index, id, unread } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/chatWindow/chatWindow?userArchiveId=${id}`,
      success: function() {
        if (unread && unread === 1) {
          let { d, tj } = _this.data
          d.list[index].unread = 0
          tj.totalUnread =  tj.totalUnread > 0 ?  tj.totalUnread - 1 : 0
          _this.setData({ d, tj })
        }
      }
    })
  },
  // 刷新消息
  refreshMessage() {
    if (!isClick) return
    isClick = false
    let { datas } = _this.data
    datas.pageNum = 1
    _this.setData({ datas })
      // 数据初始化
    _this.getData(_this.data.datas);

    // 专家统计
    _this.getTJ(function() {
      isClick = true
    });
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

    http.regionList({ id: '500100' }).then(res => {
        _this.setData({
            regions: res
        })
    })
    http.expertPage({ pageSize: 500}).then(res => {
        _this.setData({
            experts: res.list
        })
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
    //       http.pageForOperator(datas).then(res => {
    //         for (let i  =0; i < res.list.length; i++) {
    //           let cur = res.list[i]
    //           allObj[cur.id] = cur.unread || 0;
    //         }
    //         _this.setData({ 
    //           allObj,
    //           d: res
    //         })
           
    //       }).catch(res => {
    //         if(timer) clearInterval(timer)
    //       })
    //     }
    //   })
    // }, 3000)
  },
  getTJ(cb) {
    http.operatorStatistics().then(res => {
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
    http.pageForOperator(data).then(res => {
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
    if(util.isMinuser()) {
    //   timer = setInterval(function(){
    //     _this.getTJ(function(v) {
    //       if (v.totalUnread > 0) {
    //         let {d, datas} = _this.data;
    //         http.pageForOperator(datas).then(res => {
    //           for (let i  =0; i < res.list.length; i++) {
    //             let cur = res.list[i]
    //             allObj[cur.id] = cur.unread || 0;
    //           }
    //           _this.setData({ 
    //             allObj,
    //             d: res
    //           })
    //         }).catch(res => {
    //           if(timer) clearInterval(timer)
    //         })
    //       }
    //     })
    //   }, 3000)
    }
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
    if (d.pageNum) {
      datas.pageNum = datas.pageNum + 1;
    }

    if (datas.pageNum > d.pages) {
      return;
    }
    _this.getData(datas, 'add');
  }
})