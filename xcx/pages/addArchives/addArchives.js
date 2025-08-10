// pages/addArchives/addArchives.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');

let _this = "",
  opts = {},
  isClick = false // 阻止连续重复点击
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "新建档案"
    },

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
    // 双亲是否高度近视, 双亲是否近视; 0=无, 1=父, 2=母, 3=父母	
    parentsMyopia: [{
        name: '无',
        value: 0
      },
      {
        name: '父亲',
        value: 1
      },
      {
        name: '母亲',
        value: 2
      },
      {
        name: '父母',
        value: 3
      }
    ],

    formobj: {
      name: '',
      gender: '',
      birth: '',
      parentsMyopia: '',
      regionId: '',
      idcard: ''
    },
    // 选中的城市区
    regionObj: {
      provinces: '',
      city: '',
      district: ''
    },

    // 协议
    isProtocol: false
  },
  // 保存
  submit() {
    let {
      formobj,
      regionObj,
      minuser,
      isProtocol
    } = _this.data;
    // console.log(formobj,'======')
    if ((!formobj.phone || formobj.phone == '') && minuser.type == 2 && !opts.id) {
      // 只有专家用户新增的时候需要手机号
      app.toast({
        title: '请输入归属账号的手机号码'
      });
      return
    } else if (formobj.name === '') {
      app.toast({
        title: '请输入姓名'
      });
      return
    } 
    // else if (formobj.gender === '') {
    //   app.toast({
    //     title: '请选择性别'
    //   });
    //   return
    // } else if (formobj.birth === '') {
    //   app.toast({
    //     title: '请选择出生日期'
    //   });
    //   return
    // } else if (formobj.parentsMyopia === '') {
    //   app.toast({
    //     title: '请选择双亲是否高度近视'
    //   });
    //   return
    // } else if (formobj.regionId === '') {
    //   app.toast({
    //     title: '请选择所在地区'
    //   });
    //   return
    // } 
    else if (formobj.idcard === '') {
      app.toast({
        title: '请输入身份证号码'
      });
      return
    } else if (!util.validateIdcard(formobj.idcard)) {
      app.toast({
        title: '请输入合法的身份证号码'
      });
      return
    }  else if (!isProtocol) {
      app.toast({
        title: '请阅读并同意协议'
      });
      return
    }
    
    if (isClick) return;
    isClick = true;
    const dt = util.getBirthDateAndGender(formobj.idcard)
    let newFormObj = JSON.parse(JSON.stringify(formobj))
    if (formobj.gender === '') {
      newFormObj.gender = dt.gender
    }
    if (formobj.birth === '') {
      newFormObj.birth = dt.birthDate
    }
    if (formobj.parentsMyopia === '') {
      newFormObj.parentsMyopia = 0
    }
    if (formobj.regionId === '') {
      // 默认重庆市江北区
      newFormObj.regionId = '500105'
    }

    if (opts.id) {
      // 修改
      http.userArchiveUpdate(newFormObj).then(res => {
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
      http.userArchiveAdd(newFormObj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false;
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
      gender,
      parentsMyopia
    } = _this.data;
    if (type == 'gender') {
      formobj[type] = gender[value].value;
      _this.setData({
        formobj
      })
    } else if (type == 'parentsMyopia') {
      formobj[type] = parentsMyopia[value].value;
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
    if (opts.id) {
      let {
        nvabarData
      } = _this.data;
      nvabarData.title = "修改档案";
      _this.setData({
        nvabarData,
        opts: options
      })
    }

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
    // console.log(_this.data.minuser)

    if (!util.isMinuser()) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    if (opts.id) {
      // 档案详情
      http.userArchiveDetail(opts.id).then(res => {
        let {
          formobj,
          regionObj
        } = _this.data;
        formobj.name = res.name;
        formobj.gender = res.gender;
        formobj.birth = res.birth;
        formobj.parentsMyopia = res.parentsMyopia;
        formobj.regionId = res.regionId;
        formobj.idcard = res.idcard;
        formobj.id = opts.id;

        formobj.schoolName = res.schoolName;
        formobj.orgName = res.orgName;
        formobj.remark = res.remark;

        const regionNameArr = res.regionName.split('-');
        regionObj.provinces = regionNameArr[0] || '';
        regionObj.city = regionNameArr[1] || '';
        regionObj.district = regionNameArr[2] || '';

        _this.setData({
          formobj,
          regionObj
        })
      }).catch(res => {
        app.toast({
          title: res.body.message || 'detail error'
        })
      })
    }
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