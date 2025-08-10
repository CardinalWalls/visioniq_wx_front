var http = require("http.js");
// ==========================================
// app onShow
// ==========================================
export const appShow = {
  showLoad: function (options) {
    // 分享用户由分享页进入时储存数据，新用户登录注册时，该userid当作推荐人,分享小程序码二维码进来的
    const _this = this;
    if (options.query.scene && options.query.scene !== '') {
      http.getParamMd5(options.query.scene).then(res => {
        _this.sceneLoad(res);
      }).catch(res => {
        _this.toast({
          title: res.body.message
        });
      })
    } else {
      _this.sceneLoad(options.query);
    }
  },
  sceneLoad: function (options) {
    // 分享用户由分享页进入时储存数据，新用户登录注册时，该userid当作推荐人
    if (options.userid && options.userid !== '') {
      wx.setStorageSync('shareid', options.userid)
    }

    // 注册时绑定的医生拓展信息ID
    if (options.expertId && options.expertId !== '') {
      wx.setStorageSync('expertId', options.expertId)
    }


    this.globalData.globalQuery = options;
    // 是否已执行完成登录接口，且执行页面数据初始话的方法

    // 微信自动登录
    if (wx.getStorageSync('minuser') === '') {
      this.autoLogin();
    } else {
      // 添加分享记录
      if (options.userid && options.userid !== '') {
        this.userShareAdd();
      }
    }
  },
}


// ==========================================
// 手机号自动登录
// ==========================================
export const phoneAutoLogin = {
  
  /**
   * @author: wangjing
   * @update: 20201104
   * @func
   * @description: 自动登录,在NarBar组件里面调用的,组件里面执行该方法，判断是否需要打开授权弹窗
   * @param {object} cb 回调函数
   * @param {boolean} iscallBackMinuser 使用调用callBackMinuser方法
   */
  autoLogin: function (cb, iscallBackMinuser) {
    const _this = this;
    wx.showLoading({
      title: '加载中'
    });
    wx.login({
      success: v => {
        console.log(v)
        http.miniSession({ code: v.code }).then(session => {
          http.miniPhoneLogin({
            wxSessionTicket: session.wxSessionTicket
          }).then(res => {

            if (cb) {
              cb(res);
            }
  
            if (res.token) {
              console.log('已注册的用户');
              // 已注册的用户
              _this.changeMinuser(res);
  
              // 添加分享记录
              if (_this.globalData.globalQuery.userid && _this.globalData.globalQuery.userid !== '') {
                _this.userShareAdd();
              }

              // 登录成功的回调函数
              _this.callBackMinuserChange();
            } else {
              console.log('未注册的用户=', wx.getStorageSync('shareid'));
            }
  
            // 已完成登录验证,回调函数 minuserChange
            wx.hideLoading();
          }).catch(res => {
            wx.showToast({
              title: res.body.message || 'error',
              icon: 'none'
            })
          });
        }).catch(res => {
          wx.showToast({
            title: res.body.message || 'mini session error',
            icon: 'none'
          })
        })
      }
    });
  },


  /**
   * @author: wangjing
   * @update: 20201104
   * @func
   * @description: 手机号注册
   * @param {object} e 微信手机授权接口，返回的微信用户信息
   */
  registerPhone: function (data, cb) {
    const _this = this;
    console.log('注册', data);
    http.miniPhoneLogin(data).then(res => {
      console.log("注册");

      _this.changeMinuser(res);

      _this.callBackMinuserChange();

      // 回调函数
      if (cb) {
        cb();
      }

      // 添加分享记录
      if (_this.globalData.globalQuery.userid) {
        _this.userShareAdd();
      }
      wx.hideLoading();
    }).catch(res => {
      wx.showToast({
        title: res.body.message || 'error',
        icon: 'none'
      })
    });
  },

};


