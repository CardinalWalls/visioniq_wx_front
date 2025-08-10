// components/AuthDialog/AuthDialog.js
const app = getApp();
const appg = app.globalData;
const http = require('../../utils/http.js');
const util = require('../../utils/util.js');
Component({
  // 继承app.wxss样式
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    dialogShow: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 实名认证
    buttons: [
      { text: '提交', extClass: 'submit' }
    ],
    form: {
      realName: '',
      idCard: ''
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 实名认证
    buttonTap(e) {
      const _this = this;
      const { index, item } = e.detail;
      const { form } = _this.data
      if (form.realName === '') {
        app.toast({
          title: "请输入真实姓名",
        });
        return
      } else if (form.idCard === '') {
        app.toast({
          title: "请输入身份证号码",
        });
        return
      }

      http.userInfoPut(form).then(res => {
        this.triggerEvent("close", false);
        app.toast({
          title: "实名信息提交成功",
        });
      }).catch(res => {
        app.toast({
          title: res.body.message
        });
      })

    },
    inputChange(e) {
      const _this = this;
      const { type } = e.currentTarget.dataset
      const { value } = e.detail
      let { form } = _this.data
      form[type] = value
      _this.setData({ form })
    },
  }
})
