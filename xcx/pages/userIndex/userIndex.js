// pages/userIndex/userIndex.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');
const config = require('../../utils/config.js');

let _this = "", isClickBook = false, timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "",
      prev: false,
      // info: {
      //   avater: '',
      //   name: ''
      // },
      type: 0
    },

    shareObj: {
      path: 'pages/login/login',
      expertId: ''
    },
    
    // 欢迎弹窗
    dialogEnter: false,
    // swiper
    current: 0,

    // 在线预约弹窗
    dialogShowOnline: false,
    // 当前预约时间
    bookDate: [],
    bookObj: {
      targetTime: '',
      fullName: ''
    },

    //加载蒙层
    loading: false,

    // 未转换的 档案列表对应的视力报告
    // visionListObj: {},
    // 已转换视力报告图，l 左，r 右,档案列表对应的视力报告
    vision: {},

    // 消息未读弹窗
    dialogUnRead: false
  },

  // 消息未读
  unReadLook() {
    _this.unReadDialogClose();
    _this.createSelectorQuery().select('#page').boundingClientRect((item) => {
      if (item) {
        console.log(item)
        wx.pageScrollTo({
          scrollTop: item.height || 1000
        })
      }
    }).exec();
    
  },
  unReadDialogClose() {
    _this.setData({
      dialogUnRead: false
    })
  },
  // 打开风险评估弹窗
  tapRisk(e) {
    let {visionListObj, archive, current} = _this.data;
    if (visionListObj[archive.list[current].id].total == 0) {
      app.toast({
        title: '录入检查单后才能评估'
      })
    } else {
      app.toast({
        title: '数据生成中，稍后再试'
      })
    }
  },

  bindanimationfinish() {
    console.log('bindanimationfinish')
    if (!_this.data.loading) return;
    _this.setData({
      loading: false
    })
    
  },

  // current 改变时会触发 change 事件
  bindchange(e) {
    console.log('bindchange111')
    const {current} = e.detail;
    _this.setData({ 
      current,
      loading: true
    })
    _this.getDataAll();
  },

  // 删除预约
  deleteBook(e) {
    const {id, date} = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定删除 ' +date+' 的预约？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      confirmColor: '#01c176',
      success: function (res) {
        if (res.confirm) {
          http.bookDelete(id).then(res => {
            app.toast({
              title: '删除成功',
              icon: 'success'
            })
            _this.getBookList();
          })
        }
      }
    });
  },
  // 确定预约
  submitBook() {
    const {bookObj, archive, current, book} = _this.data;

    const booked = book.list.filter(item => item.targetTime == bookObj.targetTime);
    // console.log(booked)
    if (bookObj.fullName == '') {
      app.toast({
        title: '请选择预约时间'
      })
      return;
    } else if (booked.length > 0) {
      app.toast({
        title: '请勿重复预约'
      })
      return;
    }

    if (isClickBook) return;
    isClickBook = true;
    const cur = archive.list[current];
    http.bookAdd({
      expertId: cur.expertId,
      userArchiveId: cur.id,
      targetTime: bookObj.targetTime
    }).then(res => {
      isClickBook = false;
      _this.getBookList();
      app.toast({
        title:'预约成功',
        icon: 'success'
      });
      _this.setData({
        dialogShowOnline: false
      })
    }).catch(res => {
      isClickBook = false
      const v =  res.body;
      if (v && v.errorCode === 100) {
        app.total({
          title: '需要实名认证'
        })
        _this.setData({
          dialogShowOnline: false
        })
      } else {
        app.toast({
          title: v ? v.message : 'error'
        });
      }
    })
  },
  // 打开预约弹窗
  openBook() {
    const {expert} = _this.data;
    if (expert && expert.appointmentWeekLimit.length == 7) {
      app.toast({
        title: '专家门诊休息中'
      })
      return
    }

    _this.setData({
      dialogShowOnline: true
    })
  },

  // 欢迎弹窗关闭
  dialogEnterClose() {
      console.log('dialogEnterClose')
    _this.setData({ dialogEnter: false })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    // console.log(appg)
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

    

    // 用户信息
    let {nvabarData, minuser} = _this.data;
    // console.log(minuser)
    http.userInfo().then(res => {
      if (minuser.avatar != res.avatar) {
        minuser.avatar = res.avatar;
        _this.setData({ minuser })
        wx.setStorageSync('minuser', minuser)
      }
      nvabarData.user = {
        // avatar: res.avatar,
        // name: res.realName !== '' ? res.realName : (res.wxName !== '' ?  res.wxName:res.userNickName)
        icon: 'icon-user-personal',
        text: '个人中心'
      }
      _this.setData({
        nvabarData,
        user: res
      })
    });


    // 档案列表
    http.userArchivePage({
      sortField: 'createTime DESC'
    }).then(res => {
      _this.setData({
        archive: res
      });

      if (res.total == 0) {
        app.total({
          title: '您还未档案,添加档案后继续',
          cb: function() {
            wx.redirectTo({
              url: '/pages/addArchives/addArchives',
            })
          }
        })
        return
      }


      // 首次进入欢迎弹窗
        if(!wx.getStorageSync('userEnterAlert')) {
            http.adList({
                positionCode: 'USER_ENTER_ALERT'
                }).then(res => {
                if (!(res &&res[0])) return
                    const {archive, current} = _this.data;
                    let remark = (res &&res[0]) ? res[0].remark:'';
                    let name = '<span style="color:red">' + archive.list[current].expertName + '</span> '
                    remark = remark.replace(/XXX/g, name)
                    _this.setData({
                        enter: res[0] || {},
                        enterImg: (res &&res[0]) ? res[0].img:'',
                        enterText: remark
                    });
                    
                    wx.nextTick(() => {
                    _this.setData({
                        dialogEnter: true
                    })
                    wx.setStorageSync('userEnterAlert', true)
                    })
                });
        }

      // 视力报告，专家咨询
      _this.getDataAll();
    })
  },

  /**
 * 历史眼轴发展指数、远视储备数据
 * 
 * 根据提供的档案信息、报告信息以及报告列表来获取相关的历叐数据。
 * 
 * @param {Object} archive - 档案对象，包含与档案相关的信息。
 * @param {Object} report - 报告对象，包含具体的报告详情。
 * @param {Array} reportList - 报告列表，包含多个报告对象的数组。
 * @returns {Array|Object} 返回历史记录数据，可能是数组或对象形式。
 */
