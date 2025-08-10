// pages/addArchives/addArchives.js
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
      title: "添加干预方式"
    },

    // 性别
    typeArr: [],
    typeCurrentObj: {},

    formobj: {},
  },
  // 保存
  submit() {
    let {
      formobj,
      typeCurrentObj
    } = _this.data;
    if (!typeCurrentObj.dataValue) {
      app.toast({
        title: '请选择干预类型'
      });
      return
    } else if (formobj.scheme === '') {
      app.toast({
        title: '请输入干预措施'
      });
      return
    } 
    formobj.type = typeCurrentObj.dataValue;

    if (isClick) return;
    isClick = true;
    if (opts.id) {
      formobj.id = opts.id;
      // 修改
      http.userInterveneUpdate(formobj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function() {
            isClick = false
            wx.navigateBack()
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
        isClick = false
      })
    } else {
      formobj.userArchiveId = opts.userArchiveId;
      // 新增
      http.userInterveneAdd(formobj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false;
            wx.navigateBack()
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
        isClick = false
      })
    }

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
  // 下拉选择
  pickerChange(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    let {
      formobj,
      typeArr
    } = _this.data;
    if (type == 'type') {
      formobj[type] = typeArr[value].dataValue;
      formobj.scheme = util.textToHtml(typeArr[value].remarks);
      _this.setData({
        typeCurrentObj: typeArr[value],
        formobj
      })
    } else {
      formobj[type] = value;
      _this.setData({
        formobj
      })
    }

  },

  districtTipTap() {
    app.toast({
      title: '请选择'
    })
  },

  /**
   * 地址
   */
  _getAddress: function (e) {
    let {
      regionObj,
      formobj
    } = _this.data;
    const v = e.detail;

    regionObj.provinces = v.selectRegion[0];
    regionObj.city = v.selectRegion[1];
    regionObj.district = v.selectRegion[2];

    formobj.regionId = v.selectRegionId[2];
    _this.setData({
      regionObj,
      formobj
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    opts = options;
    _this = this;
    if (opts.id) {
      let {
        nvabarData
      } = _this.data;
      nvabarData.title = "修改干预方式";
      _this.setData({
        nvabarData,
      })
    }
    _this.setData({
      opts: options
    })

    _this.minuserChange();
  },
  /**
   * @method 登录接口执行完成后，才执行的数据初始化
   * 
   */
  minuserChange() {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
      isLogin: util.isMinuser(),
      storageVision: wx.getStorageSync('storageVision')
    });
    console.log(wx.getStorageSync('storageVision'))

    if (!util.isMinuser()) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    // 干预措施描述
    http.dictionaryList({
      dictCode: 'scheme'
    }).then(list => {
      _this.setData({
        typeArr: list
      })
      let {
        formobj,
        typeArr,
        typeCurrentObj,
        storageVision
      } = _this.data;
      const cur = storageVision[opts.userArchiveId];

      if (opts.id) {
        const item = wx.getStorageSync('intervention');
        formobj.type = item.type;
        formobj.scheme = util.textToHtml(item.scheme);
        formobj.remark = item.remark;
  
        for(let i = 0; i < typeArr.length; i++) {
          if (+typeArr[i].dataValue === formobj.type) {
            typeCurrentObj = typeArr[i];
            break;
          }
        }
  
        _this.setData({
          formobj,
          typeCurrentObj
        })
      } else if(cur) {
        if (cur.l.nearsight_level > cur.r.nearsight_level) {
          formobj.type = cur.l.nearsight_level;
        } else if (cur.l.nearsight_level < cur.r.nearsight_level) {
          formobj.type = cur.r.nearsight_level;
        } else {
          formobj.type = cur.l.nearsight_level;
        }
        for(let i = 0; i < typeArr.length; i++) {
          if (+typeArr[i].dataValue == formobj.type) {
            typeCurrentObj = typeArr[i];
            break;
          }
        }

        _this.setData({
          formobj,
          typeCurrentObj
        })
  
      }

      // 干预措施数据
      let gycs = {};
      for(let i = 0; i < list.length; i++) {
        gycs[list[i].dataValue] = list[i];
        if (+list[i].dataValue == formobj.type && !opts.id) {
          formobj.scheme = util.textToHtml(list[i].remarks);
          _this.setData({  formobj })
        }
        _this.setData({
          gycs
        })
      
      }

    })

   

     
  },

  // 协议
  tapProtocol() {
    _this.setData({
      isProtocol: !_this.data.isProtocol
    })
  },
  openPrivacyContract() {
    wx.openPrivacyContract({
      success: res => {
        console.log('openPrivacyContract success')
      },
      fail: res => {
        console.error('openPrivacyContract fail', res)
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
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})