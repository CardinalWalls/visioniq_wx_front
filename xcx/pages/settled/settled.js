// pages/addArchives/addArchives.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');
const uploads = require('../../utils/upload.js');
let _this = "",
  opts = {},
  isClick = false // 阻止连续重复点击
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "专家入驻申请"
    },

    // 用户隐私保护提示
    privacyObj: {
      needAuthorization: false
    },
    showPrivacy: false,

    // 性别
    gender: [{
        name: '男',
        value: 1
      },
      {
        name: '女',
        value: 2
      }
    ],

    formobj: {
      name: '',
      gender: '',
      regionId: '',
      hospital: '',
      department: '',
      title: '',
      jobPosition: '',
      avatar: '',
      workCard: ''
    },
    // 选中的城市区
    regionObj: {
      provinces: '',
      city: '',
      district: ''
    },

    // 协议
    isProtocol: false,

    // 图片上传
    photos: {
      avatar: [],
      workCard: []
    },

    dialogShow: false
  },
  // 保存
  submit() {
    let {
      formobj,
      regionObj,
      minuser,
      isProtocol,
      photos
    } = _this.data;

    if (!util.isMinuser()) {
      app.toast({
        title: '请点击微信授权，获取手机号码'
      });
      return
    } else if (formobj.name === '') {
      app.toast({
        title: '请输入真实姓名'
      });
      return
    } else if (formobj.gender === '') {
      app.toast({
        title: '请选择性别'
      });
      return
    } else if (formobj.regionId === '') {
      app.toast({
        title: '请选择所在地区'
      });
      return
    } else if (formobj.hospital === '') {
      app.toast({
        title: '请输入所在医院或机构'
      });
      return
    } else if (formobj.department === '') {
      app.toast({
        title: '请输入所在科室或部门'
      });
      return
    } else if (photos.avatar.length === 0) {
      app.toast({
        title: '请上传形象照片'
      });
      return
    } else if (photos.workCard.length === 0) {
      app.toast({
        title: '请上传工作证件'
      });
      return
    } else if (!isProtocol) {
      app.toast({
        title: '请阅读并同意协议'
      });
      return
    }

    formobj.avatar = JSON.stringify(photos.avatar);
    formobj.workCard = JSON.stringify(photos.workCard);
    // console.log(formobj)
    // return
    if (isClick) return;
    isClick = true;
    if (opts.id) {
      // 修改
      http.userArchiveUpdate(formobj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function() {
            isClick = false
            if(minuser.type == 1) {
              wx.redirectTo({
                url: '/pages/userIndex/userIndex',
              })
            } else {
              wx.redirectTo({
                url: '/pages/doctorIndex/doctorIndex',
              })
            }
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
      // 新增
      http.expertApply(formobj).then(res => {
        isClick = false;
        _this.setData({ dialogShow: true})
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

  // 关闭弹窗
  dialogSubmit() {
    _this.setData({ dialogShow: false})
    wx.redirectTo({
      url: '/pages/userIndex/userIndex',
    })
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
      gender
    } = _this.data;
    if (type == 'gender') {
      formobj[type] = gender[value].value;
      _this.setData({
        formobj
      })
    } else {
      formobj[type] = value;
      _this.setData({
        formobj
      })
    }
    // console.log(formobj)

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

    util.getPrivacyInit(res=> {
      _this.setData({
        showPrivacy: res.needAuthorization,
        privacyObj: res
      })
    });
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

  // 预览图片
  previewImg(e) {
    const {name, index} = e.currentTarget.dataset;
    let {
      photos
    } = _this.data;

    let urls = [];
    photos[name].forEach((item) => {
      urls.push(util.requestImgUrl(item.url))
    })
    wx.previewImage({
      current: util.requestImgUrl(photos[name][index].url),
      urls
    })
  },
  // 删除图片
  deleteImg(e) {
    const {name} = e.currentTarget.dataset;
    let {
      photos
    } = _this.data;
    let index = e.target.dataset.index;
    photos[name].splice(index, 1);
    _this.setData({
      photos
    })
  },
  // 上传图片
  uploadImg(e) {
    const {name} = e.currentTarget.dataset;
    let {
      photos
    } = _this.data;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths;
        uploads.upload({
          filePath: src,
          multiple: true,
          cb: function (d) {
            var item = {
              name: d.fileName,
              url: d.fileUri
            }
            // photos[name].push(item);
            photos[name] = [item];
          
            _this.setData({
              photos
            })
          }
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
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})