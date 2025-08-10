// pages/PersonalCenter/PromoteRule/PromoteRule.js 
let _this = "";
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');
const config = require('../../../utils/config');

let opts = {};
Page({

  /** 
   * 页面的初始数据 
   */
  data: {
    nvabarData: {
      title: '风险评估'
    },
    d: ""
  },


  /** 
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    _this = this;
    opts = options;
    _this.setData({
      opts
    })
    _this.minuserChange();
  },

  minuserChange() {
    _this.setData({
      storageVision: wx.getStorageSync('storageVision'),
      storageHistory: wx.getStorageSync('storageHistory')
    })
    if (!util.isMinuser()) return;

    // 风险描述
    // http.dictionarySingle({
    //   dataKey: 'risk',
    //   dictCode: "ruleProtocol"
    // }).then(v => {
    //   if (!v.dataValue) {
    //     return;
    //   }
    //   http.newsAdd(v.dataValue).then(res => {
    //     _this.setData({
    //       detail: res
    //     });
    //   })
    // });
   
    let {
      storageVision,storageHistory
    } = _this.data;
    if (storageVision && storageVision[opts.userArchiveId]) {
      let objVision = storageVision[opts.userArchiveId], obj = storageHistory[opts.userArchiveId];
    //   console.log(obj, objVision)
      // 页面新值转换
      let visionNew = {};

      // 眼轴发展指数
      const lTime = obj.l.history_AL_records_interpret.map((item, index) => { return item.time });
      const rTime = obj.r.history_AL_records_interpret.map((item, index) => { return item.time });
      const result = Array.from(new Set([...lTime, ...rTime]));
      result.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
      });

      visionNew.alRecordsTime = result;
      let lRecordsTime = {}, rRecordsTime = {};
      obj.l.history_AL_records_interpret.map((item, index) => {  lRecordsTime[item.time] = item });
      obj.r.history_AL_records_interpret.map((item, index) => {  rRecordsTime[item.time] = item });
     
      visionNew.alRecordsL = lRecordsTime;
      visionNew.alRecordsR = rRecordsTime;

      // 远视储备预测指数
      const lTime2 = obj.l.history_farsight_records_interpret.map((item, index) => { return item.time });
      const rTime2 = obj.r.history_farsight_records_interpret.map((item, index) => { return item.time });
      const result2 = Array.from(new Set([...lTime2, ...rTime2]));
      result2.sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA;
      });
      visionNew.farsightRecordsTime = result2;

      let lRecordsTime2 = {}, rRecordsTime2 = {};
      obj.l.history_farsight_records_interpret.map((item, index) => {  lRecordsTime2[item.time] = item });
      obj.r.history_farsight_records_interpret.map((item, index) => {  rRecordsTime2[item.time] = item });
     
      visionNew.farsightRecordsL = lRecordsTime2;
      visionNew.farsightRecordsR = rRecordsTime2;

      console.log(visionNew,'==========2')
      console.log(objVision, '========')
      _this.setData({
        visionNew,
        vision: [objVision]
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    _this.minuserChange();
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