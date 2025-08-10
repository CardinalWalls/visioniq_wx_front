// pages/News/Detail/Detail.js
const app = getApp();
const appg = app.globalData;
var WxParse = require('../../../components/wxParse/wxParse.js');
const util = require('../../../utils/util.js');
const config = require('../../../utils/config.js');
const http = require('../../../utils/http.js');
var HtmlToJson = require('../../../components/wxParse/html2json.js');

let _this = this;
let opts = {};
let qrcode;

// 海报生成数据
import Poster from '../../../components/poster/poster';
const posterConfig = {
  jdConfig: {
    width: 750,
    height: 1334,
    backgroundColor: '#fff',
    debug: false,
    pixelRatio: 2,
    blocks: [],
    texts: [],
    images: [],
    lines: []
  }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      title: "文章详情"
    },
    d: '',

    // 朋友圈海报
    posterVisible: false,
    posterConfig: posterConfig.jdConfig,

    minuser: '',

    shareObj: {
      title: ''
    }
  },

  // 关闭海报弹窗
  closeCommon(e) {
    _this.setData({
      posterVisible: false
    });
  },
  /**
   * 获取分享小程序码
   */
  getWxcode() {
    // _this.onCreatePoster();
    let { minuser, d } = _this.data;
    let obj = opts;
    obj.appId= config.APPID;

    if (util.isMinuser()) {
      obj.userid = minuser.userId;
      obj.expertId = wx.getStorageSync('shareExpertId');
    }
    http.postParamMd5({
      paramJson: JSON.stringify(obj)
    }).then(res => {
      http.getwxacodeunlimit({
        qrcode_name: 'detail_id_'+ d.id,
        scene: res,
        page: 'pages/news/detail/detail',
        width: 280
      }).then(v => {
        if (d.img === '') {
          _this.onCreatePoster(v);
        } else {
          wx.downloadFile({
            url: util.requestImgUrl(d.img),
            success: function (res) {
              if (res.statusCode === 200) {
                wx.getImageInfo({
                  src: res.tempFilePath,
                  success: function(res) {
                    _this.setData({
                      pyqImg: res
                    });
                    _this.onCreatePoster(v);
                  },
                  fail: function() {
                    _this.onCreatePoster(v);
                  }
                });
              } else {
                _this.onCreatePoster(v);
              }
            },
            fail: function() {
              _this.onCreatePoster(v);
            }
          })
        }
        
       
      });

    }).catch(res => {
      app.toast({
        title: res.body.message || '小程序码生成失败'
      });
    });
  },

  /**
   * 异步生成海报
   */
  onCreatePoster(v) {
    const { d, pyqImg } = _this.data;
    
    let db = 1, bigImgh = 0, imgs = [], texts = [];
    if (pyqImg) {
      // 分享图片
      db = 750/pyqImg.width;
      bigImgh = pyqImg.height*db;
      imgs[0] = {
        width: 750,
        height: bigImgh,
        x: 0,
        y: 0,
        url: util.requestImgUrl(d.img),
        zIndex: 3
      };
    }

    // 标题
    let maxCount = parseInt(710/30), title = d.title, arr = [];
    for (let i = 0; i < title.length; i+=maxCount) {
      arr.push(title.substr(i, maxCount));
    }
    // console.log(arr)
    texts[0] = {
      x: 20,
      y: bigImgh + 50,
      width: 710*2,
      height: 36*(arr.length),
      // text: d.title,
      text: arr.join('\n').replace(/\\n/g, '\n'),
      fontSize: 30,
      color: '#000',
      zIndex: 3,
      textAlign: 'left',
      fontWeight: 'bold',
      lineHeight: 36
    }

    imgs.push({
      width: 170,
      height: 170,
      x: (750 / 2) - 85,
      y: texts[0].y + texts[0].height,
      url: util.requestImgUrl(v),
      zIndex: 10
    })
    
    const imgLeng = imgs.length;
    texts.push({
      x: 375,
      y: imgs[imgLeng-1].y + imgs[imgLeng-1].height + 40,
      // text: banner[0].remark ? (banner[0].remark).replace(/\\n/g, '\n') :'长按识别小程序码',
      text: '长按识别小程序码',
      fontSize: 26,
      color: '#ccc',
      zIndex: 3,
      textAlign: 'center',
      lineHeight: 36
    })
    posterConfig.jdConfig.images = imgs;
    posterConfig.jdConfig.texts = texts;
    posterConfig.jdConfig.lines = [];

    posterConfig.jdConfig.height = texts[1].y + 70;

    console.log(posterConfig.jdConfig);
    _this.setData({
      posterConfig: posterConfig.jdConfig
    });
    Poster.create(true); // 入参：true为抹掉重新生成
  },


  /**
   * 海报生成成功
   */
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    // console.log(e);
    _this.setData({
      posterVisible: true,
      previewImg: detail
    });
  },

  /**
   * 海报生成失败
   */
  onPosterFail(err) {
    console.error(err);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this = this;

    _this.setData({
      navClass: appg.navClass
    });

    if (options.scene) {
      http.getParamMd5(options.scene).then(res => {
        opts = res;
        _this.minuserChange();
      }).catch(res => {
        app.toast({
          title: res.body.message
        });
      })
    } else {
      opts = options;
      _this.minuserChange();
    }
    
  },

  /**
   * 授权登录后初始化
   */
  minuserChange: function () {
    _this.setData({
      minuser: wx.getStorageSync('minuser')
    });
    // console.log(wx.getStorageSync('minuser'))
    if (opts.id) {
      http.newsAdd(opts.id).then(res => {
        let {shareObj} = _this.data;
        shareObj.title = res.title;
        if (res.img !== '') {
          shareObj.imageUrl = util.requestImgUrl(res.img);
        }
        
        _this.setData({
          d: res,
          shareObj
        });

       if (res.content.indexOf('/api/oss/vod/play.html') !== -1) {
           // 视频解析
          let transData = HtmlToJson.html2json(res.content, 'article');
          for (let i = 0; i < transData.nodes.length; i++) {
            let pnode = transData.nodes[i];

            for (let k = 0; k < pnode.nodes.length; k++) {
              let node = pnode.nodes[k];
              if (node.tag === 'iframe' && node.attr.src && node.attr.src.indexOf('/api/oss/vod/play.html') !== -1) {
                const v = node.attr.src.split('id=');
                http.playSource({ videoId: v[1] }).then(res => {
                  node.attr.src = res.source;
                  node.tag = 'video';
                  pnode.nodes[k] = node;

                  transData.nodes[i] = pnode;

                  WxParse.wxParse('article', 'htmlTrans', transData, _this, 10);
                })
              }

            }
          }
        } else {
          WxParse.wxParse('article', 'html', res.content, _this, 10);
        }
      }).catch(res => {
        app.toast({
          title: res.body.message || '不存在'
        })
      })
    }
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})