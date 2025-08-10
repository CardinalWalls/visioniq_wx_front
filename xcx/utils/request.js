var config = require("config.js");
var appx = require("appx.js");
/**
 * @author: wangjing
 * @update: 20191121
 * @func
 * @description: 网络请求封装
 * @param {object} obj
 * @param {String} obj.url 接口名称
 * @param {String} obj.method 接口请求方式
 * @param {String} obj.dataType 数据类型
 * @param {object} obj.data [j] 接口请求参数
 * @param {object} obj.success 接口执行成功的回调函数
 * @param {object} obj.fail 接口执行失败的回调函数
 */

let authCount = 0;
export const request = (obj) => {
  const minuser = wx.getStorageSync('minuser');
  let header = {
    'AUTH-APPID': config.APPID
  }

  if (minuser && minuser.token) {
    header[minuser.tokenKey] = minuser.token;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.BASEURL + "/api" + obj.url,
      method: obj.method || 'GET',
      data: obj.data || {},
      header: header,
      success: function (response) {
        let res = {
          status: response.statusCode,
          statusText: response.errMsg,
          body: response.data
        };

        const v = res.body;
        if (res.status == 401) {
          wx.hideLoading();
          wx.removeStorageSync('minuser');
          if (authCount == 0) {
            wx.showToast({
              title: "登录失效",
              icon: 'none'
            });
            wx.reLaunch({
              url: '/pages/login/login',
            });
            // appx.autoLoginAuth();
          }
          authCount++;
          reject(res);
          return;

        } else if (res.status == 502) {
          wx.hideLoading();
          wx.removeStorageSync('minuser');
          if (authCount == 0) {
            wx.showToast({
              title: "系统正在更新，稍后再试",
              icon: 'none'
            });
            wx.reLaunch({
              url: '/pages/login/login',
            });
          }
          authCount++;
          reject(res);
          return;
        } else if (res.status == 400 || res.status == 500 || res.status == 403) {
          // wx.showToast({
          //   title: v.message
          // });

          if (obj.fail) obj.fail(res);
          wx.hideLoading();
          reject(res);
          return;
        } else if (obj.success) obj.success(v);
        authCount = 0;
        resolve(v);
      },
      fail: function (err) {
        console.log(err)
        wx.hideLoading();
        reject({
          status: 0,
          statusText: '',
          errcode: -1,
          errmsg: `${err.errMsg}`
        });
        return;
      },
      complete: function () {
        if (obj.complete) obj.complete();
      },
    });
  });
}