// components/PickerSelector/PickerSelector.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    mode: {
      type: String,
      value:'selector' // selector 单选；multiSelector 多选
    },
    list: {
      type: Array,
      value: []
    },
    listIndex: {
      type: Number,
      value: 0
    },
    rangeKey: {
      type: String,
      value: 'name'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    bindchange(e) {
      console.log(e.detail);
      const v = e.detail;
      this.triggerEvent('change', v);
    }
  }
})