getHistory(archive, report, reportList) {
    let obj = {
      patient_id: report.id,
      gender: archive.gender,
      age: util.calculateAge(archive.birth)
    };

    let objL = {
      ...obj}, 
    objR = {...obj};

    if (report.leftAxis != '') objL.AL = report.leftAxis;
    if (report.leftCurvatureRadius != '') objL.CR = report.leftCurvatureRadius;
   
    if (report.rightAxis != '') objR.AL = report.rightAxis;
    if (report.rightCurvatureRadius != '') objR.CR = report.rightCurvatureRadius;

    if (report.leftK1 != '') objL.K1 = report.leftK1;
    if (report.leftK2 != '') objL.K2 = report.leftK2;
    
    if (report.rightK1 != '') objR.K1 = report.rightK1;
    if (report.rightK2 != '') objR.K2 = report.rightK2;

    // 是否散瞳验光
    // 注意, CR和 K1\K2 不可同时缺省.
    // console.log('是否散瞳验光',report.dilatedRefraction)
    if (report.dilatedRefraction) {
      if(report.leftDiopterS !== '') objL.diopter_s_accurate = parseFloat(report.leftDiopterS);
      if(report.leftDiopterC !== '') objL.diopter_c_accurate = parseFloat(report.leftDiopterC);

      if(report.rightDiopterS !== '') objR.diopter_s_accurate = parseFloat(report.rightDiopterS);
      if(report.rightDiopterC !== '') objR.diopter_c_accurate = parseFloat(report.rightDiopterC);
    } else {
      if(report.leftDiopterS !== '') objL.diopter_s = parseFloat(report.leftDiopterS);
      if(report.leftDiopterC !== '') objL.diopter_c = parseFloat(report.leftDiopterC);
      
      if(report.rightDiopterS !== '') objR.diopter_s = parseFloat(report.rightDiopterS);
      if(report.rightDiopterC !== '') objR.diopter_c = parseFloat(report.rightDiopterC);
    }

    // history_AL_records 历史眼轴数据的列表
    // history_farsight_records 历史散瞳验光数据的列表
    let historyALRecordsLeft = [], historyALRecordsRight = [], historyFarsightRecordsLeft = [], historyFarsightRecordsRight = [];

    let fieldLeft = ['leftAxis', 'leftCurvatureRadius', 'leftK1', 'leftK2'],
    fieldRight = ['rightAxis', 'rightCurvatureRadius', 'rightK1', 'rightK2'],
    fieldObj = ['AL', 'CR', 'K1', 'K2'],

    ygFieldLeft = ['leftDiopterS', 'leftDiopterC'],
    ygFieldRight = ['rightDiopterS', 'rightDiopterC'],
    ygFieldObj = ['diopter_s_accurate', 'diopter_c_accurate'];

    let visionList = reportList;
    for(let i = 0; i < visionList.length; i++) {
      if(i < 20) {
        let cur = visionList[i];
        
        let curLeft = { time: cur.inspectDate}, curRight = { time: cur.inspectDate};
        for(let x = 0; x < fieldLeft.length; x++) {
          for(let k in cur) {
            if (k == fieldLeft[x] && cur[k] !== '') {
              curLeft[fieldObj[x]] = parseFloat(cur[k]);
              break;
            }
          }
        }

        for(let x = 0; x < fieldRight.length; x++) {
          for(let k in cur) {
            if (k == fieldRight[x] && cur[k] !== '') {
              curRight[fieldObj[x]] = parseFloat(cur[k]);
              break;
            }
          }
        }


        if (!(!curLeft.AL && !curLeft.CR && !curLeft.K1 && !curLeft.K2)) {
          historyALRecordsLeft.push(curLeft)
        }

        if (!(!curRight.AL && !curRight.CR && !curRight.K1 && !curRight.K2)) {
          historyALRecordsRight.push(curRight)
        }
        

        // 散瞳验光
        if(cur.dilatedRefraction) {
          let ygCurLeft = { time: cur.inspectDate}, ygCurRight = { time: cur.inspectDate};
          for(let x = 0; x < ygFieldLeft.length; x++) {
            for(let k in cur) {
              
              if (k == ygFieldLeft[x] && cur[k] !== '') {
                ygCurLeft[ygFieldObj[x]] = parseFloat(cur[k]);
                break;
              }
            }
          }
          for(let x = 0; x < ygFieldRight.length; x++) {
            for(let k in cur) {
              if (k == ygFieldRight[x] && cur[k] !== '') {
                ygCurRight[ygFieldObj[x]] = parseFloat(cur[k]);
                break;
              }
            }
          }

          if (!(!ygCurLeft.diopter_s_accurate && !ygCurLeft.diopter_c_accurate)) {
            historyFarsightRecordsLeft.push(ygCurLeft)
          }
          
          if (!(!ygCurRight.diopter_s_accurate && !ygCurRight.diopter_c_accurate)) {
            historyFarsightRecordsRight.push(ygCurRight)
          }
          
        }

      }
    }


    objL.history_AL_records = historyALRecordsLeft;
    objR.history_AL_records = historyALRecordsRight;

    objL.history_farsight_records = historyFarsightRecordsLeft;
    objR.history_farsight_records = historyFarsightRecordsRight;

    // 左眼
    util.getHistory(objL, function(resultLeft) {
        let storageHistory = wx.getStorageSync('storageHistory') || {};
        if (!storageHistory[archive.id]) storageHistory[archive.id] = {};
        storageHistory[archive.id].l = resultLeft;
        wx.setStorageSync('storageHistory', storageHistory)
    })

    // 右眼
    util.getHistory(objR, function(resultRight) {
        let storageHistory = wx.getStorageSync('storageHistory') || {};
        if (!storageHistory[archive.id]) storageHistory[archive.id] = {};
        storageHistory[archive.id].r = resultRight;
        wx.setStorageSync('storageHistory', storageHistory)
    })
  },

  // 视力报告初始化
  getVisionReport(index) {
    // | 名称       | 位置  | 类型    | 必选 | 说明          |
    // | ---------- | ----- | ------- | ---- | ------------- |
    // | patient_id | query | integer | 否   | 学生 id       |
    // | AL         | query | number  | 是   | 眼轴长度      |
    // | CR         | query | number  | 是   | 角膜曲率半径  |
    // | age        | query | number  | 是   | 年龄 [3-18]   |
    // | gender     | query | integer | 是   | 1 男性 2 女性 |
    
    let {vision, current, archive, visionListObj} = _this.data;
    const archiveCur = archive.list[current];
    if (!archiveCur) return;
    const id = archiveCur.id;
    const reportList = visionListObj[archiveCur.id].list;

    // 去重后的记录档案
    const uniqueArr = util.uniqueByValue(reportList, 'inspectDate');

    // 历史眼轴发展指数、远视储备数据
    _this.getHistory(archiveCur, uniqueArr[index], uniqueArr);

    let obj = {
        user_info: {
            name: archiveCur.name,
            gender: archiveCur.gender,
            birthday: archiveCur.birth
        },
        all_records: []
    };

    if (!vision[id]) vision[id]= [];
    vision[id][index] = {};
    vision[id][index].id = archiveCur.id;
    vision[id][index].age = util.calculateAge(archiveCur.birth);
    vision[id][index].gender = archiveCur.gender;
    
    let objL = {
      ...obj}, 
    objR = {...obj};


    let leftAllRecords = [], rightAllRecords = [];
    uniqueArr.map((item, index) => {
        let lItem = {}, rItem = {};
        lItem.inspect_date = item.inspectDate + 'T00:00:00'
        rItem.inspect_date = item.inspectDate + 'T00:00:00'

        // 是否散瞳验光
        // 注意, CR和 K1\K2 不可同时缺省.
        // console.log('是否散瞳验光',report.dilatedRefraction)
        if (item.dilatedRefraction) {
            if (item.leftDiopterS !== '') lItem.diopter_s_accurate = parseFloat(item.leftDiopterS);
            if (item.leftDiopterC !== '') lItem.diopter_c_accurate = parseFloat(item.leftDiopterC);
    
            if (item.rightDiopterS !== '') rItem.diopter_s_accurate = parseFloat(item.rightDiopterS);
            if (item.rightDiopterC !== '') rItem.diopter_c_accurate = parseFloat(item.rightDiopterC);
        } else {
            if (item.leftDiopterS !== '') lItem.diopter_s = parseFloat(item.leftDiopterS);
            if (item.leftDiopterC !== '') lItem.diopter_c = parseFloat(item.leftDiopterC);
            
            if (item.rightDiopterS !== '') rItem.diopter_s = parseFloat(item.rightDiopterS);
            if (item.rightDiopterC !== '') rItem.diopter_c = parseFloat(item.rightDiopterC);
        }

        if (item.leftAxis != '') lItem.AL = parseFloat(item.leftAxis);
        if (item.leftCurvatureRadius != '') lItem.CR = parseFloat(item.leftCurvatureRadius);
    
        if (item.rightAxis != '') rItem.AL = parseFloat(item.rightAxis);
        if (item.rightCurvatureRadius != '') rItem.CR = parseFloat(item.rightCurvatureRadius);

        if (item.leftK1 != '') lItem.K1 = parseFloat(item.leftK1);
        if (item.leftK2 != '') lItem.K2 = parseFloat(item.leftK2);
        
        if (item.rightK1 != '') rItem.K1 = parseFloat(item.rightK1);
        if (item.rightK2 != '') rItem.K2 = parseFloat(item.rightK2);

        leftAllRecords.push(lItem)
        rightAllRecords.push(rItem)
    })
    objL.all_records = leftAllRecords;
    objR.all_records = rightAllRecords;
    let storageVision = wx.getStorageSync('storageVision') || {};

    // console.log(objL,'==========')

    // 左眼
    util.getVision(objL, function(resultLeft) {
      vision[id][index].l = resultLeft;
      if (!storageVision[archiveCur.id]) storageVision[archiveCur.id] = {};
      storageVision[archiveCur.id] = vision[id][index];
      wx.setStorageSync('storageVision', storageVision)
      _this.setData({
        vision
      })

      // 设置风险等级
      _this.setRiskLevel(archiveCur, resultLeft.nearsight_level)

    })

    // 右眼
    util.getVision(objR, function(resultRight) {
      vision[id][index].r = resultRight;
      if (!storageVision[archiveCur.id]) storageVision[archiveCur.id] = {};
      storageVision[archiveCur.id] = vision[id][index];
      wx.setStorageSync('storageVision', storageVision);
      console.log(vision, storageVision)
      _this.setData({
        vision
      })
    })
  },

  // 设置风险等级
  setRiskLevel(archive, level, cb) {
    // console.log('setRiskLevel', archive, level)
    if(!archive) return;
    
    if(!(level !== 0 && archive.riskLevel !== level-1)) return

    http.userArchiveUpdate({
        id: archive.id,
        name:archive.name,
        gender: archive.gender,
        birth:archive.birth,
        parentsMyopia: archive.parentsMyopia,
        regionId:archive.regionId,
        idcard: archive.idcard,
        riskLevel:level-1,
    }).then(res => {
        if(cb) cb(level-1)
    })
  },

  // 初始化档案相关数据
  getDataAll() {
    const {current, archive, visionListObj} = _this.data;
    let archiveCur = archive.list[current];  
    archiveCur.age = util.calculateAge(archiveCur.birth)
    _this.setData({
      archiveCurrent: archiveCur
    });
    // console.log(_this.data.archiveCurrent, archiveCur.expertId)
    
    // 消息未读数
    http.userArchivePage({
      id: archiveCur.id
    }).then(res => {
      let unread = res.list[0].unread || 0 
      _this.setData({
        unread,
        dialogUnRead: unread > 0 ? true: false
      })
    })
    

    // 用于分享携带专家参数
    wx.setStorageSync('shareExpertId', archiveCur.expertId)
    // console.log('shareExpertId='+wx.getStorageSync('shareExpertId')+'==============')
   
     // 视力报告
     if ((!visionListObj || (visionListObj &&!visionListObj[archiveCur.id])) && archiveCur.age <=18) {
      http.userInspectReportPage({
        pageNum: 1,
        pageSize: 20,
        userArchiveId: archiveCur.id
      }).then(v => {
        if (!visionListObj) _this.setData({ visionListObj: {}})

        let {visionListObj, vision} = _this.data;
        visionListObj[archiveCur.id] = v;
        _this.setData({ visionListObj})
       if(v.total > 0 && !vision[archiveCur.id]) {
        let storageVision = wx.getStorageSync('storageVision');
        // console.log(storageVision,'=============1')
        if (storageVision && storageVision[archiveCur.id]) {
          if (!vision[archiveCur.id]) vision[archiveCur.id] = [];
          vision[archiveCur.id][0] = storageVision[archiveCur.id];
          _this.setData({
            vision
          })

          // 设置风险等级
          if (storageVision[archiveCur.id].l){
            _this.setRiskLevel(archiveCur, storageVision[archiveCur.id].l.nearsight_level)
          }
        } else {
          _this.getVisionReport(0)
        }
        
       }
      //  console.log(visionListObj,'==========1')
      })
     }
     

     

    // 专家信息
    if (archiveCur.expertId == '') return;
    http.expertInfo({
      id: archiveCur.expertId
    }).then(expert => {
      const limitArr = expert.appointmentWeekLimit ? expert.appointmentWeekLimit.split(''):[];
      
      // 可预约时间
      let bookDate = [], bookDateAll = [];
      for (let i = 0; i < 7; i++) {
        let cur = util.addOrReduceDate('D', '', i);
        cur.disabled = true;
        cur.fullName = cur.date + '（' + cur.week + '）';
        for (let k = 0; k < limitArr.length; k++) {
          if (cur.value == limitArr[k]) {
            cur.disabled = false;
            break;
          }
        }
        bookDateAll.push(cur)
      }

      bookDate = bookDateAll.filter(item => item.disabled)
      // console.log(bookDate)
      _this.setData({
        bookDateAll,
        bookDate,
        expert
      });

      // 预约列表
      _this.getBookList();
    })
    
    
  },



  // 预约列表
  getBookList() {
    const {current, archive, bookDateAll} = _this.data;
    const archiveCur = archive.list[current];
    http.bookPage({
      userArchiveId: archiveCur.id,
      pageNum: 1,
      pageSize: 30,
      targetTimeStart:bookDateAll[0].date,
      targetTimeEnd:bookDateAll[bookDateAll.length - 1].date
    }).then(res => {
      _this.setData({
        book: res
      })
    })
  },

  // 文本框改变值
  pickerChange(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const {
      value
    } = e.detail;
    let {
      bookObj,
      bookDate
    } = _this.data;
    bookObj.fullName = bookDate[value].fullName;
    bookObj[type] = bookDate[value].date;
    _this.setData({
      bookObj
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
    if (_this.data.isRefresh === true) {
      const {current, archive, visionListObj, vision} = _this.data;
      let archiveCur = archive.list[current];  
      if (visionListObj[archiveCur.id]) {
        delete visionListObj[archiveCur.id];
      }
      if (vision[archiveCur.id]) {
        delete vision[archiveCur.id];
      }
      _this.setData({ visionListObj, vision })

      let storageVision = wx.getStorageSync('storageVision');
      // console.log(storageVision,archiveCur.id,'=========')
      if (storageVision[archiveCur.id]) {
        delete storageVision[archiveCur.id];
      }
      wx.setStorageSync('storageVision', storageVision)

      // 视力报告，专家咨询
      _this.getDataAll();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('onHide')
    _this.setData({
      isRefresh: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('onunload')
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
  onPullDownRefresh() {
    _this.setData({
      visionListObj: {},
      vision: {}
    })
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})