// ==========================================
// 点击手机号授权按钮登录
// ==========================================
export const authPhone = {
  /**
   * @author: wangjing
   * @update: 20191121
   * @func
   * @description: 授权认证
   * @param {object} e 微信授权接口，返回的微信手机号信息
   * @param {object} cb 回调函数
   */
  bindGetUserInfo: function (e, cb) {
    const _this = this;
    wx.login({
      success: res => {
        console.log('注册wx.logon', res);
        _this.toLogin(e.detail ? e.detail : e, res.code, cb ? cb : '');
      }
    });
  },

  /**
   * @author: wangjing
   * @update: 20191121
   * @func
   * @description: 1.拒绝授权提示处理；2.确认授权后，根据接口查询用户手机号
   * @param {object} e 微信授权接口，返回的微信手机号及用户信息 e, code, cb
   */
  toLogin: function (e, code, cb) {
    const _this = this;

    //未授权
    if (e.errMsg != "getPhoneNumber:ok") {
      console.log("用户拒绝授权");

      wx.reLaunch({
        url: '/pages/login/login',
      });
    } else {
      //已授权
      _this.showLoading({
        title: '正在登录...',
      });

      http.miniSession({ code }).then(session => {
        let data = {
          wxSessionTicket:session.wxSessionTicket
        };

        _this.phoneLogin({
          data,
          cb,
          e
        });

      }).catch(res => {
        wx.showToast({
          title: res.body.message || 'mini session error',
          icon: 'none'
        })
      });
    }
  },

  /**
   * @author: wangjing
   * @update: 20201104
   * @func
   * @description: 手机号登录
   * @param {object} e 已注册返回用户信息，未注册则注册
   */
  phoneLogin(obj) {
    const _this = this;
    const q = _this.globalData.globalQuery;
    http.miniPhoneLogin(obj.data).then(res => {
      // console.log('miniPhoneLogin=',res);
      wx.hideLoading();

      if (res.token) {
        // 已注册的用户
        _this.changeMinuser(res);
        _this.callBackMinuserChange();

        // 回调函数
        if (obj.cb) {
          obj.cb();
        }

        // 添加分享记录
        if (q.userid && q.userid !== '') {
          _this.userShareAdd();
        }
      } else {
        let registerdata = {
          encryptedData: obj.e.encryptedData,
          iv: obj.e.iv,
          wxSessionTicket: res.wxSessionTicket
        };
        // 未注册的用户,推荐人ID
        console.log('未注册的用户=', wx.getStorageSync('shareid'));
        if (wx.getStorageSync('shareid') && wx.getStorageSync('shareid') !== '') {
          registerdata.parentUserId = wx.getStorageSync('shareid');
        }

        // 注册时绑定的医生拓展信息ID
        if (wx.getStorageSync('expertId') && wx.getStorageSync('expertId') !== '') {
          registerdata.expertId = wx.getStorageSync('expertId');
        }

        _this.registerPhone(registerdata, obj.cb ? obj.cb : '');
      }
    }).catch(res => {
      wx.showToast({
        title: res.body.message || 'error',
        icon: 'none'
      })
    })
  },
};


