// pages/clipperImg/clipperImg.js
const app = getApp();
const appg = app.globalData;
const util = require('../../utils/util.js');
const upload = require('../../utils/upload.js');
import WeCropper from '../../components/weCropper/weCropper.min.js';
const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = device.windowHeight;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "裁剪",
      prev: false,
      type: 2,
    },
    cropperOpt: {
      id: 'cropper', // 用于手势操作的canvas组件标识符
      targetId: 'targetCropper', // 用于用于生成截图的canvas组件标识符
      pixelRatio: device.pixelRatio, // 传入设备像素比
      width,  // 画布宽度
      height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - (width - 100)) / 2,
        y: (width - 200) / 2,
        width: width - 100, // 裁剪框宽度
        height: width - 100 // 裁剪框高度
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    const { cropperOpt } = this.data
    this.cropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast()
      })
    var src = options.src;
    self.cropper.pushOrign(src)
  },
  uploadTap() {
    const self = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0];
        self.cropper.pushOrign(src)
      }
    })
  },
  // 插件通过touchStart、touchMove、touchEnd方法来接收事件对象。
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  // 生成图片
  getCropperImage() {
    this.cropper.getCropperImage(tempFilePath => {
      // tempFilePath 为裁剪后的图片临时路径
      if (tempFilePath) {
        // 拿到裁剪后的图片路径的操作
        upload.upload({
          filePath: tempFilePath,
          cb: function (d) {
            var pages = getCurrentPages();   //当前页面
            var prevPage = pages[pages.length - 2];   //上一页面
            prevPage.setData({
              //直接给上一个页面赋值
              src: d.fileUri,
            });
            wx.navigateBack({
              //返回
              delta: 1
            })
          }
        })
      } else {
        app.toast('获取图片地址失败，请稍后重试')
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      navheight: appg.navheight,
      navClass: appg.navClass,
      minuser: appg.minuser
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})