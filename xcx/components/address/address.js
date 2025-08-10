// components/address/address.js
const app = getApp();
// 地区下标
var pi = 0, ci = 0, di = 0;
var provinces = [], citys = [], districts = [];
const http = require('../../utils/http.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    areaIndex: [19, 0, 0],
    areaArr: []
  },
  /**
   * 组件的钩子函数
   */
  attached: function () {

    // 点位到当前位置
    this.address();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    address() {
      let _this = this;

      http.regionList().then(res => {
        provinces = res;

        http.regionList({ id: provinces[19].id }).then(r => {
          citys = r;

          http.regionList({ id: citys[0].id }).then(rr => {
            districts = rr;
            _this.setData({
              areaArr: [provinces, citys, districts]
            });
          });
        })
      })


    },

    // 省级变化
    getCityData(v) {
      let _this = this;
      let areaArr = this.data.areaArr;

      http.regionList({ id: provinces[v].id }).then(res => {
        areaArr[1] = res;
        http.regionList({ id: res[0].id }).then(res2 => {
          areaArr[2] = res2;
          citys = res;
          districts = res2;
          _this.setData({
            areaIndex: [v, 0, 0],
            areaArr: areaArr
          });
        });
      });

    },

    // 区
    getDistrictData(v) {
      const _this = this;
      let areaArr = this.data.areaArr;
      let areaIndex = this.data.areaIndex;

      http.regionList({ id: citys[v].id}).then(res2 => {
        areaArr[2] = res2;
          areaIndex[1] = v;
          areaIndex[2] = 0;

          districts = res2;
          _this.setData({
            areaIndex: areaIndex,
            areaArr: areaArr
          });
      })
    },
    // 当用户滚动选择市区时触发
    bindAreaColumnChange: function (e) {
      const column = e.detail.column;
      const value = e.detail.value;
      if (column === 0) {
        this.getCityData(value);
      } else if (column === 1) {
        this.getDistrictData(value);
      }
    },
    // 点击确定时触发
    bindAreaChange: function (e) {
      const inds = e.detail.value;
      const p1 = provinces[inds[0]];
      const p2 = citys[inds[1]];
      const p3 = districts[inds[2]];
      const arr = {
        selectRegionId: [p1.id, p2.id, p3.id],
        selectRegion: [p1.name, p2.name, p3.name]
      };
      this.triggerEvent('getAddress', arr);
    },
  }
})
