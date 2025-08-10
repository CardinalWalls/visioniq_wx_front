// pages/doctor/archivesManage/archivesManage.js
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
      title: "档案管理",
      type: 6
    },

    datas: {
      pageNum: 1,
      pageSize: 20,
      sortField: 'updateTime DESC',
      searchKey: ''
    },

    formobj: {
      searchKey: ''
    },

    // 档案备注信息弹窗
    isShow: false,
    currentIndex: -1,
    form: {
      remark: ''
    },
  },

  dialogSubmit() {
   _this.infoDialogClose();
   let {form} = _this.data;
   if (form.remark == '') {
      app.toast({
        title: '请输入备注说明'
      });
      return
    } 
    http.userArchiveUpdate(form).then(res => {
      let {datas} = _this.data;
      datas.pageNum = 1;
      _this.setData({ datas })
      _this.getData(datas)

      app.toast({
        icon: 'success',
        title: '保存成功',
        cb: function() {
          
        }
      })
    }).catch(res => {
      wx.showModal({
        title: '',
        content: res.body.message,
        showCancel: false,
        cancelText: '取消',
        confirmText: '确定',
        confirmColor: '#01c176',
        success: function (res) {}
      });
    })
  },
  infoDialogOpen(e) {
    const {index, type } = e.currentTarget.dataset;
    let { form, d, currentIndex} = _this.data;
    currentIndex = index;
    const cur = d.list[index];

    if (type === 'link') {
      wx.navigateTo({
        url: '/pages/doctor/archivesDetail/archivesDetail?userArchiveId=' + cur.id,
      })
    } else {
      form.id = cur.id;
      form.remark = cur.remark;

      form.name = cur.name;
      form.gender = cur.gender;
      form.birth = cur.birth;
      form.parentsMyopia = cur.parentsMyopia;
      form.regionId = cur.regionId;
      form.idcard = cur.idcard;

      _this.setData({
        currentIndex,
        form,
        isShow: true
      })
    }
    
  },
  // 弹窗-文本框改变值
  changeInput(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    let {
      form
    } = _this.data;
    form[type] = value;
    _this.setData({
      form
    })
  },
  infoDialogClose() {
    _this.setData({
      isShow: false
    })
  },

  // 搜索
  tapSearch() {
    let {datas, formobj} = _this.data;
    datas.pageNum = 1;
    datas.searchKey = formobj.searchKey;
    _this.setData({ datas })

    _this.getData(datas)
  },
  // 文本框改变值
  inputChange(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    let {
      formobj
    } = _this.data;
    formobj[type] = value;
    _this.setData({
      formobj
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    opts = options;
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
    
    http.archiveStatistics().then(res => {
      _this.setData({
        statistics: res
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
    http.userArchivePage(data).then(res => {
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