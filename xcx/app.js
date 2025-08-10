//app.js
var appx = require("utils/appx.js");
App(Object.assign({
  onLaunch: function (options) {
    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
    //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
    //虽然最后解决了，但是花费了不少时间
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.getSystemInfo = res;

        let _this = this;
        let iphoneArr = ['iPhone X', 'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14']
        iphoneArr.forEach(function (item) {
          if (res.model.indexOf(item) > -1) {
            _this.globalData.navClass = "iPhoneX";
          }
        })
        if (res.platform == 'windows' || res.platform == 'max') {
            this.globalData.isPc = true
        }
        this.globalData.navheight = res.statusBarHeight + 44;
        this.globalData.navpd = res.statusBarHeight;
      }
    });


    // 更新机制
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log('请求完新版本信息的回调');
      // console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否马上重启小程序？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            // 清楚所有缓存
            wx.removeStorageSync('minuser');
            updateManager.applyUpdate();
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '已经有新版本喽~',
        content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
      })
    });


    // 分享
    this.overShare();
    // wx.removeStorageSync('userEnterAlert');

    // 移除 历史眼轴发展指数、远视储备数据
    wx.removeStorageSync('storageHistory');

    // 移除 近视度数预测缓存数据
    wx.removeStorageSync('storageVision');

    // 移除 区间测速缓存数据
    wx.removeStorageSync('storageSpeed');
    
    // 自动登录
    // console.log(options, options.query.userid);
    console.log('shareid=', wx.getStorageSync('shareid'));
    this.globalData.appOptions = options;

    this.showLoad(options);
  },

  // 小程序异常监控收集
  onError: function (err) {
    let v = wx.getSystemInfoSync();
    if (v.version) {
      try {
        const pages = getCurrentPages() //获取加载的页面
        const currentPage = pages[pages.length - 1] //获取当前页面的对象
        const url = currentPage.route //当前页面url

        http.errorSys({
          eventType: 2,
          remark: JSON.stringify(err),
          pagePath: url + '?v=' + v.version,
        }).then(res => { });
      } catch (err) {

      }
    }
  },

  onShow(options) {
    console.log("onShow");
    // console.log(options, options.query.userid);
    // console.log('shareid=', wx.getStorageSync('shareid'));
    // this.globalData.appOptions = options;

    // this.showLoad(options);
  },

  onHide() {
    console.log("onHide ");
  },

  globalData: {
    // 进入小程序时携带参数及场景值
    appOptions: {},
    // 手机系统详情信息
    getSystemInfo: {},
    // 页面出入的参数
    globalQuery: {},
    // 设备导航栏高度
    navheight: 60,
    // 是否为pc
    isPc: false
    
  },
}, appx.phoneAutoLogin, appx.authPhone, appx.com, appx.appShow))