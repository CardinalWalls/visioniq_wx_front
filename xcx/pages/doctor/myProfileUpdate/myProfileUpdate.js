// pages/users/personal/personal.js
const uploads = require('../../../utils/upload.js');
const util = require('../../../utils/util.js');
const http = require('../../../utils/http.js');
const app = getApp();
const appg = app.globalData;
var _this = "", opts = {}, isClick = false;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: '编辑资料'
    },

    // 性别
    gender: [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ],

    // 地区
    regionObj: {}
  },

  // 下拉选择
  pickerChange(e) {
    const { type } = e.currentTarget.dataset;
    const { value } = e.detail;
    let { user, gender } = _this.data;
    if (type == 'gender') {
      user[type] = gender[value].value
    } else {
      user[type] = value;
    }
    _this.setData({ user })

  },


  /**
   * 地址
   */
  _getAddress: function (e) {
    let { regionObj, user } = _this.data;
    const v = e.detail;
    regionObj.names = v.selectRegion.join('-');
    user.regionId = v.selectRegionId[2];

    _this.setData({
      user,
      regionObj
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;
    opts = options;

    _this.minuserChange();

  },

  /**
   * 授权登录后初始化-刷新用户信息(获取手机号授权-刷新用户信息)
   */
  minuserChange: function () {
    _this.setData({
      minuser: wx.getStorageSync('minuser'),
    });

    if (!util.isMinuser()) return

    _this.getData();
  },



  // 昵称输入事件
  changeInput(e) {
    const { value } = e.detail;
    const { name } = e.target.dataset;
    let { user } = _this.data;
    user[name] = value;
    _this.setData({
      user
    });
  },

  // 更换头像
  changeImg() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0];
        wx.navigateTo({
          url: '/pages/clipperImg/clipperImg?src=' + src,
        })
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
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    if (currPage.data.src) {
      var { user } = _this.data;
      user.avatar = currPage.data.src;
      _this.setData({
        user: user
      });
      _this.saveInfo();
    }

  },

  /**
   * 数据初始化
   */
  getData() {
    http.expertInfo().then(v => {
      let user = {}, regionObj = {};
      user.avatar = v.avatar;
      user.name = v.name;
      user.regionId = v.regionId;
      user.gender = v.gender;
      user.title = v.title;
      user.jobPosition = v.jobPosition;
      user.hospital = v.hospital;
      user.department = v.department;
      user.level = v.level;
      user.profile = v.profile;

      regionObj.names = v.regionName;

      _this.setData({
        regionObj,
        info: v,
        user
      })
    })
  },

  // 保存信息
  saveInfo() {
    if (isClick) return

    isClick = true;
    http.expertInfoUpdate(_this.data.user).then(res => {
      isClick = false
      app.toast({
        title: "保存成功",
        icon: 'success',
        time: 1000,
        cb: function () {
          wx.navigateBack()
        }
      });

    }).catch(res => {
      isClick = false
      app.toast({
        title: res.body.message
      })
    })
  },

  // 预览图片
  previewImg(e) {
    let index = e.target.dataset.index;
    let { user } = this.data;

    let urls = [], photos = JSON.parse(user.reportArray);
    photos.forEach((item) => {
      urls.push(util.requestImgUrl(item.url))
    })
    wx.previewImage({
      current: util.requestImgUrl(photos[index].url),
      urls
    })
  },
  // 删除图片
  deleteImg(e) {
    let { user } = _this.data;
    let index = e.target.dataset.index;
    let photos = JSON.parse(user.reportArray);
    photos.splice(index, 1);

    user.reportArray = JSON.stringify(photos)
    _this.setData({ user })
  },
  // 上传图片
  uploadImg(e) {
    let { user } = _this.data;
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
            let photos = JSON.parse(user.reportArray);
            photos.push({
              name: d.fileName,
              url: d.fileUri
            });
            user.reportArray = JSON.stringify(photos)
            _this.setData({ user })
          }
        });
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    _this.minuserChange();
    wx.stopPullDownRefresh();
  },

})