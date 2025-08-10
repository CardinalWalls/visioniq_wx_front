// pages/addCheck/addCheck.js
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
      title: "录入检查单",
      type: 0
    },

    // 表单对象
    formobj: {
      userArchiveId: '',
      inspectDate: '',
      hospital: '',
      height: '',

      leftDiopterS: '',
      leftDiopterC: '',
      leftAxis: '',
      leftCurvatureRadius: '',

      rightDiopterS: '',
      rightDiopterC: '',
      rightAxis: '',
      rightCurvatureRadius: '',

      fileArray: '',
      dilatedRefraction: false, // 散瞳验光 true: 是， false 否 

      outSchoolHours: '',
      incorrectSittin: '',
      incorrectGlasses: '',
      allergy: '',

      outdoorsHours: '',
      glassesType: '',
      otherSolution: '',

      otherDescription: '',

      leftK1:'',
      leftK2:'',
      rightK1:'',
      rightK2:''
    },

    // 视力检查数据单据上传
    otherFileArray: [],
    // 电脑验光数据单据上传
    photos: [],
    
    // checkbox
    ckObj: {
      outSchoolHours: [{
          name: '0-1小时',
          value: '0-1小时'
        },
        {
          name: '1-3小时',
          value: '1-3小时'
        },
        {
          name: '3-6小时',
          value: '3-6小时'
        },
        {
          name: '6小时以上',
          value: '6小时以上'
        },
      ],
      incorrectSittin: [{
          name: '低头读写',
          value: '低头读写'
        },
        {
          name: '歪头读写',
          value: '歪头读写'
        },
        {
          name: '握笔过低',
          value: '握笔过低'
        },
        {
          name: '无',
          value: '无'
        },
      ],
      incorrectGlasses: [{
          name: '眼镜松动',
          value: '眼镜松动'
        },
        {
          name: '戴眼镜不足8小时',
          value: '戴眼镜不足8小时'
        },
        {
          name: '无',
          value: '无'
        },
      ],
      allergy: [{
          name: '眼睛过敏',
          value: '眼睛过敏'
        },
        {
          name: '鼻子过敏',
          value: '鼻子过敏'
        },
        {
          name: '无',
          value: '无'
        },
      ],
      outdoorsHours: [{
          name: '0-1小时',
          value: '0-1小时'
        },
        {
          name: '1-3小时',
          value: '1-3小时'
        },
        {
          name: '3-6小时',
          value: '3-6小时'
        },
        {
          name: '6小时以上',
          value: '6小时以上'
        },
      ],
      glassesType: [{
          name: '未佩载',
          value: '未佩载',
          class: 'half mg'
        },
        {
          name: '普通框架',
          value: '普通框架',
          class: 'half'
        },
        {
          name: 'Ortho-K(OK镜，角膜塑形镜)',
          value: 'Ortho-K(OK镜，角膜塑形镜)',
          class: 'large'
        },
        {
          name: '双光软镜',
          value: '双光软镜',
          class: 'large'
        },
        {
          name: '周边离焦框架眼镜',
          value: '周边离焦框架眼镜',
          class: 'large'
        },
        {
          name: '单光镜',
          value: '单光镜',
          class: 'large'
        },
        {
          name: '渐进片',
          value: '渐进片',
          class: 'large'
        },
        {
          name: '变色',
          value: '变色',
          class: 'large'
        },
        {
          name: '染色',
          value: '染色',
          class: 'large'
        },
        {
          name: '防蓝光',
          value: '防蓝光',
          class: 'large'
        },
        {
          name: 'RGP（硬性透气隐形眼镜）',
          value: 'RGP（硬性透气隐形眼镜）',
          class: 'large'
        },
        {
          name: '离焦RGP',
          value: '离焦RGP',
          class: 'large'
        },
      ],
      otherSolution: [{
        name: '低浓度阿托品 (0.01%-0.05%药物浓度)',
        value: '低浓度阿托品 (0.01%-0.05%药物浓度)',
        class: 'large'
      },
      {
        name: '中浓度阿托品 (0.1~0.25%药物浓度)',
        value: '中浓度阿托品 (0.1~0.25%药物浓度)',
        class: 'large'
      },
      {
        name: '高浓度阿托品 (0.5~1%药物浓度)',
        value: '高浓度阿托品 (0.5~1%药物浓度)',
        class: 'large'
      },
      {
          name: '联合治疗',
          value: '联合治疗',
          class: 'clo4 mg'
        },
        {
          name: '红光',
          value: '红光',
          class: 'clo4 mg'
        },
        {
          name: '闭目晒眼',
          value: '闭目晒眼',
          class: 'clo4 mg'
        },
        {
          name: '远视镜',
          value: '远视镜',
          class: 'clo4'
        },
        {
          name: '调节力训练',
          value: '调节力训练',
          class: 'clo4 mg'
        },
        {
          name: '视距拉远器',
          value: '视距拉远器',
          class: 'clo4 mg'
        },
        {
          name: '雾视',
          value: '雾视',
          class: 'clo4 mg'
        },
        {
          name: '眼部理疗',
          value: '眼部理疗',
          class: 'clo4'
        },
        {
          name: '中草药',
          value: '中草药',
          class: 'clo4 mg'
        },
        {
          name: '其他',
          value: '其他',
          class: 'clo4 mg'
        },
        {
          name: 'DOT',
          value: 'DOT',
          class: 'clo4 mg'
        },
        {
          name: '无',
          value: '无',
          class: 'clo4'
        },
      ],
    },

    // 弹窗键盘最后选中值
    keyboardVal: {
      al: {
        left: [],
        right:[]
      },
      k1: {
        left: [],
        right:[]
      },
      k2: {
        left: [],
        right:[]
      },
      diopterS: {
        left: [],
        right:[]
      },
      diopterC: {
        left: [],
        right:[]
      },
    },
    // 打开的弹窗当前选中值
    kCurrent: {
      al: [],
      k: [],
      diopter: [],
    },
    // 当前打开弹窗的对象属性
    keyboardObj: {},
    // 弹窗数字数组
    keyboard: {
      al: [],
      k: [],
      allChild: [],
      diopter: [],
      diopterChild: ['00', 25, 50, 75],
    },
    // 弹窗关闭显示
    dialog: {
      al: false,
      alLeve2: false,
      k: false,
      kLeve2: false,
      diopter: false,
      diopterLeve2: false
    },
    
    // 是否采用散瞳验光,能否点击
    dilatedRefractionDisabled: false,

    // 添加检查单时，是否散瞳验光弹窗
    dilatedRefractionDialog3: false,
    dilatedRefractionDialog1: false,
    dilatedRefractionDialog2: false,

    // 提交信息确认弹窗
    dialogShow: false,

    // 检查单据智能识别
    orcDialogShow: false
  },

  // 提交按钮提示弹窗
  dialogSubmit() {
    _this.setData({
      dialogShow: !_this.data.dialogShow
    })
  },

  // 验光弹窗
  tapDilatedRefractionDialog(e) {
    const {value, type} = e.currentTarget.dataset;
    let {formobj,archive} = _this.data;

    // type === 'dilatedRefractionDialog1' && archive.age < 12
    if (type === 'dilatedRefractionDialog1') {
      _this.setData({
        dilatedRefractionDialog1: false,
        dilatedRefractionDialog3: true,
      })
    } 
    // else if(type === 'dilatedRefractionDialog1' && archive.age >= 12) {
    //   _this.setData({
    //     dilatedRefractionDialog1: false,
    //     dilatedRefractionDialog2: true,
    //   })
    // } 
    else if(type === 'dilatedRefractionDialog2') {
      _this.setData({
        dilatedRefractionDialog2: false,
      })
    } else if(type === 'dilatedRefractionDialog3') {
      formobj.dilatedRefraction = value;
      _this.setData({
        dilatedRefractionDialog3: false,
        formobj
      })
    }

   
  },

  // 弹窗关闭打开
  tapTableCell(e) {
    // console.log(e.currentTarget.dataset)
    const {name, type, value} = e.currentTarget.dataset;
    let {dialog, keyboardObj, kCurrent} = _this.data;
    keyboardObj = e.currentTarget.dataset;

    // console.log(dialog, keyboardObj, kCurrent,'=============')
    if (name === 'al') {
      for(let k in dialog) {
        if (k === 'al') {
          dialog.al = true;
        } else {
          dialog[k] = false;
        }
      }
      
      kCurrent.al = value.split('.');
    } else if (name === 'diopterS' || name === 'diopterC') {
      for(let k in dialog) {
        if (k === 'diopter') {
          dialog.diopter = true;
        } else {
          dialog[k] = false;
        }
      }
      
      kCurrent.diopter = value.split('.');
    } else {
      for(let k in dialog) {
        if (k === 'k') {
          dialog.k = true;
        } else {
          dialog[k] = false;
        }
      }

      kCurrent.k = value.split('.');
    }
    // console.log(dialog)
    _this.setData({
      kCurrent,
      keyboardObj,
      dialog
    })

    // wx.showModal({
    //   title: '测试提示',
    //   content: JSON.stringify(kCurrent)+'，' + JSON.stringify(keyboardObj)+'，' + JSON.stringify(dialog),
    //   success: function (res) {
    //     if (res.confirm) {
          
    //     }
    //   }
    // })
  },

  // 数字选择
  tapNum(e) {
    // console.log(e.currentTarget.dataset);
    const {value, level, name} = e.currentTarget.dataset;
    let {keyboardObj, keyboardVal, kCurrent, dialog, formobj} = _this.data;
    // console.log(keyboardObj)

    if (level === 1) {
      keyboardVal[keyboardObj.name][keyboardObj.type][0] = value;
      kCurrent[name][0] = value;

      if (keyboardObj.name == 'al') {
        dialog.alLeve2 = true;
      } else if (keyboardObj.name.indexOf('diopter') !== -1) {
        dialog.diopterLeve2 = true;
      } else {
        dialog.kLeve2 = true;
      }
      
    } else {
      keyboardVal[keyboardObj.name][keyboardObj.type][1] = value;
      kCurrent[name][1] = value;

      for(let k in dialog) {
        dialog[k] = false;
      }

      formobj.rightAxis = keyboardVal.al.right.join('.');
      formobj.leftAxis = keyboardVal.al.left.join('.');
      formobj.rightK1 = keyboardVal.k1.right.join('.');
      formobj.leftK1 = keyboardVal.k1.left.join('.');
      formobj.rightK2 = keyboardVal.k2.right.join('.');
      formobj.leftK2 = keyboardVal.k2.left.join('.');

      formobj.rightDiopterS = keyboardVal.diopterS.right.join('.');
      formobj.leftDiopterS = keyboardVal.diopterS.left.join('.');
      formobj.rightDiopterC = keyboardVal.diopterC.right.join('.');
      formobj.leftDiopterC = keyboardVal.diopterC.left.join('.');

      // CR曲率半径的计算公式 337.5/((K1+K2)/2)
      if (formobj.rightK1 !== '' && formobj.rightK2 !== '') {
        formobj.rightCurvatureRadius = (337.5/((parseFloat(formobj.rightK1)+parseFloat(formobj.rightK2))/2)).toFixed(2);
      }
      if (formobj.leftK1 !== '' && formobj.leftK2 !== '') {
        formobj.leftCurvatureRadius = (337.5/((parseFloat(formobj.leftK1)+parseFloat(formobj.leftK2))/2)).toFixed(2);
      }

      _this.setData({ formobj })
    }
    // console.log(kCurrent, keyboardVal)
    _this.setData({
      dialog,
      kCurrent,
      keyboardVal
    })

  },
  // 保存
  submitOpenDialog() {
    let {
      formobj,
      photos,
      otherFileArray,
      dilatedRefractionDialog1,
      dilatedRefractionDialog2,
      dilatedRefractionDialog3,
    } = _this.data;
    if (formobj.inspectDate == '') {
      app.toast({
        title: '请选择检查日期'
      });
      return
    } else if (formobj.rightDiopterS == '' && formobj.leftDiopterS == '' && formobj.rightDiopterC == '' && formobj.leftDiopterC == '' && formobj.rightAxis == '' && formobj.leftAxis == '' && formobj.rightK1 == '' && formobj.leftK1 == '' && formobj.rightK2 == '' && formobj.leftK2 == '') {
      app.toast({
        title: '请录入比对验光单 或 比对生物测量仪单'
      });
      return
    } else if ((formobj.rightDiopterS !== '' && formobj.leftDiopterS !== '' && formobj.rightDiopterC !== '' && formobj.leftDiopterC !== '') || (formobj.rightAxis != '' && formobj.leftAxis != '' && formobj.rightK1 != '' && formobj.leftK1 != '' && formobj.rightK2 != '' && formobj.leftK2 != '')) {
      
      _this.setData({ dialogShow: true })

    } else {
      app.toast({
        title: '请完善比对验光单 或 比对生物测量仪单，任意一块'
      });
      return
    }
   

    
  },
  // 保存
  submit() {
    let {
      formobj,
      photos,
      otherFileArray,
      dilatedRefractionDialog1,
      dilatedRefractionDialog2,
      dilatedRefractionDialog3,
    } = _this.data;
   
    if (isClick) return;
    isClick = true;
    
    formobj.userArchiveId = opts.userArchiveId;
    formobj.fileArray = JSON.stringify(photos);
    formobj.otherFileArray = JSON.stringify(otherFileArray);

    if (formobj.height == '') formobj.height = 0;
    // 关闭信息确认弹窗
    _this.setData({ dialogShow: false })

    if (opts.id) {
      formobj.id = opts.id;
      // 修改
      http.userInspectReportUpdate(formobj).then(res => {
        wx.setStorageSync('storageVision', {})
        wx.setStorageSync('storageSpeed', {})

        // 清除新增缓存
        let curAdd = wx.setStorageSync('addCheck');
        if (curAdd && curAdd[opts.userArchiveId]) {
          delete curAdd[opts.userArchiveId];
          wx.setStorageSync('addCheck', curAdd);
        }
        
        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false
            // wx.navigateBack();

            _this.backTap();

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
      http.userInspectReportAdd(formobj).then(res => {
        opts.id = res.id;
        wx.setStorageSync('storageVision', {})
        wx.setStorageSync('storageSpeed', {})
        // 清除新增缓存
        let curAdd = wx.setStorageSync('addCheck');
        if (curAdd && curAdd[opts.userArchiveId]) {
          delete curAdd[opts.userArchiveId];
          wx.setStorageSync('addCheck', curAdd);
        }

        app.toast({
          icon: 'success',
          title: '保存成功',
          cb: function () {
            isClick = false

            _this.backTap();
          }
        })
      }).catch(res => {
        if (res.body.message.indexOf('检查日期已存在') > -1) {
            http.userInspectReportPage({
              pageNum: 1,
              pageSize: 500,
              userArchiveId: opts.userArchiveId
            }).then(report => {
              const arr = report.list.filter(item => item.inspectDate === formobj.inspectDate)
              if (arr.length > 0) {
                const current = arr[0]
                wx.showModal({
                  title: '',
                  content: res.body.message,
                  cancelText: '确定',
                  confirmText: '修改档案',
                  confirmColor: '#01c176',
                  success: function (res) {
                    if (res.confirm) {
                      wx.redirectTo({
                        url: `/pages/addCheck/addCheck?userArchiveId=${opts.userArchiveId}&id=${current.id}`,
                      })
                    }
                  }
                });
              }
            })
          } else {
            wx.showModal({
              title: '',
              content: res.body.message,
              showCancel: false,
              cancelText: '取消',
              confirmText: '确定',
              confirmColor: '#01c176',
              success: function (res) {}
            });
          }
        isClick = false
      })
    }


  },

  backTap() {
      
    var pages = getCurrentPages();   //当前页面
    var prevPage = pages[pages.length - 2];   //上一页面
    console.log('backTap', prevPage)
    prevPage.setData({
      isRefresh: true
    });
    wx.navigateBack({
      // 返回
      delta: 1
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
      archive
    } = _this.data;
    // if (archive.age >= 12) return;

    if (type == 'dilatedRefraction') {
      formobj[type] = !formobj[type];
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

  // 预览图片
  previewImg(e) {
    let {index, name} = e.currentTarget.dataset;
    let {
      photos,
      otherFileArray
    } = _this.data;

    let urls = [], current = '';
    if (name == 'otherFileArray') {
      otherFileArray.forEach((item) => {
        urls.push(util.requestImgUrl(item.url))
      })
      current = util.requestImgUrl(otherFileArray[index].url);
    } else {
      photos.forEach((item) => {
        urls.push(util.requestImgUrl(item.url))
      })
      current = util.requestImgUrl(photos[index].url);
    }
    wx.previewImage({
      current,
      urls
    })
  },
  // 删除图片
  deleteImg(e) {
    let {
      photos, otherFileArray
    } = _this.data;
    let {index, name} = e.currentTarget.dataset;
    if (name == 'otherFileArray') {
      otherFileArray.splice(index, 1);
      _this.setData({
        otherFileArray
      })
    } else {
      photos.splice(index, 1);
      _this.setData({
        photos
      })
    }
    
  },
  // 上传图片
  uploadImg(e) {
    const {type, name} = e.currentTarget.dataset;
    if(type == 'orc') _this.orcDialogCancelOpen();

    let {
      photos,
      otherFileArray
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
          isHideLoading: true,
          cb: function (d) {
            var item = {
              name: d.fileName,
              url: d.fileUri
            }
            if (type === 'orc') {
              // 拍照识别
              photos = [item];
              _this.getPhotoOrc(util.requestImgUrl(d.fileUri));
              _this.setData({
                photos
              })
            } else if (name === 'otherFileArray') {
              otherFileArray = [item];
              _this.setData({
                otherFileArray
              })
            } else {
              photos = [item];
              _this.setData({
                photos
              })
            }
            
          }
        });
      }
    })
  },

  getPhotoOrc(url) {
    wx.showLoading({
      title: '图片识别中',
    });
    http.userInspectReportOcr({
      imageUrl: url
    }).then(res => {
      let {formobj, keyboardVal} = _this.data;
      for(let k in res) {
        formobj[k] = res[k] + '';
      }

      // 键盘选中值
      keyboardVal.al = {
        left: (res.leftAxis+'').split('.'),
        right:(res.rightAxis+'').split('.')
      }
      keyboardVal.k1 = {
        left: (res.leftK1+'').split('.'),
        right:(res.rightK1+'').split('.')
      }
      keyboardVal.k2 = {
        left: (res.leftK2+'').split('.'),
        right:(res.rightK2+'').split('.')
      }
      _this.setData({
        keyboardVal,
        formobj
      })
      wx.hideLoading()
      app.toast({
        title: '请核对识别内容',
        time: 1000
      })
    }).catch(res => {
      wx.hideLoading()
      app.toast({
        title: res.body.message || 'orc fail'
      })
    })
  },

  orcDialogCancelOpen() {
    _this.setData({
      orcDialogShow: !_this.data.orcDialogShow
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
      formobj,
    } = _this.data;
    formobj[type] = value;
    _this.setData({
      formobj
    })
  },

  // 复选框选择
  ckChange(e) {
    const {
      type,
      value
    } = e.currentTarget.dataset;
    let {
      formobj
    } = _this.data;
    formobj[type] = formobj[type] === value ? '':value;
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
    // wx.removeStorageSync('addCheck');
    const addSync = wx.getStorageSync('addCheck');
    if (opts.id) {
      let { nvabarData } = _this.data;
      nvabarData.title = "修改检查单"
      _this.setData({ nvabarData })
    } else if (addSync && addSync[opts.userArchiveId]) {
      // console.log(wx.getStorageSync('addCheck'))
      const cur = addSync[opts.userArchiveId];
      _this.setData(cur);
    } else {
      _this.setData({
        dilatedRefractionDialog1: true
      })
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

    // 键盘
    let {keyboard, keyboardVal} = _this.data;

    for(let i = 16; i <=39; i++) {
      keyboard.al.push(i);
    }

    for(let i = 35; i <=52; i++) {
      keyboard.k.push(i);
    }
    for(let i = 0; i <= 99; i++) {
      keyboard.allChild.push(i < 10 ? '0'+i:i);
    }

    // 屈光度 二级
    let arr1 = [], arr2 = [];
    for(let i = 0; i <= 17; i++) {
      arr1.push('-'+i);
      arr2.push('+'+i);
    }
    let arr1New = _this.splitArray(arr1,6),
    arr2New = _this.splitArray(arr2,6);
    let diopter = [];
    for(let i = 0; i < arr1New.length; i++) {
      diopter = diopter.concat(arr1New[i].concat(arr2New[i]));
    }
    keyboard.diopter = diopter;
    // console.log(keyboard.diopter)
    _this.setData({
      keyboard
    })

    // 档案详情
    http.userArchiveDetail(opts.userArchiveId).then(archive => {
      archive.age =  util.calculateAge(archive.birth);
    //   if (archive.age >= 12) {
    //     _this.setData({
    //       dilatedRefractionDisabled: true
    //     })
    //   }
      _this.setData({
        archive
      })
    }).catch(res => {
      app.toast({
        title: res.body.message
      })
    })

    let {formobj} = _this.data;
    // 报告详情 inspectDate
    if (opts.id) {
      http.userInspectReportDetail(opts.id).then(res => {
        // 表单对象
        let formobj = {
          id: res.id,
          userArchiveId: res.userArchiveId,
          inspectDate: util.dateClipping(res.inspectDate, 0, 10),
          hospital: res.hospital,
          height: res.height,

          leftDiopterS: res.leftDiopterS,
          leftDiopterC: res.leftDiopterC,
          leftAxis: res.leftAxis,
          leftCurvatureRadius: res.leftCurvatureRadius,

          rightDiopterS: res.rightDiopterS,
          rightDiopterC: res.rightDiopterC,
          rightAxis: res.rightAxis,
          rightCurvatureRadius: res.rightCurvatureRadius,

          leftK1: res.leftK1,
          leftK2: res.leftK2,
          rightK1: res.rightK1,
          rightK2: res.rightK2,

          fileArray: res.fileArray,
          dilatedRefraction: res.dilatedRefraction,

          outSchoolHours: res.outSchoolHours,
          incorrectSittin: res.incorrectSittin,
          incorrectGlasses: res.incorrectGlasses,
          allergy: res.allergy,

          outdoorsHours: res.outdoorsHours,
          outdoorsHoursExplain: res.outdoorsHoursExplain,
          glassesType: res.glassesType,
          glassesTypeExplain: res.glassesTypeExplain,
          otherSolution: res.otherSolution,
          otherSolutionExplain: res.otherSolutionExplain,

          otherDescription: res.otherDescription,
          otherFileArray: res.otherFileArray
        };

        // 单据上传
        let photos = JSON.parse(res.fileArray);
        let otherFileArray = JSON.parse(res.otherFileArray);

        // 键盘选中值
        keyboardVal = {
          al: {
            left: res.leftAxis.split('.'),
            right:res.rightAxis.split('.')
          },
          k1: {
            left: res.leftK1.split('.'),
            right:res.rightK1.split('.')
          },
          k2: {
            left: res.leftK2.split('.'),
            right:res.rightK2.split('.')
          },
          diopterS: {
            left: res.leftDiopterS.split('.'),
            right:res.rightDiopterS.split('.')
          },
          diopterC: {
            left: res.leftDiopterC.split('.'),
            right:res.rightDiopterC.split('.')
          },
        }
        // console.log(keyboardVal)
        _this.setData({
          keyboardVal,
          formobj,
          photos,
          otherFileArray,
          report: res
        })
      }).catch(res => {
        app.toast({
          title: res.body.message
        })
      })
    } else {
      formobj.inspectDate = util.dateClipping(util.getCurrentDate(), 0, 10)
      _this.setData({ formobj })
    }
  },

  splitArray(array, size) {
    var result = [];
    for (var i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
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
    _this.setAddStorageSync();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    _this.setAddStorageSync();
  },

  setAddStorageSync() {
    if (!opts.id) {
      const k = _this.data;
      let add = wx.getStorageSync('addCheck') ? wx.getStorageSync('addCheck') : {};
      add[opts.userArchiveId] = {}
      add[opts.userArchiveId] = {
        // 表单对象
        formobj: k.formobj,
    
        // 视力检查数据单据上传
        otherFileArray: k.otherFileArray,
        // 电脑验光数据单据上传
        photos: k.photos,
        
        // 弹窗键盘最后选中值
        keyboardVal: k.keyboardVal,
        // 打开的弹窗当前选中值
        kCurrent: k.kCurrent,
        // 当前打开弹窗的对象属性
        keyboardObj: k.keyboardObj,


        // // 添加检查单时，是否散瞳验光弹窗
        // dilatedRefractionDialog3: k.dilatedRefractionDialog3,
        // dilatedRefractionDialog1: k.dilatedRefractionDialog1,
        // dilatedRefractionDialog2: k.dilatedRefractionDialog2,
      }
      wx.setStorageSync('addCheck', add)
    }
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