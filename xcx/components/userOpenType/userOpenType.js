

// components/phoneOpenType/phoneOpenType.js
let app = getApp();
let _this = '';

const http = require("../../utils/http");
const util = require("../../utils/util");
const upload = require("../../utils/upload");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // typecount 1: 在tabBar菜单栏调用的； 0：跳转到指定页面；-1 不跳转页面,
    typecount: {
      type: Number,
      value: 0
    },
    successUrl: {
      type: String,
      value:''
    },
    failUrl: {
      type: String,
      value:''
    },

    // 是否需要需要隐私认证
    needAuthorization: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    canIUseGetUserProfile: 1, // 1 getUserInfo; 2 getUserProfile; 3 头像昵称填写能力 
    isShow: true
  },

  attached: function () {
    _this = this;
    const SDKVersion = wx.getSystemInfoSync().SDKVersion;
    // console.log('SDKVersion=', SDKVersion);
    // const version = util.compareVersion(SDKVersion, '2.10.4');
    if (util.compareVersion(SDKVersion, '2.21.2') >= 0) {
      this.setData({
        canIUseGetUserProfile: 3
      });
    } else if (util.compareVersion(SDKVersion, '2.10.4') >= 0) {
      this.setData({
        canIUseGetUserProfile: 2
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    privacyAuth() {
      this.triggerEvent("privacyAuth", true);
    },
    btnHide() {
      console.log('btnHide');
      this.setData({
        isShow: false
      });
    },

    btnShow() {
      this.setData({
        isShow: true
      });
    },

    // 授权跳转页面
    navigateUrlSuccess() {
      const { typecount,successUrl } = this.data;
      if (typecount === -1) return;

      if (typecount === 0) {
        wx.navigateTo({
          url: successUrl,
        }); 
      } else if (typecount === 1) {
        wx.switchTab({
          url: successUrl,
        });
      } 
    },

    // 授权跳转页面
    navigateUrlFail() {
      const { typecount,failUrl } = this.data;
      if (typecount === -1) return;

      if (typecount === 0) {
        wx.navigateTo({
          url: failUrl,
        }); 
      } else if (typecount === 1) {
        wx.switchTab({
          url: failUrl,
        });
      } 
    },

    /**
     * 获取微信信息头像和昵称授权（高版本），2.27.1及以上
     */
    bindchooseavatar(e) {
      console.log(e);
      const { avatarUrl } = e.detail;
      upload.upload({
        filePath: avatarUrl,
        cb: function (d) {
          // console.log(d.fileUri);
          _this.updateUserInfo({
            avatar: d.fileUri,
            wxImg: d.fileUri,
          });
          _this.btnShow();
        },
        cbFail: function() {
          _this.btnShow();
        }
      })
        
    },
    /**
     * 获取微信信息头像和昵称授权（高版本）
     */
    getUserProfile() {
      // 开发者工具中仅 2.10.4 及以上版本可访问, 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '用于完善个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success(res) {
          const userInfo = res.userInfo;
          if (res.errMsg === "getUserProfile:ok") {
            _this.updateUserInfo({
              avatar: userInfo.avatarUrl,
              userNickName: userInfo.nickName,
              wxImg: userInfo.avatarUrl,
              wxName: userInfo.nickName
            });
          }
          _this.btnShow()
        },
        fail(res) {
          _this.navigateUrlFail();
          _this.btnShow()
        }
      });

    },

    /**
     * 获取微信信息头像和昵称授权（低版本），2.10.4以下
     */
    getUserInfo(e) {
      console.log(e);
      const { errMsg, userInfo } = e.detail;
      if (errMsg === 'getUserInfo:ok') {
        _this.updateUserInfo({
          avatar: userInfo.avatarUrl,
          userNickName: userInfo.nickName,
          wxImg: userInfo.avatarUrl,
          wxName: userInfo.nickName
        });
      } else {
        _this.navigateUrlFail();
      }

      _this.btnShow()
    },


    // 添加微信用户昵称和头像,性别
    updateUserInfo(obj) {
      http.userInfoPut(obj).then(res => {
        // 存储用户详细资料(必须要,用户授权头像时判断)
        let minuser = wx.getStorageSync('minuser');
        minuser.wxImg = res.wxImg;
        minuser.avatar = res.avatar;
        minuser.wxName = res.wxName;
        wx.setStorageSync('minuser', minuser)
        app.changeMinuser(minuser);

        _this.triggerEvent("success", '');
        _this.navigateUrlSuccess();
      })
    },


    // 版本号比较
    compareVersion(v1, v2) {
      v1 = v1.split('.')
      v2 = v2.split('.')
      const len = Math.max(v1.length, v2.length)

      while (v1.length < len) {
        v1.push('0')
      }
      while (v2.length < len) {
        v2.push('0')
      }

      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
          return 1
        } else if (num1 < num2) {
          return -1
        }
      }

      return 0
    }
  }
})