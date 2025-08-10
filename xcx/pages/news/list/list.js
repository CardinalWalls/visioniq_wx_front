// pages/News/List/List.js
const app = getApp();
const appg = app.globalData;
const util = require('../../../utils/util.js');
const http = require('../../../utils/http.js');
let _this = "";
let typelist = [],
ref = "",
opts  = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "眼科知识"
    },
    // 专题分类
    newsType: [],
    datas: {
      pageSize: 20,
      pageNum: 1,
      typeCode: "",
      isOrdinary: 1,
      searchKey: '',
      typeGroupName: "相关知识",
    },
    searchKey: '',
    tabCur: 0,
    size: 70,
    tabData: [],
    d: {},
    loading: true,
    // 用户行为
    tabFixed: "",

    minuser: "",

    isOnfocus: false
  },

  search() {
    let {datas, searchKey} = _this.data;
    datas.pageNum = 1;
    datas.searchKey = searchKey;
    _this.setData({ datas})
    _this.GetNewsPage(datas)
  },
  inputChange(e) {
    _this.setData({ searchKey: e.detail.value})
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    opts = options;

    _this.setData({
      navheight: appg.navheight,
      getSystemInfo:appg.getSystemInfo,
      isOnfocus: (opts.type && opts.type === 'search') ? true:false
    });
    
    

    _this.minuserChange();
  },

  /**
   * @method 登录接口执行完成后，才执行的数据初始化
   * 
   */
  minuserChange() {
    _this.setData({
      minuser: wx.getStorageSync('minuser')
    });
  
    // 初始化数据
    _this.getData();
  },

  // 初始化数据
  getData() {

    let { datas, tabCur,nvabarData } = _this.data;
    
    // 获取文章分类
    http.newsType({
      isOrdinary: 1,
      groupName: '相关知识'
    }).then(res => {
      typelist = res;
        let v = res;
        let tabData = ["全部"];

        let cur = {};
        for (let i = 0; i < v.length; i++) {
          tabData.push(v[i].name);
          if (opts.typecode === v[i].typeCode) {
            datas.typeCode = v[i].typeCode;
            cur = v[i];
            tabCur = i + 1;
          }
        }
        if (cur.id && res.length == 1) {
          nvabarData.title = cur.name;
          _this.setData({ nvabarData })
        } else {
          nvabarData.title = '相关知识';
          _this.setData({ nvabarData })
        }

        // 最新
        _this.GetNewsPage(datas)
        _this.setData({
          tabData,
          datas,
          tabCur,
          loading: false,
        })
    });

  },

  tabChange(e,) {
    const index = e.detail.index;
    let datas = _this.data.datas;
    datas.pageNum = 1;
    if (index === 0) {
      opts.typecode = "";
      datas.typeCode = "";
    } else {
      datas.typeCode = typelist[index - 1].typeCode;
      opts.typecode = typelist[index - 1].typeCode;
    }

    _this.setData({
      tabCur: index,
      datas
    });
    _this.GetNewsPage(_this.data.datas)
  },


  /**
   * 
   * @param {String} isRecommend 是否推荐（空-全部，0-不推荐，1-推荐） 
   * @param {Number} pageNum 页数 
   * @param {String} tagsCode 标签编码，多个以英文逗号隔开
   * @param {String} typeCode 类型编码
   * @return {Function} obj.cb 回调函数
   */
  GetNewsPage(obj, v) {
    let data = obj;
    data.isOrdinary = 1;
    http.newsPage(obj).then(res => {
      let d = _this.data.d;
        let datas = _this.data.datas;
        if (v) {
          d.list = d.list.concat(res.list);
          datas.pageNum = res.pageNum;
        } else {
          d = res;
        }
        _this.setData({
          d,
          datas: datas,
        });
    })
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

  onPageScroll: function(e) {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let datas = _this.data.datas;
    datas.pageNum = 1;
    _this.setData({
      // tabData: [],
      datas,
      // tabFixed: ''
    });

    // _this.getData();
    _this.GetNewsPage(datas)
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const _this = this;
    let datas = _this.data.datas;
    datas.pageNum = datas.pageNum + 1;
    if (datas.pageNum > _this.data.d.pages) {
      return;
    }
    _this.GetNewsPage(_this.data.datas, "add")
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})