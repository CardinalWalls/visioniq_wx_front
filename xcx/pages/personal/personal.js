// pages/tabBar/Index/Index.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');
const config = require('../../utils/config.js');

let _this = "", isClickLimit = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "个人中心",
      type: 0
    },
    bg: util.getNetworkImg('userbg.jpg'),

    // 设置挂号时间
    dialogShowLimit: false,
    limitArr: [
      { name: '周一', value: 1, checked: false},
      { name: '周二', value: 2, checked: false},
      { name: '周三', value: 3, checked: false},
      { name: '周四', value: 4, checked: false},
      { name: '周五', value: 5, checked: false},
      { name: '周六', value: 6, checked: false},
      { name: '周日', value: 7, checked: false},
    ],

    // 我的二维码
    dialogShowEwm: false
  },

  tapEwm() {
    _this.setData({
      dialogShowEwm: !_this.data.dialogShowEwm
    })

    let {dialogShowEwm,expert, ewmImg} = _this.data;
    if (dialogShowEwm && !ewmImg) {
      let obj = {};
      obj.appId= config.APPID;
      obj.expertId = expert.id;
      obj.userid = expert.userId;
      http.postParamMd5({
        paramJson: JSON.stringify(obj)
      }).then(res => {
        http.getwxacodeunlimit({
          qrcode_name: 'myuser_'+ obj.userid,
          scene: res,
          page: 'pages/login/login',
          width: 280
        }).then(v => {
          
          _this.setData({
            ewmImg: v
          })
         
        });
  
      }).catch(res => {
        app.toast({
          title: res.body.message || '小程序码生成失败'
        });
      });
    }
  },

   // 设置挂号时间-提交
  submitLimit() {
    if (isClickLimit) return;
    isClickLimit = true;

    let {limitArr} = _this.data;
    let arr = [];
    for(let i = 0; i < limitArr.length; i++) {
      if (limitArr[i].checked) {
        arr.push(limitArr[i].value)
      }
    }
    _this.setData({ dialogShowLimit: false })
    http.appointmentLimit({
      limitWeekDays: arr.join('')
    }).then(res => {
      isClickLimit = false;
      app.toast({
        title: '提交成功',
        icon: 'success'
      })
    }).catch(res => {
      isClickLimit = false;
      app.toast({
        title: res.body.message,
      })
    })
  },
  // 设置挂号时间
  checkboxChange(e) {
    const {index, checked} = e.currentTarget.dataset;
    let {limitArr} = _this.data;
    limitArr[index].checked = !checked;
    _this.setData({ limitArr })
  },
  openLimit() {
    _this.setData({ dialogShowLimit: true })
  },
  /**
   * 拨打电话
   */
  makePhoneCall(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone //仅为示例，并非真实的电话号码
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    _this = this;
    _this.setData({
      navheight: appg.navheight
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

    // 用户信息
    http.userInfo().then(res => {
      res.phone = util.phonePwd(res.phone);
      _this.setData({
        user: res
      })
    })

     // 当前专家信息
    if(_this.data.minuser.type == 2) {
      http.expertInfo().then(res => {
        var arr = res.appointmentWeekLimit.split('');
        let {limitArr} = _this.data;
        for(let i = 0; i < limitArr.length;i++) {
          for(var k = 0; k < arr.length;k++) {
            if (limitArr[i].value == arr[k]) {
              limitArr[i].checked = true;
            }
          }
        }
  
        _this.setData({
          limitArr,
          expert: res
        })
      })
    }
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
    _this.minuserChange();
  },

  // 退出登录
  quitTap() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      confirmColor: '#01c176',
      success: function (res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'minuser',
            success (res) {
              // _this.minuserChange();
              // _this.setData({
              //   user: {}
              // })
              wx.reLaunch({
                url: '/pages/login/login',
              })
            }
          })
        }
      }
    })
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
  }
})