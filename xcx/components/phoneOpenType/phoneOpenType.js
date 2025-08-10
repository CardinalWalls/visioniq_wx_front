// components/phoneOpenType/phoneOpenType.js
let app = getApp();
const appg = app.globalData;
let _this = '';
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
    isShow: true
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
     * 获取手机号授权
     */
    getPhoneNumber(e) {
      // console.log(e);
      const v = e.detail;
      _this = this;
      if (v.errMsg === "getPhoneNumber:ok") {
        app.bindGetUserInfo(e, function() {
          // console.log(e);
          _this.triggerEvent("success", '');
          _this.navigateUrlSuccess();
          _this.btnShow();
        });
      } else {
        _this.navigateUrlFail();
        _this.btnShow();
      }
    },
  }
})