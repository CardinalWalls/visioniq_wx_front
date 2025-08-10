var http = require("http.js");
import VODUpload from './aliyun-upload-sdk-1.0.0.min'

/**
 * 阿里云上传图片
 */
export const upload = (obj) => {
  // obj filePath string
  // obj cb function
  // obj cbFail function
  // multiple boolean false

  let i = obj.i || 0,
    success = obj.success || 0,
    fail = obj.fail || 0;
  wx.showLoading({
    title: obj.title ? obj.title : '正在上传图片',
  });
  // 接口调用
  http.ossTokenUploading({
    isPrivate: false,
    keepSrcFileName: false,
  }).then(v => {
    // console.log('v=', v, obj.filePath);
    const d = v;

    wx.uploadFile({
      url: d.action,
      name: 'file',
      filePath: obj.multiple ? obj.filePath[i] : obj.filePath, //要上传文件资源的路径
      formData: {
        key: d.key,
        policy: d.policy,
        OSSAccessKeyId: d.OSSAccessKeyId,
        success_action_status: '200',
        signature: d.signature,
        callback: d.callback
      },
      success: function (res) {
        success++;
        console.log('上传成功' + success + '个');
        i++;

        if (res.statusCode === 200 && obj.cb) {
          const d = JSON.parse(res.data);
          obj.cb(d);
        }
      },
      fail: function (res) {
        fail++;
        wx.showToast({
          title: '上传失败' + fail,
          icon: 'none'
        })

        if (obj.cbFail) obj.cbFail();
      },
      complete: function (res) {
        if (res.statusCode === 200 && obj.multiple) {
          if (i === obj.filePath.length) {
            wx.hideLoading();
          } else if (obj.multiple) {
            wx.showLoading({
              title: '已成功上传' + success + '个',
              icon: 'none'
            })
            let d = obj;
            d.i = i;
            d.success = success;
            d.fail = fail;
            upload(d);
          }
        } else {
          wx.hideLoading();
        }

      }
    });
  }).catch(res => {
    console.log('error=', res);
  });

};


/**
 * 阿里云上传文件
 */
export const uploadFile = (obj) => {
  // obj filePath string
  // obj cb function
  // obj cbFail function
  // multiple boolean false
  // console.log('obj=', obj);
  // 接口调用
  let ossobj = {
    isPrivate: false,
    keepSrcFileName: obj.keepSrcFileName == false ? false : true, // 是否保留原文件名; 默认true,示例值(true)
  };
  if (obj.fileName) {
    ossobj.fileName = obj.fileName;
  }
  console.log('ossobj=', ossobj);
  http.ossTokenUploading(ossobj).then(v => {
    console.log('v=', v);
    const d = v;

    var UploadTask = wx.uploadFile({
      url: d.action,
      name: 'file',
      filePath: obj.multiple ? obj.filePath[i].path : obj.filePath.path, //要上传文件资源的路径
      formData: {
        key: d.key,
        policy: d.policy,
        OSSAccessKeyId: d.OSSAccessKeyId,
        success_action_status: '200',
        signature: d.signature,
        callback: d.callback
      },
      success: function (res) {
        if (res.statusCode === 200 && obj.cb) {
          const d = JSON.parse(res.data);
          obj.cb(d);
        }
      },
      fail: function (res) {
        if (obj.cbFail) obj.cbFail(res);
      },
      complete: function (res) { }
    });


    UploadTask.onProgressUpdate(obj.progress(res));

  }).catch(res => {

  });

};


// 阿里云上传视频
export const uploadVideo = (obj) => {
  http.ossVodConfig().then(res => {
    console.log(res);
    let config = res;
    var uploader = new VODUpload({
      //阿里账号ID，必须有值
      userId: config.userId,
      //上传到点播的地域，默认值为'cn-shanghai'，//eu-central-1，ap-southeast-1
      region: config.region,
      //网络原因失败时，重新上传次数，默认为3
      retryCount: 3,
      //网络原因失败时，重新上传间隔时间，默认为2秒
      retryDuration: 2,
      //开始上传
      'onUploadstarted': function (uploadInfo) {
        console.log('开始上传方法')
        console.log(uploadInfo)
        if (uploadInfo.videoId) {
          http.uploadAuthrefresh({
            url: '/oss/vod/upload/auth/refresh',
            data: {
              videoId: uploadInfo.videoId,
            },
          })
        } else {
          let fileName = uploadInfo.url.split('://')[1];
          console.log(fileName);
          http.uploadAuth({
            fileName
          }).then(v => {
            console.log('获取上传权限')
            console.log(v);
            uploader.setUploadAuthAndAddress(uploadInfo, v.uploadAuth, v.uploadAddress, v.videoId);
          })
          // app.request({
          //   url: '/oss/vod/upload/auth?fileName=' + fileName,
          //   success: (v) => {
          //     console.log('获取上传权限')
          //     console.log(v);
          //     uploader.setUploadAuthAndAddress(uploadInfo, v.uploadAuth, v.uploadAddress, v.videoId);
          //   },
          // })
        }
      },
      //文件上传成功
      'onUploadSucceed': function (uploadInfo) {
        console.log('文件上传成功!')
        if (obj.success) {
          return obj.success(uploadInfo.videoId)
        }
      },
      //文件上传失败
      'onUploadFailed': function (uploadInfo, code, message) { },
      //文件上传进度，单位：字节
      'onUploadProgress': function (uploadInfo, totalSize, loadedPercent) {
        if (obj.progress) {
          return obj.progress(loadedPercent)
        }
      },
      //上传凭证超时
      'onUploadTokenExpired': function (uploadInfo) { },
      //全部文件上传结束
      'onUploadEnd': function (uploadInfo) { }
    });
    if (obj.cb) {
      return obj.cb(uploader)
    }
  })

};