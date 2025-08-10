/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

/**
 * utils函数引入
 **/
import showdown from './showdown.js';
import HtmlToJson from './html2json.js';
/**
 * 配置及公有属性
 **/
var realWindowWidth = 0;
var realWindowHeight = 0;
wx.getSystemInfo({
  success: function (res) {
    realWindowWidth = res.windowWidth
    realWindowHeight = res.windowHeight
  }
})
/**
 * 主函数入口区
 **/
function wxParse(bindName = 'wxParseData', type = 'html', data = '<div class="color:red;">数据不能为空</div>', target, imagePadding) {
  var that = target;
  var transData = {};//存放转化后的数据
  if (type == 'html') {
    transData = HtmlToJson.html2json(data, bindName);
    // console.log(JSON.stringify(transData, ' ', ' '));
  } else if (type == 'htmlTrans') {
    transData = data;
    console.log(data)
  } else if (type == 'md' || type == 'markdown') {
    var converter = new showdown.Converter();
    var html = converter.makeHtml(data);
    transData = HtmlToJson.html2json(html, bindName);
    // console.log(JSON.stringify(transData, ' ', ' '));
  }
  transData.view = {};
  transData.view.imagePadding = 0;
  if (typeof (imagePadding) != 'undefined') {
    transData.view.imagePadding = imagePadding
  }
  // console.log(transData);
  var bindData = {};
  bindData[bindName] = transData;
  that.setData(bindData)
  that.wxParseImgLoad = wxParseImgLoad;
  that.wxParseImgTap = wxParseImgTap;
  that.wxParseTagATap = wxParseTagATap;

  if (that.wxParseDataCallbak) {
    that.wxParseDataCallbak(transData);
  }
}

function getSuffix(suffix) {
  let b = false;
  if (suffix === 'png' || suffix === 'jpg' || suffix === 'gif' || suffix === 'pdf' || suffix === 'doc' || suffix === 'docx' || suffix === 'mp4' || suffix === 'zip' || suffix === 'rar') {
    b = true
  }

  return b;
}

// 文章有A标签跳转页面
function wxParseTagATap(e) {
  let src = e.currentTarget.dataset.src;
  // console.log(src, src.indexOf('http'));
  // 下载文件需要用的
  var index = src.lastIndexOf(".");
  var suffix = (src.substr(index + 1)).toLocaleLowerCase();

  if (src.indexOf('http') != - 1 && getSuffix(suffix)) {
    if (suffix === 'png' || suffix === 'jpg' || suffix === 'gif') {
      wx.previewImage({
        urls: [src], // 需要预览的图片链接列表
        current: src // 当前显示图片的链接
      });
    } else if (suffix === 'mp4') {
      wx.previewMedia({
        sources: [src], // 需要预览的资源列表
        current: 0 // 当前显示的资源序号
      });
    } else {
      wx.showLoading({
        title: '正在下载',
        mask: true,
      });
      let fileName = new Date().valueOf();
      const downloadTask = wx.downloadFile({
        url: src,
        filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.' + suffix,
        success: res => {
          console.log(res);
          let filePath = res.filePath;
          if (suffix === 'pdf' || suffix === 'doc' || suffix === 'docx') {
            wx.openDocument({
              showMenu: true,
              filePath: filePath,
              success: function (res) {
                console.log('打开文档成功')
              }
            });
          } else if (suffix === 'zip' || suffix === 'rar') {
            wx.saveFile({
              tempFilePath: filePath,
              success: function () {
                wx.showToast({
                  title: "保存成功",
                  mask: true,
                });
              }
            });
          }

        }
      });
      // 监听视频下载进度
      downloadTask.onProgressUpdate((res) => {
        if (res.progress === 100) {
          wx.hideLoading();
          // wx.showToast({
          //   title: "下载成功",
          //   mask: true,
          // });
        }
        // console.log('下载进度', res.progress)
        // console.log('已经下载的数据长度', res.totalBytesWritten)
        // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
      });
    }

    return;


  } else if (src.indexOf('http') != - 1) {
    wx.navigateTo({
      url: '/pages/WebView/WebView?url=' + src,
    })
    return;
  } else {
    src = src.split(':');
    if (src[0] == 'mini') {
      wx.navigateTo({
        url: src[1],
      })
      return;
    } else if (src[0] == 'tel') {
      wx.makePhoneCall({
        phoneNumber: src[1],
      });
      return;
    }
  }
}

