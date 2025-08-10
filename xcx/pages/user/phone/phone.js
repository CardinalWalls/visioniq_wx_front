// pages/users/index/index.js
const app = getApp()
const util = require('../../../utils/util.js');
const http = require('../../../utils/http.js');
const config = require('../../../utils/config.js');
let _this = "";
let time = 59;
let inter;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: ''
    },
    info: '',
    d: {
      phone: "",
      verifyCode: ""
    },
    // 图形验证码
    imgverifyCode: "",
    // 图形验证码图片
    edgeCodeImg: "",
    // 验证码
    verifyCode: "",
    verify: {
      visible: true,
      text: '获取验证码'
    },
    // 3 = 修改手机号，4 = 绑定手机号
    type: 3,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    let nvabarData = _this.data.nvabarData;
    if (options.type === "3") {
      nvabarData.title = "修改手机号";
    } if (options.type === "4") {
      nvabarData.title = "绑定手机号";
    }

    _this.setData({
      nvabarData
    });

    _this.getEdgeCodeImg();
  },

  // 图形验证码
  imgverifyCode: function (e) {
    _this.setData({
      imgverifyCode: e.detail.value
    })
  },
  /**
   * 获取图形验证码
   */
  getEdgeCodeImg: function () {
    _this.setData({
      edgeCodeImg: config.BASEURL + '/api/edge/captcha?type=' + _this.data.type + '&' + Date.now()
    });
  },

  /**
   * 发送验证码
   */
  sendYzm() {
    // yzmClass
    if (!_this.data.verify.visible) {
      return
    }

    const v = _this.data.d;
    console.log(v);
    if (v.phone === "") {
      wx.showToast({
        title: "手机号码不能为空",
        icon: 'none'
      });
      return;
    } else if (v.phone.length !== 11) {
      wx.showToast({
        title: "手机号码格式不正确",
        icon: 'none'
      });
      return;
    } else if (_this.data.imgverifyCode === "") {
      wx.showToast({
        title: "图形验证码不能为空",
        icon: 'none'
      });
      return;
    }

    // type 发送类型; 0 = 登录，1 = 注册，2 = 找回密码，3 = 修改手机号，4 = 绑定手机号，5 = 余额支付，6 = 修改邮箱或者验证原手机号，7、赠送积分
    http.sendMsg({
      phone: v.phone,
      type: _this.data.type,
      preCode: _this.data.imgverifyCode
    }).then(res => {
      console.log(res.data);

      _this.setData({
        verify: {
          visible: false,
          text: time + "s"
        }
      });
      inter = setInterval(() => {
        time--;
        if (time <= 1) {
          _this.setData({
            verify: {
              visible: true,
              text: "获取验证码"
            }
          });
          clearInterval(inter);
          return;
        }
        _this.setData({
          verify: {
            visible: false,
            text: time + "s"
          }
        });
      }, 1000);

      wx.showToast({
        title: "短信验证码发送成功",
        icon: 'none'
      });
    }).catch(res => {
      _this.getEdgeCodeImg();
    })
  },

  /**
  * 文本框改变值
  */
  inputChange(e) {
    const t = e.currentTarget.dataset;
    const v = e.detail.value;
    let d = _this.data.d;

    if (t.type === "phone") {
      d.phone = v;
      _this.setData({
        d: d
      });
    } else if (t.type === "verifyCode") {
      d.verifyCode = v;
      _this.setData({
        d: d
      });
    } else if (t.type === "imgverifyCode") {
      _this.setData({
        imgverifyCode: v
      });
    }
  },

  /**
   * 修改手机号码
   */
  tapSubmit() {
    const v = _this.data.d;
    console.log(v.phone.length);
    if (v.phone === "") {
      app.toast({
        title: "手机号码不能为空"
      });
      return;
    } else if (v.phone.length !== 11) {
      app.toast({
        title: "手机号码格式不正确"
      });
      return;
    } else if (_this.data.imgverifyCode === "") {
      app.toast({
        title: "图形验证码不能为空"
      });
      return;
    } else if (v.verifyCode === "") {
      app.toast({
        title: "手机验证码不能为空"
      });
      return;
    } else if (v.verifyCode.length !== 6) {
      app.toast({
        title: "手机验证码格式不正确"
      });
      return;
    }

    http.putPhone(_this.data.d).then(v => {
      let minuser = wx.getStorageSync('minuser');
      minuser.phone = v.phone;
      app.changeMinuser(minuser);

      app.toast({
        title: "提交成功",
        cb: function () {
          wx.navigateBack()
        }
      });
      _this.setData({
        verify: {
          visible: true,
          text: "获取验证码"
        }
      });
      clearInterval(inter);
    }).catch(res => {
      _this.setData({
        verify: {
          visible: true,
          text: "获取验证码"
        }
      });
      clearInterval(inter);
    })

  }

})