// components/chatWindow/chatWindow.js
// pages/chatWindow/chatWindow.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');

let _this = null,
  opts = {};


// all 数组转换的对象集合， timer 轮询的方法， oldFirstScrollIntoView 加载分页前的第一条数据; 
let all = {},
  timer = null,
  timerSeconds = 3000,
  oldFirstScrollIntoView = '';

// createTimeMinMax 保存时间的最大值和最小值
let createTimeMinMax = {
  earlyTime: '',
  lastTime: ''
};
Component({
  options: {
    multipleSlots: true,
    // 在组件定义时的选项中启用多slot支持
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 容器高度
    boxH: {
      type: Number,
      value: 420
    },
    // 页面参数
    opts: {
      type: Object,
      value: {}
    },
    // 表单是否悬浮fixed
    btnIsFixed: {
      type: Boolean,
      value: true
    },
    // 档案信息
    archive: {
      type: Object,
      value: {}
    },
  },
  observers: {
    'opts': function (newVal, oldVal) {
      opts = newVal;
    },
    'archive': function (newVal, oldVal) {
      // console.log(newVal, oldVal)
      if (newVal.id && util.isMinuser()) {
        // 在组件实例被从页面节点树移除时执行
        if (timer) clearInterval(timer)


        // all 数组转换的对象集合， timer 轮询的方法， 
        all = {}, timer = null, timerSeconds = 6000, oldFirstScrollIntoView = '';

        // createTimeMinMax 保存时间的最大值和最小值
        createTimeMinMax = {
          earlyTime: '',
          lastTime: ''
        };

        this.setData({
          d: null,
          loading: true,
          datas: {
            pageNum: 1,
            pageSize: 10,
            sortType: 'DESC' // ASC
          },

          // 实名认证
          dialogShow: false,

          // 发送消息
          send: {
            groupId: '',
            content: ''
          },
          // scroll
          // 设置竖向滚动条位置
          scrollTop: 0,
          // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
          refresherTriggered: false,
          // 在设置滚动条位置时使用动画过渡
          scrollWithAnimation: true
        })

        // 文本框缓存
        let chartCon = wx.getStorageSync('chartCon') || {};
        // console.log(chartCon,'=========')
        if (chartCon[newVal.id]) {
          let { send } = this.data;
          send.content = chartCon[newVal.id];
          this.setData({
            send
          })
        }

        // 数据初始化
        this.getDataAll();
      }
    },
    // 'numberA, numberB': function(numberA, numberB) {
    //   // 在 numberA 或者 numberB 被设置时，执行这个函数
    //   this.setData({
    //     sum: numberA + numberB
    //   })
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
    systemAvatar: util.getNetworkImg('customer-service.png'),
    loading: true,
    datas: {
      pageNum: 1,
      pageSize: 10,
      sortType: 'DESC' // ASC
    },

    // 实名认证
    dialogShow: false,

    // 发送消息
    send: {
      groupId: '',
      content: ''
    },
    // scroll
    // 设置竖向滚动条位置
    scrollTop: 0,
    // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    refresherTriggered: false,
    // 在设置滚动条位置时使用动画过渡
    scrollWithAnimation: true,

    // 输入框是否已聚焦
    isFocus: false
  },
  ready() {
    http.dictionaryList({
      dictCode: 'scheme'
    }).then(list => {
      let obj = {}
      for(let i =0; i <list.length;i++) {
        let cur = list[i];
        obj[cur.dataValue] = cur
      }
      this.setData({
        typeArr: obj
      })
    });
  },
  lifetimes: {
    attached: function () {
        console.log('attached 111')
      // 在组件实例进入页面节点树时执行
      _this = this;
      if (timer) clearInterval(timer)


      // all 数组转换的对象集合， timer 轮询的方法， 
      all = {}, timer = null, timerSeconds = 6000, oldFirstScrollIntoView = '';

      // createTimeMinMax 保存时间的最大值和最小值
      createTimeMinMax = {
        earlyTime: '',
        lastTime: ''
      };
      _this.setData({
        d: null
      })
    },
    detached: function () {
      console.log('detached 111')
      // 在组件实例被从页面节点树移除时执行
      if (timer) clearInterval(timer)


      // all 数组转换的对象集合， timer 轮询的方法， 
      all = {}, timer = null, timerSeconds = 6000, oldFirstScrollIntoView = '';

      // createTimeMinMax 保存时间的最大值和最小值
      createTimeMinMax = {
        earlyTime: '',
        lastTime: ''
      };
      _this.setData({
        d: null
      })
    },
  },
  pageLifetimes: {
    show: function () {
      console.log('show 111')
      if (util.isMinuser()) {
        // 数据初始化
        this.getDataAll();
      }
    },
    hide: function () {
      console.log('hide 2222')
      // 页面被隐藏
      if (timer) clearInterval(timer)
    },
    unload: function() {
        console.log('Unload 2222')
        if (timer) clearInterval(timer)
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindfocus() {
      _this.setData({
        isFocus: true
      })
    },
    bindblur() {
      _this.setData({
        isFocus: false
      })
    },
    // 发送
    sendTap() {
      let {
        send,
        chat,
        d,
        archive
      } = _this.data
      if (send.content === '') {
        app.toast({
          title: "发送内容不能为空",
        });
        return
      }

      http.chatSend({
        groupId: chat.groupId,
        content: send.content
      }).then(res => {
        if (JSON.stringify(res) === '{}') {
          app.toast({
            title: '发送失败'
          });
        } else {
          send.content = '';
          _this.setData({
            send
          });
          
          // 移除当前文档-文本框缓存
          let chartCon = wx.getStorageSync('chartCon') || {};
          if (chartCon[archive.id]) delete chartCon[archive.id]
          wx.setStorageSync('chartCon', chartCon);

          if (d.list.length === 0) {
            if (timer) {
              clearInterval(timer)
            }
            var curTime = new Date(res.createTime);
            var addSeconds = new Date(curTime.setSeconds(curTime.getSeconds() + 3));
            createTimeMinMax.earlyTime = util.formatDate(addSeconds);
            createTimeMinMax.lastTime = res.createTime;
            // console.log(util.formatDate(addSeconds),'===============================')
            // 消息
            _this.getData(_this.data.datas);
          } else {
            // 获取新添加的数据
            createTimeMinMax.lastTime = res.createTime;
            _this.pollingHandle('add')
          }

        }
      }).catch(res => {
        const v = res.body;
        if (v.errorCode === 100) {
          _this.setData({
            dialogShow: true
          })
        } else {
          app.toast({
            title: res.body.message
          });
        }
      })
    },
    inputChangeSend(e) {
      const {
        type
      } = e.currentTarget.dataset
      const {
        value
      } = e.detail
      let {
        send,
        archive
      } = _this.data
      send[type] = value
      _this.setData({
        send
      })

      // 添加文本框缓存
      let chartCon = wx.getStorageSync('chartCon') || {};
      chartCon[archive.id] = value;
      wx.setStorageSync('chartCon', chartCon);


      _this.createSelectorQuery().select('.textRef').boundingClientRect((item) => {
        _this.setData({
          textRef: item.height
        })
      }).exec();
    },

    getDataAll() {
      _this = this;
      const {
        archive
      } = _this.data;
      
      const minuser = wx.getStorageSync('minuser');
      // 用户信息 => 专家
      _this.setData({
        minuser,
        chatPeople: archive
      });
      _this.getUserInfo()

    },

    // 实名认证
    realNameClose() {
      _this.setData({
        dialogShow: false
      })
    },
    // 用户信息，实名认证
    getUserInfo() {
      const {
        chatPeople
      } = _this.data;

      // 创建会话id
      http.chatCreate({
        userArchiveId: chatPeople.id
      }).then(res => {
        _this.setData({
          chat: res
        });

        // 本地记录一个最小的发送时间=earlyTime，和最大的发送时间=lastTime
        const currentDate = util.getCurrentDate();
        createTimeMinMax.earlyTime = currentDate;
        createTimeMinMax.lastTime = res.lastMessageTime || currentDate;

        // 消息
        _this.getData(_this.data.datas);
      }).catch(res => {
        const v = res.body;
        if (v && v.errorCode === 100) {
          _this.setData({
            dialogShow: true
          })
        } else {
          app.toast({
            title: v ? v.message : 'error2'
          });
        }
      })
    },

    /**
     * @method getData
     * @param 
     * 
     */
    getData(data, v) {
      if (timer) {
        clearInterval(timer)
      }

      data.createTimeLe = createTimeMinMax.earlyTime
      http.chatMessage(_this.data.chat.groupId, data).then(res => {
        if (_this.data.scrollWithAnimation) {
          _this.setData({
            scrollWithAnimation: false
          })
        }

        if (v) {
          let datas = _this.data.datas;
          datas.pageNum = res.pageNum;

          // console.log(oldFirstScrollIntoView, 'add')

          _this.setData({
            d: _this.sortRest(res),
            datas,
          });

          if (_this.data.refresherTriggered) {
            _this.setData({
              refresherTriggered: false
            })
          }

          _this.createSelectorQuery().select('#' + oldFirstScrollIntoView).boundingClientRect((item) => {
            if (item) {
              _this.setData({
                scrollTop: item.top - _this.data.boxH / 2 - item.height - 60,
              });
              oldFirstScrollIntoView = 'item_' + _this.data.d.list[0].id
              // console.log(oldFirstScrollIntoView)
            }
          }).exec();
        } else {

          const d = _this.sortRest(res);
          _this.setData({
            datas: data,
            d
          })

          // 页面滚动到底部
          _this.scrollLower(function () {
            _this.setData({
              loading: false
            });
            oldFirstScrollIntoView = _this.data.d.list[0] ? 'item_' + _this.data.d.list[0].id : '';
          })
        }


        // 轮询
        timer = setInterval(function () {
          _this.pollingHandle()
        }, timerSeconds);
      })
    },
    bindscroll(e) {
      console.log(e.detail.scrollTop)
    },

    sortRest(v) {
      // 重新排序
      const {
        d
      } = _this.data;
      let newlist = [];
      for (let i = v.list.length - 1; i >= 0; i--) {
        const cur = v.list[i];
        if (!all[cur.id]) {
          all[cur.id] = cur;
          newlist.push(cur)
        }
      }
      v.list = d ? newlist.concat(d.list) : newlist;

      // 记录最小时间
      if (v.list > 0) {
        createTimeMinMax.earlyTime = v.list[0].createTime;
        createTimeMinMax.lastTime = v.list[v.list.length - 1].createTime;
      }

      return v;
    },

    /**
     * 轮询
     */
    pollingHandle(v) {
      const {
        chat,
        d
      } = _this.data;
      let data = {
        pageSize: 30,
        pageNum: 1,
        sortType: 'ASC',
        createTimeGe: createTimeMinMax.lastTime
      }
      http.chatMessage(chat.groupId, data).then(res => {
        // 记录最大时间
        if (res.total > 0) {
          createTimeMinMax.lastTime = res.list[res.list.length - 1].createTime
        }

        // 最新的消息
        let newList = [];
        for (let i = 0; i < res.list.length; i++) {
          const cur = res.list[i];
          if (!all[cur.id]) {
            all[cur.id] = cur;
            newList.push(cur);
          }
        }
        // console.log(createTimeMinMax)
        // console.log(newList,'=================2')

        if (!_this.data.scrollWithAnimation) {
          _this.setData({
            scrollWithAnimation: true
          })
        }
        // console.log(d,'=============4')
        // 如果有最新的消息数组则，加在列表消息最后
        if (newList.length > 0) {
          d.list = d.list.concat(newList);
          // console.log(d,'=============3')
          _this.setData({
            d
          });
          // 页面滚动到底部
          _this.scrollLower()
        }

        if (v) {
          // 页面滚动到底部
          _this.scrollLower()
        }
      }).catch(res => {
        if (timer) clearInterval(timer)
      })
    },

    // 发送新消息的时候，页面滚动到底部
    scrollLower(cb) {
      _this.createSelectorQuery().select('#page').boundingClientRect((item) => {
        if (item) {
          _this.setData({
            scrollTop: item.height > _this.data.boxH ? item.height - _this.data.boxH : 0
          });

          if (cb) cb()
        }
      }).exec();
    },

    /**
     * 滚动到顶部/左边时触发
     */
    mainToupper() {
      // console.log('main toupper');
    },
    /**
     * 自定义下拉刷新控件被下拉
     */
    mainPulling() {
      // console.log('main pulling');
    },
    /**
     * 自定义下拉刷新被触发
     */
    mainRefresh: function (e) {
      // console.log('main refresh===========', e);
      let {
        datas,
        d
      } = _this.data;

      const pages = datas.pageNum + 1;

      if (pages > d.pages) {
        _this.setData({
          refresherTriggered: false
        })
        return;
      }

      datas.pageNum = pages;

      if (!_this.data.refresherTriggered) {
        _this.setData({
          refresherTriggered: true
        })
      }
      _this.getData(datas, 'add');
    },

    /**
     * 自定义滚动到底部，翻页
     */
    mainLower: function () {
      // console.log('mainLower');
    },
  }
})