// 图片点击事件
function wxParseImgTap(e) {

  if (e.currentTarget.dataset.phon) {
    let pan = e.currentTarget.dataset.phon.substring(0, 5);
    if (pan == "https") {
      let str = e.currentTarget.dataset.phon.split('?');
      let strs = str[1];
      let strc = strs.split('=');
      wx.navigateTo({
        url: '../webproduct/webproduct?id=' + strc[1]
      })
    } else {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phon,
      })
    }
    return;
  }
  var that = this;
  var nowImgUrl = e.target.dataset.src;
  var tagFrom = e.target.dataset.from;
  // 处理添加跳转的数据
  let delimg = [];
  let tagfro = that.data[tagFrom].images;
  for (let i = 0; i < tagfro.length; i++) {
    if (tagfro[i].attr.program) {
      delimg.push(0)
    } else {
      delimg.push(1)
    }
  }
  // 删除
  let urls = that.data[tagFrom].imageUrls;
  let imageUrls = [];
  for (let i = 0; i < urls.length; i++) {
    if (delimg[i] != 0) {
      imageUrls.push(urls[i]);
    }
  }
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    wx.previewImage({
      current: nowImgUrl, // 当前显示图片的http链接
      urls: imageUrls // 需要预览的图片http链接列表
    })
  }
}
// 地图导航
function getLoc(e) {
  let info = e;
  wx.showLoading({
    title: '加载中',
  })
  wx.getLocation({
    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
    success: function (res) {
      //使用微信内置地图查看位置接口
      wx.openLocation({
        latitude: parseFloat(e.latitude),  // 要去的地址经度，浮点数
        longitude: parseFloat(e.longitude),  // 要去的地址纬度，浮点数
        name: '重庆医科大学附属第二医院',  // 位置名
        address: e.location,  // 要去的地址详情说明
        scale: 14,   // 地图缩放级别,整形值,范围从1~28。默认为最大
        infoUrl: 'http://www.gongjuji.net'  // 在查看位置界面底部显示的超链接,可点击跳转（测试好像不可用）
      });
      wx.hideLoading()
    },
    fail: function (res) {
      wx.hideLoading()
      authoriz(info);
    }
  })
}
// 发起授权
function authoriz(e) {
  let info = e;
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userLocation']) {
        wx.showModal({
          title: '提示',
          content: '使用该功能需要获取你当前位置',
          success: function (res) {
            if (res.confirm == false) {
              return false;
            }
            wx.openSetting({
              success(res) {
                //如果再次拒绝则返回页面并提示
                if (!res.authSetting['scope.userLocation']) {
                  wx.showToast({
                    title: '此功能需获取位置信息，请重新设置',
                    duration: 3000,
                    icon: 'none'
                  })
                } else {
                  getLoc(info);
                }
              }
            })
          }
        })
      } else {
        getLoc(info);
      }
    }
  });
}

/**
 * 图片视觉宽高计算函数区
 **/
function wxParseImgLoad(e) {
  var that = this;
  var tagFrom = e.target.dataset.from;
  var idx = e.target.dataset.idx;
  if (typeof (tagFrom) != 'undefined' && tagFrom.length > 0) {
    calMoreImageInfo(e, idx, that, tagFrom)
  }
}
// 假循环获取计算图片视觉最佳宽高
function calMoreImageInfo(e, idx, that, bindName) {
  
  var temData = that.data[bindName];
  if (!temData || temData.images.length == 0) {
    return;
  }
  var temImages = temData.images;
  //因为无法获取view宽度 需要自定义padding进行计算，稍后处理
  var recal = wxAutoImageCal(e.detail.width, e.detail.height, that, bindName);
  // temImages[idx].width = recal.imageWidth;
  // temImages[idx].height = recal.imageheight;
  // temData.images = temImages;
  // var bindData = {};
  // bindData[bindName] = temData;
  // that.setData(bindData);
  var index = temImages[idx].index
  var key = `${bindName}`
  for (var i of index.split('.')) key += `.nodes[${i}]`
  var keyW = key + '.width'
  var keyH = key + '.height'
  that.setData({
    [keyW]: recal.imageWidth,
    [keyH]: recal.imageheight,
  });


  // 商品详情获取内容容器高度
  if (that.wxParseImgCallbak) {
    that.wxParseImgCallbak();
  }
}

// 计算视觉优先的图片宽高
function wxAutoImageCal(originalWidth, originalHeight, that, bindName) {
  //获取图片的原始长宽
  var windowWidth = 0, windowHeight = 0;
  var autoWidth = 0, autoHeight = 0;
  var results = {};
  var padding = that.data[bindName].view.imagePadding;
  windowWidth = realWindowWidth - 2 * padding;
  windowHeight = realWindowHeight;
  //判断按照那种方式进行缩放
  // console.log("windowWidth" + windowWidth);
  if (originalWidth > windowWidth) {//在图片width大于手机屏幕width时候
    autoWidth = windowWidth;
    // console.log("autoWidth" + autoWidth);
    autoHeight = (autoWidth * originalHeight) / originalWidth;
    // console.log("autoHeight" + autoHeight);
    results.imageWidth = autoWidth;
    results.imageheight = autoHeight;
  } else {//否则展示原来的数据

    results.imageWidth = originalWidth;
    results.imageheight = originalHeight;
  }
  return results;
}

function wxParseTemArray(temArrayName, bindNameReg, total, that) {
  var array = [];
  var temData = that.data;
  var obj = null;
  for (var i = 0; i < total; i++) {
    var simArr = temData[bindNameReg + i].nodes;
    array.push(simArr);
  }

  temArrayName = temArrayName || 'wxParseTemArray';
  obj = JSON.parse('{"' + temArrayName + '":""}');
  obj[temArrayName] = array;
  that.setData(obj);
}

/**
 * 配置emojis
 *
 */

function emojisInit(reg = '', baseSrc = "/wxParse/emojis/", emojis) {
  HtmlToJson.emojisInit(reg, baseSrc, emojis);
}

module.exports = {
  wxParse: wxParse,
  wxParseTemArray: wxParseTemArray,
  emojisInit: emojisInit
}
