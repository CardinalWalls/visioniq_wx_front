// components/nodata/nodata.js
Component({
  // 继承app.wxss样式
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    icon: {
      type: String,
      value: 'icon-nodata',
    },
    text: {
      type: String,
      value: '',
    },
    iconShow: {
      type: Boolean,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 数据初始化
   */
  ready: function() {
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