// ==========================================
// 公共的弹窗
// ==========================================
export const com = {
  // 记录分享者
  userShareAdd: function () {
    // const gquery = this.globalData.globalQuery;
    // let data = {
    //   shareUserId: gquery.userid,
    //   srcId: 0, // 业务ID或标识（用来记录唯一性），如没有业务内容（分享类型为0时），可标识为“index”之类的页面标识
    //   // srcTitle: '' // 业务标题（可空），当分享类型为0时必填，否则不做记录
    //   // type: '' // 分享类型; 0=其它(默认), 1=活动, 2=比赛, 3=任务，4=文章，5=视频
    // };
    // http.shareOpen(data).then(res => { });
  },
  // 回调页面的minuserChange方法
  callBackMinuserChange() {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      if (currentPage.minuserChange) currentPage.minuserChange();

      // 登录弹窗
      if (currentPage.noRegister) currentPage.noRegister();
    }
  },


  /**
   * @author: wangjing
   * @update: 20200714
   * @func
   * @description: 改变minuser值,设置cookie
   */
  changeMinuser(v) {
    wx.setStorageSync('minuser', v);
    wx.setStorageSync('minuser_expiration', new Date().getTime());
  },


  //重写分享方法
  overShare: function () {
    let _this = this;
    let shareObjOld = {};
    //间接实现全局设置分享内容
    wx.onAppRoute(function (res) {
      let pages = getCurrentPages(),
        //获取当前页面的对象
        view = pages[pages.length - 1],
        url,
        data;
        
      if (view) {
        
        data = view.data;
        url = view.route;
        let options = view.options;
        shareObjOld = data.shareObj;
        let minuser = wx.getStorageSync('minuser');
        // console.log(shareObjOld, url)
        // 获取url参数
        let str = '';
        for (let i in options) {
          str = str + "&" + i + "=" + options[i];
        }
        let link = ((shareObjOld && shareObjOld.path) ? shareObjOld.path : url) + '?userid=' + (minuser != '' ? minuser.userId : '') + str;
        // console.log(link,'===========')
        // 获取用户信息
        view.onShareAppMessage = function (e) {
          let shareObj = {};
          
          if (shareObjOld) {
            shareObj.title = shareObjOld.title ? shareObjOld.title : '';
            shareObj.path = link + '&expertId=' + wx.getStorageSync('shareExpertId');
            // shareObj.path = shareObjOld.path + '?userid=' + (minuser != '' ? minuser.userId : '');
            // shareObj.imageUrl = shareObjOld.imageUrl ? shareObjOld.imageUrl : _this.getNetworkImg;('jzxcx-new/wxshare.png');
          } else {
            shareObj =  shareObjOld || {};
            shareObj.path = link + '&expertId=' + wx.getStorageSync('shareExpertId');
          }

          // console.log(shareObj, link);

          var shareMain = {
            title: shareObj && shareObj.title ? shareObj.title : (data.nvabarData.title !== '' ? data.nvabarData.title : '视力问题防控管理平台为您服务'),
            path: (shareObj && shareObj.path) ? shareObj.path : link,    //分享页面地址
            imageUrl: shareObj && shareObj.imageUrl ? shareObj.imageUrl : '',
          };
          console.log(shareMain);
          return shareMain;
        }
      }
    });
  },

  /**
   * @author: wangjing
   * @update: 20200131
   * @func
   * @description: 自定义需要关闭的一句话弹窗
   */
  showLoading: function (obj) {
    let data = {
      title: "加载中",
      // mask: true
    };

    if (obj && obj.title) {
      data.title = obj.title
    }

    if (obj && obj.icon) {
      data.icon = obj.icon
    }

    wx.showLoading(data);
  },

  /**
   * @author: wuyifan
   * @update: 20200131
   * @func
   * @description: 自定义一句话提示弹窗
   */
  toast: function (obj) {
    wx.showToast({
      title: obj.title,
      // mask: true,
      icon: obj.icon || "none",
      duration: obj.time || 2000,
      success: function () {
        if (obj.cb) {
          setTimeout(function () {
            obj.cb();
          }, obj.time || 2000);
        }
      }
    })
  },
}


// ==========================================
// 接口401，手机号自动登录
// ==========================================
/**
   * @author: wangjing
   * @update: 20201104
   * @func
   * @description: 自动登录,在NarBar组件里面调用的,组件里面执行该方法，判断是否需要打开授权弹窗
   * @param {object} cb 回调函数
   */
  export const autoLoginAuth = function (cb) {
    wx.login({
      success: v => {
        console.log(v)
        http.miniSession({ code: v.code }).then(session => {
          http.miniPhoneLogin({
            wxSessionTicket: session.wxSessionTicket
          }).then(res => {

            if (cb) {
              cb(res);
            }
  
            if (res.token) {
              console.log('已注册的用户');
              // 已注册的用户
              com.changeMinuser(res);

              com.callBackMinuserChange();
            } 
  
            // 已完成登录验证,回调函数 minuserChange
            wx.hideLoading();
          }).catch(res => {
            wx.showToast({
              title: res.body.message || 'error',
              icon: 'none'
            })
          });
        }).catch(res => {
          wx.showToast({
            title: res.body.message || 'mini session error',
            icon: 'none'
          })
        })
      }
    });
}