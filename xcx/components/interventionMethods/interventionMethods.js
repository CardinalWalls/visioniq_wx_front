// components/checkList/checkList.js
const http = require('../../utils/http.js');
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
    list: {
      type: Array,
      value: []
    },
    // 1: 区间测速-干预记录-部分字段不显示
    type: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

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

  /**
   * 组件的方法列表
   */
  methods: {
    update(e) {
      const {index} = e.currentTarget.dataset;
      const {list} = this.data;
      wx.setStorageSync('intervention', list[index]);
      wx.navigateTo({
        url: '/pages/doctor/intervention/intervention?id=' + list[index].id,
      })
    },
    push(e) {
      const {id} = e.currentTarget.dataset;
      this.triggerEvent('push', {
        id
      });
    },
  }
})
