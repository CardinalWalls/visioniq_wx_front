// pages/addCheck/addCheck.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const config = require('../../utils/config.js');
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
      title: "其他检查数据",
      type: 0
    },

    // 页面弹窗
    dialogShow: true,
    
    // 表单对象
    formobj: {
      userArchiveId: '',
      nra: '',
      pra: '',
      bcc: '',
      afOd: '',
      afOs: '',
      afOu: '',
      ampOd: '',
      ampOs: ''
    },
    // 调节灵活度正负号
    flipperSymbol: {
      afOd: '',
      afOs: '',
      afOu: '',
    },

    // 图片上传
    photos: {
      eyegroundImg: [],
      octImg: [],
      visualFieldImg: []
    },

  },
  // 保存
  submit() {
    let {
      formobj,
      photos,
      report,
      minuser,
      flipperSymbol
    } = _this.data;
    // if (formobj.nra == '') {
    //   app.toast({
    //     title: '请输入负相对调节'
    //   });
    //   return
    // } else if (formobj.pra == '') {
    //   app.toast({
    //     title: '请输入正相对调节'
    //   });
    //   return
    // } else if (formobj.bcc == '') {
    //   app.toast({
    //     title: '请输入调节反应'
    //   });
    //   return
    // } else if (formobj.afOd == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OD'
    //   });
    //   return
    // } else if (formobj.afOs == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OS'
    //   });
    //   return
    // } else if (formobj.afOu == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OU'
    //   });
    //   return
    // } else if (flipperSymbol.afOd == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OD +-'
    //   });
    //   return
    // } else if (flipperSymbol.afOd !== '' && flipperSymbol.afOd !== '-' && flipperSymbol.afOd !== '+') {
    //   app.toast({
    //     title: '调节灵活度OD符号只能是+-'
    //   });
    //   return
    // } else if (flipperSymbol.afOs == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OS +-'
    //   });
    //   return
    // } else if (flipperSymbol.afOs !== '' && flipperSymbol.afOs !== '-' && flipperSymbol.afOs !== '+') {
    //   app.toast({
    //     title: '调节灵活度OS符号只能是+-'
    //   });
    //   return
    // } else if (flipperSymbol.afOu == '') {
    //   app.toast({
    //     title: '请输入调节灵活度OU +-'
    //   });
    //   return
    // } else if (flipperSymbol.afOu !== '' && flipperSymbol.afOu !== '-' && flipperSymbol.afOu !== '+') {
    //   app.toast({
    //     title: '调节灵活度OU符号只能是+-'
    //   });
    //   return
    // } else if (formobj.ampOd == '') {
    //   app.toast({
    //     title: '请输入调节幅度OD'
    //   });
    //   return
    // } else if (formobj.ampOs == '') {
    //   app.toast({
    //     title: '请输入调节幅度OS'
    //   });
    //   return
    // }

    if (isClick) return;
    isClick = true;

    formobj.userArchiveId = opts.userArchiveId;
    for(let k in flipperSymbol) {
      formobj[k] = flipperSymbol[k] + formobj[k];
    }

    // 图片上传
    for(let k in photos) {
      formobj[k] = JSON.stringify(photos[k]);
    }

    // console.log(formobj);
    // return
    if (opts.id || (report && report.total > 0)) {
      // 修改
      http.userVisualFunctionReportUpdate(formobj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false;
            
            if (minuser.type === 2) {
              wx.navigateBack()
            } else {
              wx.redirectTo({
                url: '/pages/userIndex/userIndex',
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
      formobj.inspectDate =  util.dateClipping(util.getCurrentDate(), 0, 10);
      http.userVisualFunctionReportAdd(formobj).then(res => {
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false
            if (minuser.type === 2) {
              wx.navigateBack()
            } else {
              wx.redirectTo({
                url: '/pages/userIndex/userIndex',
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

  // 弹窗关闭
  dialogSubmit() {
    _this.setData({
      dialogShow: false
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
      count: 9, // 默认9
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
            photos[name].push(item);
          
            _this.setData({
              photos
            })
          }
        });
      }
    })
  },

  // 文本框改变值
  inputChange(e) {
    const {
      type, name
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    let {
      formobj,
      flipperSymbol
    } = _this.data;
    if (name == 'flipperSymbol') {
      flipperSymbol[type] = value;
      _this.setData({
        flipperSymbol
      })
    } else {
      formobj[type] = value;
    }
    _this.setData({
      formobj
    })
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    opts = options;
    _this = this;
    if (opts.id) {
      let { nvabarData } = _this.data;
      nvabarData.title = "修改视功能检查单"
      _this.setData({ nvabarData })
    }
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

    // 列表详情
    let {formobj, flipperSymbol, photos} = _this.data;
    http.userVisualFunctionReportList({
      userArchiveId: opts.userArchiveId,
      pageNum: 1,
      pageSize: 1
    }).then(res => {
      _this.setData({
        d: res
      })
      if (res.total === 0) return;

      const cur = res.list[0];
      http.userVisualFunctionReportDetail(cur.id).then(res => {
        // 表单对象
        formobj.id = res.id;
        formobj.userArchiveId = res.userArchiveId;
        formobj.nra = res.nra;
        formobj.pra = res.pra;
        formobj.bcc = res.bcc;
        
        for(let k in flipperSymbol) {
          formobj[k] = res[k] !== '' && !isNaN(res[k]) ? Math.abs(res[k]):'';
          if (res[k] !== '' && res[k] < 0) {
            flipperSymbol[k] = '-';
          } else if(res[k] !== '') {
            flipperSymbol[k] = '+';
          }
        }

        formobj.ampOd = res.ampOd;
        formobj.ampOs = res.ampOs;

        formobj.pressure = res.pressure;
        formobj.choroidalThickness = res.choroidalThickness;
        formobj.sideCenterDefocus = res.sideCenterDefocus;
        formobj.electrophysiology = res.electrophysiology;

        // 图片列表
        for(let k in photos) {
          photos[k] = JSON.parse(res[k]);
        }

        _this.setData({
          formobj,
          photos,
          flipperSymbol,
          report: res
        })

        _this.getVisualResult();
      }).catch(res => {
        app.toast({
          title: res.body.message
        })
      })
    })
  },

  // 视功能检查原始数据
  getVisualResult () {
    let {archive, formobj,flipperSymbol} = _this.data;
    let data = {
        age: util.calculateAge(archive.birth),
        AMP: {},
        af: {
          os: {},
          od: {},
          ou: {},
        }
      }
      if (formobj.bcc !== '')  data.BCC = formobj.bcc
      if (formobj.nar !== '')  data.NRA = formobj.nar
      if (formobj.pra !== '')  data.PRA = formobj.pra
      if (formobj.ampOs !== '')  data.AMP.os = formobj.ampOs
      if (formobj.ampOd !== '')  data.AMP.od = formobj.ampOd
      if (formobj.afOs !== '' && flipperSymbol.afOs !== '') {
        data.af.os = {
            frequency: formobj.afOs,
            orientation: flipperSymbol.afOs
        }
      }
      if (formobj.afOd !== '' && flipperSymbol.afOd !== '') {
        data.af.od = {
            frequency: formobj.afOd,
            orientation: flipperSymbol.afOd
        }
      }
      if (formobj.afOu !== '' && flipperSymbol.afOu !== '') {
        data.af.ou = {
            frequency: formobj.afOu,
            orientation: flipperSymbol.afOu
        }
      }
      
    wx.request({
      url: config.VISIONBASEURL +'/function',
      method: 'POST',
      data,
      success: function(res) {
        // console.log(res,'============')
        if (res.statusCode === 200) {
          // console.log(res.data)
          _this.setData({
            result: res.data
          })
        } else {
          app.toast({
            title: (res.statusCode === 500 || res.statusCode === 502) ? '反馈结果请求失败': 'error'
          })
        }
      }, fail: function(err) {
        // console.log(res,'error============')
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
   * 页面滚动的处理函数
   */
  onPageScroll: function (e) {
    let {
      nvabarData
    } = _this.data;

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
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})