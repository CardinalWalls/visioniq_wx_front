// components/report/report.js
const app = getApp();
const appg = app.globalData;
let _this = null;
import * as echarts from '../../components/ec-canvas/echarts';
const http = require('../../utils/http.js');
// var lineChart = null
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
    // 视力报告数组
    vision: {
      type: Array,
      value: [],
      observer: "visionChange"
    },
  },
  ready() {
    _this = this;
    // console.log(appg)
    // http.dictionarySingle({
    //   dataKey: 'percentage',
    //   dictCode: "ruleProtocol"
    // }).then(v => {
    //   if (!v.dataValue) {
    //     return;
    //   }
    //   http.newsAdd(v.dataValue).then(res => {
    //     _this.setData({
    //       detail: res
    //     });

    //     // WxParse.wxParse('article', 'html', res.content, _this, 5);
    //   })
    // });
  },

  /**
   * 组件的初始数据
   */
  data: {
    description: '',
     // 折线图
     ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },

    // 右侧
    ecLineRight: {
      onInit: function (canvas, width, height, dpr) {
        var lineChart = echarts.init(canvas, null, {
          width,
          height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(lineChart);
        lineChart.setOption(getBarOptionRight(0));
        return lineChart;
      }
    },

    // 左侧
    ecLineLeft: {
        onInit: function (canvas, width, height, dpr) {
          var lineChart = echarts.init(canvas, null, {
            width,
            height,
            devicePixelRatio: dpr // new
          });
          canvas.setChart(lineChart);
          lineChart.setOption(getBarOptionLeft(0));
          return lineChart;
        }
      },

      // 全屏
      ecLineFull: {
        onInit: function (canvas, width, height, dpr) {
            console.log( width, height, _this.data.echartFullSize)
          var lineChart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr // new
          });
          canvas.setChart(lineChart);
          lineChart.setOption(getBarOptionFull(0));
          return lineChart;
        }
    },

    // 是否打开全屏
    isShowFull: false,
    // 左侧全屏或者右侧全屏 l, r
    isFullType: 'l',

    echartFullSize: {
        w:appg.getSystemInfo.screenWidth,
        h:appg.getSystemInfo.screenHeight - appg.navheight
    },
    navheight: appg.navheight,
    isPc: appg.isPc,

  },

  /**
   * 组件的方法列表
   */
  methods: {
    visionChange: function(newVal, oldVal) {
      // console.log(newVal, oldVal);
      if(newVal && newVal[0] && newVal[0].l && newVal[0].r) {
        let currentLevel = {};
        currentLevel.lLevel = newVal[0].l.nearsight_level
        currentLevel.rLevel = newVal[0].r.nearsight_level

        this.setData({
          currentLevel,
          description: {
            l: newVal[0].l.situation_description || '',
            r: newVal[0].r.situation_description || ''
          }
        })
      }
      
    },

    // 打开全屏
    tapFullScreen(e) {
        const {type} = e.currentTarget.dataset;
        _this.setData({
        isShowFull: true,
        isFullType: type
        })
    },
    fullClose() {
        this.setData({ isShowFull: false })
    }
  }
})



// 右侧
function getBarOptionRight(index) {
    var {vision} = _this.data;
    var currentCharts = vision[index];
    const charts = currentCharts.r;
    var xArr = [], lineArr = [];

    //  xArr = charts.future_records.map(i => { return i.age });
    // 年龄数组
    for(let i = 3; i <= 18; i++) {
      xArr.push(i)
    }
  
  //   左眼
    if (charts) {
      // 原始记录的列表
      const originalRecords = charts.original_records;
      lineArr.push(getOriginalRecords(originalRecords, xArr, false))
  
      // 未来预测记录的列表
      const futureRecords = charts.future_records;
      lineArr.push(getFutureRecords2(futureRecords, xArr, false))
      //平滑曲线
      lineArr.push(getSmoothedCurve2(futureRecords, xArr))
    }
    
  
    // 背景线及背景色
    const referenceCurves = charts.reference_curves;
    const referenceCurvesObj = getReferenceCurves(referenceCurves, xArr)
    const rangeSeriesArr = referenceCurvesObj || [];
    // console.log(referenceCurvesObj)
    
    //平滑曲线
  //   const smoothedCurve = charts.smoothed_curve;
  //   lineArr.push(getSmoothedCurve(smoothedCurve, xArr))
  //   console.log(rangeSeriesArr)
    var series = lineArr.concat(rangeSeriesArr);
  //   var series = lineArr
    // console.log(series)
   var legend = {
      // data: ['预测纪录', '原始纪录', '平滑曲线'],
      data: [
        {name: '无风险',icon: 'rect', itemStyle: {
          color: '#b2d8b2'
        }},
        {name: '低风险',icon: 'rect', itemStyle: {
          color: '#ddf9dd'
        }},
        {name: '中风险',icon: 'rect', itemStyle: {
          color: '#ffffb2'
        }},
        {name: '高风险',icon: 'rect', itemStyle: {
          color: '#ffb2b2'
        }},
        {name: '原始纪录',icon: 'circle'},
        {name: '预测纪录',icon: 'circle'},
        {name: '平滑曲线',icon: 'circle'},
        {name: 'P5',itemStyle: {
          color: '#fea802'
        }},
        {name: 'P50',itemStyle: {
          color: '#851484'
        }},
        {name: 'P95',itemStyle: {
          color: '#ff0000'
        }},
      ],
      selectedMode: true,
      left: 10,
      top: 25
    }
    var grid = {
      top: 130,
      left: '4%',
      right: '5%',
      bottom: 10,
      containLabel: true
    },
    fullgrid = {
      top: 40,
      left: '4%',
      right: '8%',
      bottom: 20,
      containLabel: true
    }
    return {
      title: {
        show: true,
        subtext: '右眼小瞳验光（D）与年龄的关系图',
        left: 'center',
        top: -10
      },
      tooltip: {
        trigger: 'axis',
        z:110,
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            formatter(params) {
              if (params.axisDimension === 'y') {
                let val = (params.value).toFixed(2)
                return val <= 0 ? Math.abs(val):'-'+val;
              } else {
                return params.value
              }
            }
          },
        },
        formatter(params) {
        //   var p0 = params[0].data;
  
          var text = '年龄：'+params[0].name + '岁';
          if(params[1].data[1]) {
            text += '\n预测屈光度：' + (params[1].data[1] <=0 ? Math.abs(params[1].data[1]):'-'+params[1].data[1]);
          }
          
          if(params[0].data[1]) {
              text += '\n原始屈光度：' + (params[0].data[1] <=0 ? Math.abs(params[0].data[1]):'-'+params[0].data[1]);
          }
          return text
        },
        textStyle:{
          fontSize:12,
        },
      },
      color: ['#fea802', '#851484', '#ff0000'],
      legend: [legend],
      grid: grid,
      xAxis: [{
        type: 'category',
        // 让点落在x轴的刻度上，而不是刻度之间
        boundaryGap: false,
        data: xArr,
        
        axisLine: {
          show: true,
          onZero: false, // x轴线始终在底部 刻度轴上-重点
          lineStyle: {
            color: '#12c287',
            width: 1,
            // type: 'solid'
          },
        },
        axisTick: {
          lineStyle: {
            color: '#12c287',
            width: 1,
          }
        },
        axisLabel: {
          show: true,
          color: '#6e7079',
          fontSize: 12,
          // rotate: -45,
        },
        name: '\n\n\n\n年龄(岁)',
        nameLocation: 'end',
        nameTextStyle:{
          align: 'right',
          verticalAlign: 'middle',
          fontSize: 12,
          color: '#15c295'
        }
      },
      {
          top: 50,
          bottom: 50,
          axisTick: {},
          axisLabel: {},
          type: 'category',
          axisPointer: {
            animation: true,
            label: {
              show: true
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              opacity: 0.2
            }
          }
        }],
      yAxis: [{
        type: 'value',
        boundaryGap: false,
        // formatter: '{value}',
        axisLabel: {
          formatter(value, i) {
            var val = value <= 0 ? Math.abs(value):'-'+value;
            return val
          }
        },
        name: '小瞳验光(D)',
        nameLocation: 'end',
        nameTextStyle:{
          fontSize: 12,
          align: 'center',
          verticalAlign: 'bottom',
          color: '#15c295',
        }
      }],
      series: series
    };
  }

// 左侧
function getBarOptionLeft(index) {
    var {vision} = _this.data;
    var currentCharts = vision[index];
    const charts = currentCharts.l;
    var xArr = [], lineArr = [];
  
   
  //   xArr = charts.future_records.map(i => { return i.age });
      // 年龄数组
    for(let i = 3; i <= 18; i++) {
      xArr.push(i)
    }
  
  //   左眼
    if (charts) {
      // 原始记录的列表
      const originalRecords = charts.original_records;
      lineArr.push(getOriginalRecords(originalRecords, xArr, false))
  
      // 未来预测记录的列表
      const futureRecords = charts.future_records;
      lineArr.push(getFutureRecords2(futureRecords, xArr, false))
      //平滑曲线
      lineArr.push(getSmoothedCurve2(futureRecords, xArr))
    }
    
  
    // 背景线及背景色
    const referenceCurves = charts.reference_curves;
    const referenceCurvesObj = getReferenceCurves(referenceCurves, xArr)
    const rangeSeriesArr = referenceCurvesObj || [];
    // console.log(referenceCurvesObj)
    
    //平滑曲线
  //   const smoothedCurve = charts.smoothed_curve;
  //   lineArr.push(getSmoothedCurve(smoothedCurve, xArr))
  //   console.log(rangeSeriesArr)
    var series = lineArr.concat(rangeSeriesArr);
  //   var series = lineArr
    // console.log(series)
   var legend = {
      // data: ['预测纪录', '原始纪录', '平滑曲线'],
      data: [
        {name: '无风险',icon: 'rect', itemStyle: {
          color: '#b2d8b2'
        }},
        {name: '低风险',icon: 'rect', itemStyle: {
          color: '#ddf9dd'
        }},
        {name: '中风险',icon: 'rect', itemStyle: {
          color: '#ffffb2'
        }},
        {name: '高风险',icon: 'rect', itemStyle: {
          color: '#ffb2b2'
        }},
        {name: '原始纪录',icon: 'circle'},
        {name: '预测纪录',icon: 'circle'},
        {name: '平滑曲线',icon: 'circle'},
        {name: 'P5',itemStyle: {
          color: '#fea802'
        }},
        {name: 'P50',itemStyle: {
          color: '#851484'
        }},
        {name: 'P95',itemStyle: {
          color: '#ff0000'
        }},
      ],
      selectedMode: true,
      left: 10,
      top: 25
    }
    var grid = {
      top: 130,
      left: '4%',
      right: '5%',
      bottom: 10,
      containLabel: true
    },
    fullgrid = {
      top: 40,
      left: '4%',
      right: '8%',
      bottom: 20,
      containLabel: true
    }
    return {
      title: {
        show: true,
        subtext: '左眼小瞳验光（D）与年龄的关系图',
        left: 'center',
        top: -10
      },
      tooltip: {
        trigger: 'axis',
        z:110,
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            formatter(params) {
              if (params.axisDimension === 'y') {
                let val = (params.value).toFixed(2)
                return val <= 0 ? Math.abs(val):'-'+val;
              } else {
                return params.value
              }
            }
          },
        },
        formatter(params) {
        //   var p0 = params[0].data;
  
          var text = '年龄：'+params[0].name + '岁';
          if(params[1].data[1]) {
            text += '\n预测屈光度：' + (params[1].data[1] <=0 ? Math.abs(params[1].data[1]):'-'+params[1].data[1]);
          }

          if(params[0].data[1]) {
              text += '\n原始屈光度：' + (params[0].data[1] <=0 ? Math.abs(params[0].data[1]):'-'+params[0].data[1]);
          }
          return text
        },
        textStyle:{
          fontSize:12,
        },
      },
      color: ['#fea802', '#851484', '#ff0000'],
      legend: [legend],
      grid: grid,
      xAxis: [{
        type: 'category',
        // 让点落在x轴的刻度上，而不是刻度之间
        boundaryGap: false,
        data: xArr,
        
        axisLine: {
          show: true,
          onZero: false, // x轴线始终在底部 刻度轴上-重点
          lineStyle: {
            color: '#12c287',
            width: 1,
            // type: 'solid'
          },
        },
        axisTick: {
          lineStyle: {
            color: '#12c287',
            width: 1,
          }
        },
        axisLabel: {
          show: true,
          color: '#6e7079',
          fontSize: 12,
          // rotate: -45,
        },
        name: '\n\n\n\n年龄(岁)',
        nameLocation: 'end',
        nameTextStyle:{
          align: 'right',
          verticalAlign: 'middle',
          fontSize: 12,
          color: '#15c295'
        }
      },
      {
          top: 50,
          bottom: 50,
          axisTick: {},
          axisLabel: {},
          type: 'category',
          axisPointer: {
            animation: true,
            label: {
              show: true
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              opacity: 0.2
            }
          }
        }],
      yAxis: [{
        type: 'value',
        boundaryGap: false,
        // formatter: '{value}',
        axisLabel: {
          formatter(value, i) {
            var val = value <= 0 ? Math.abs(value):'-'+value;
            return val
          }
        },
        name: '小瞳验光(D)',
        nameLocation: 'end',
        nameTextStyle:{
          fontSize: 12,
          align: 'center',
          verticalAlign: 'bottom',
          color: '#15c295',
        }
      }],
      series: series
    };
  }


// 全屏
function getBarOptionFull(index) {
    var {vision, isFullType} = _this.data;
    var currentCharts = vision[index];
    const charts = currentCharts[isFullType];
    var xArr = [], lineArr = [];
  
   
  //   xArr = charts.future_records.map(i => { return i.age });
      // 年龄数组
    for(let i = 3; i <= 18; i++) {
      xArr.push(i)
    }
  
  //   左眼
    if (charts) {
      // 原始记录的列表
      const originalRecords = charts.original_records;
      lineArr.push(getOriginalRecords(originalRecords, xArr,true))
  
      // 未来预测记录的列表
      const futureRecords = charts.future_records;
      lineArr.push(getFutureRecords2(futureRecords, xArr, true))
      //平滑曲线
      lineArr.push(getSmoothedCurve2(futureRecords, xArr))
    }
    
  
    // 背景线及背景色
    const referenceCurves = charts.reference_curves;
    const referenceCurvesObj = getReferenceCurves(referenceCurves, xArr)
    const rangeSeriesArr = referenceCurvesObj || [];
    // console.log(referenceCurvesObj)
    
    //平滑曲线
  //   const smoothedCurve = charts.smoothed_curve;
  //   lineArr.push(getSmoothedCurve(smoothedCurve, xArr))
  //   console.log(rangeSeriesArr)
    var series = lineArr.concat(rangeSeriesArr);
  //   var series = lineArr
    // console.log(series)

   var legend = {
      // data: ['预测纪录', '原始纪录', '平滑曲线'],
      data: [
        {name: '无风险',icon: 'rect', itemStyle: {
          color: '#b2d8b2'
        }},
        {name: '低风险',icon: 'rect', itemStyle: {
          color: '#ddf9dd'
        }},
        {name: '中风险',icon: 'rect', itemStyle: {
          color: '#ffffb2'
        }},
        {name: '高风险',icon: 'rect', itemStyle: {
          color: '#ffb2b2'
        }},
        {name: '原始纪录',icon: 'circle'},
        {name: '预测纪录',icon: 'circle'},
        {name: '平滑曲线',icon: 'circle'},
        {name: 'P5',itemStyle: {
          color: '#fea802'
        }},
        {name: 'P50',itemStyle: {
          color: '#851484'
        }},
        {name: 'P95',itemStyle: {
          color: '#ff0000'
        }},
      ],
      selectedMode: true,
      left: 10,
      top: 25
    }
    var grid = {
      top: 130,
      left: '4%',
      right: '5%',
      bottom: 10,
      containLabel: true
    },
    fullgrid = {
      top: 40,
      left: '4%',
      right: '10px',
      bottom: 40,
      containLabel: true
    }
    let subtext = isFullType === 'l' ? '左眼':'右眼';
    return {
      title: {
        show: true,
        subtext: subtext + '小瞳验光（D）与年龄的关系图',
        left: 'center',
        top: 0
      },
      tooltip: {
        trigger: 'axis',
        z:110,
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            formatter(params) {
              if (params.axisDimension === 'y') {
                let val = (params.value).toFixed(2)
                return val <= 0 ? Math.abs(val):'-'+val;
              } else {
                return params.value
              }
            }
          },
        },
        formatter(params) {
        //   var p0 = params[0].data;
  
          var text = '年龄：'+params[0].name + '岁';
          if(params[1].data[1]) {
            text += '\n预测屈光度：' + (params[1].data[1] <=0 ? Math.abs(params[1].data[1]):'-'+params[1].data[1]);
          }

          if(params[0].data[1]) {
              text += '\n原始屈光度：' + (params[0].data[1] <=0 ? Math.abs(params[0].data[1]):'-'+params[0].data[1]);
          }
          return text
        },
        textStyle:{
          fontSize:12,
        },
      },
      color: ['#fea802', '#851484', '#ff0000'],
      legend: [],
      grid: fullgrid,
      xAxis: [{
        type: 'category',
        // 让点落在x轴的刻度上，而不是刻度之间
        boundaryGap: false,
        data: xArr,
        
        axisLine: {
          show: true,
          onZero: false, // x轴线始终在底部 刻度轴上-重点
          lineStyle: {
            color: '#12c287',
            width: 1,
            // type: 'solid'
          },
        },
        axisTick: {
          lineStyle: {
            color: '#12c287',
            width: 1,
          }
        },
        axisLabel: {
          show: true,
          color: '#6e7079',
          fontSize: 12,
          // rotate: -45,
        },
        name: '\n\n\n\n年龄(岁)',
        nameLocation: 'end',
        nameTextStyle:{
          align: 'right',
          verticalAlign: 'middle',
          fontSize: 12,
          color: '#15c295'
        }
      },
      {
          top: 50,
          bottom: 50,
          axisTick: {},
          axisLabel: {},
          type: 'category',
          axisPointer: {
            animation: true,
            label: {
              show: true
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              opacity: 0.2
            }
          }
        }],
      yAxis: [{
        type: 'value',
        boundaryGap: false,
        // formatter: '{value}',
        axisLabel: {
          formatter(value, i) {
            var val = value <= 0 ? Math.abs(value):'-'+value;
            return val
          }
        },
        name: '小瞳验光(D)',
        nameLocation: 'end',
        nameTextStyle:{
          fontSize: 12,
          align: 'center',
          verticalAlign: 'bottom',
          color: '#15c295',
        }
      }],
      series: series
    };
  }

// 平滑曲线
function getSmoothedCurve(smoothedCurve, xArr) {
  let smoothedCurveArr = [], smoothedCurveGroupAgeObj ={}, smoothedCurveData = [];
  smoothedCurve.age.map((item,index) => {
    let val = smoothedCurve.values[index];
    let matchVal = parseFloat(val <= 0 ? Math.abs(val): '-'+val);
    smoothedCurveArr.push({
        age: item,
        value: matchVal,
        type: 'smoothed_curve'
    })
  })
  smoothedCurveGroupAgeObj = groupByIntValue(smoothedCurveArr, 'age')
  // console.log('smoothedCurveGroupAgeObj=', smoothedCurveGroupAgeObj)
  xArr.map((item, index) => {
    if(smoothedCurveGroupAgeObj[item] && smoothedCurveGroupAgeObj[item][0]) {
      let currentItem = smoothedCurveGroupAgeObj[item][0];
      // let allCount = values.reduce((accumulator, current) => accumulator + current.value, 0);
      let num = currentItem.value <= 0 ? (Math.abs(currentItem.value)).toFixed(2): '-'+(currentItem.value).toFixed(2);
      smoothedCurveData.push(num)
    } else {
      smoothedCurveData.push(null)
    }
  })
  // console.log('smoothedCurveData=', smoothedCurveData)

  return {
    name: '平滑曲线',
    type: 'line',
    smooth: true,
    symbol: 'none',
    color: '#22be80',
    z: 100,
    data: smoothedCurveData,
    label: {
      show: false,
      position: 'top',
    //   offset: [20, 40],
      formatter: function(params) {
        //   console.log(params, params.dataIndex, params.dataIndex == dataIndex)
        //   if (params.data.name == dataIndex) {
        //       // 当数值大于 100 时，背景色设置为红色
        //       return '{a|'+ (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
        //   }  else {
              // 当数值小于等于 100 时，背景色设置为绿色
              return '{b|' + (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
            //   return ''
        //   }
      },
      rich: {
          a: {
              borderType: 'solid',
              borderWidth: 1,
              borderColor: '#22be80',
              fontWeight:'bold',
              borderRadius: 3,
              color: '#22be80',
              backgroundColor: '#d9fff0',
              padding: [3, 4]
          },
          b: {
              color: '#101010',
              backgroundColor: 'transparent',
              padding: [2, 4]
          }
      }
    },
    lineStyle: {
      width: 1.5
    },
  }
  
}

// 平滑曲线
function getSmoothedCurve2(futureRecords, xArr) {
    const objFutureRecords = futureRecords.reduce((accumulator, currentValue, index) => {
        accumulator[currentValue.age] = currentValue; // 可以根据需要设置值
        return accumulator;
        }, {});
        // console.log('objFutureRecords=',objFutureRecords)
    
        let futureRecordsData = [];
        xArr.map((v, i) => { 
          if (objFutureRecords[v] && objFutureRecords[v].diopter_s != null) {
              const item = objFutureRecords[v];
              let diopterS = item.diopter_s <= 0 ? (Math.abs(item.diopter_s)).toFixed(2): '-'+(item.diopter_s).toFixed(2)
              futureRecordsData.push([v+'', diopterS])
              
          } else {
            futureRecordsData.push([v+'', null]);
          }
        });
    // console.log('smoothedCurveData=', smoothedCurveData)
  
    return {
      name: '平滑曲线',
      type: 'line',
      smooth: true,
      symbol: 'none',
      color: '#22be80',
      z: 98,
      data: futureRecordsData,
      label: {
        show: false,
        position: 'top',
      //   offset: [20, 40],
        formatter: function(params) {
          //   console.log(params, params.dataIndex, params.dataIndex == dataIndex)
          //   if (params.data.name == dataIndex) {
          //       // 当数值大于 100 时，背景色设置为红色
          //       return '{a|'+ (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
          //   }  else {
                // 当数值小于等于 100 时，背景色设置为绿色
                return '{b|' + (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
              //   return ''
          //   }
        },
        rich: {
            a: {
                borderType: 'solid',
                borderWidth: 1,
                borderColor: '#22be80',
                fontWeight:'bold',
                borderRadius: 3,
                color: '#22be80',
                backgroundColor: '#d9fff0',
                padding: [3, 4]
            },
            b: {
                color: '#101010',
                backgroundColor: 'transparent',
                padding: [2, 4]
            }
        }
      },
      lineStyle: {
        width: 1.5
      },
    }
    
  }

// 背景线及背景色
function getReferenceCurves(referenceCurves, xArr) {
  var bgcolor = ['#b2d8b2', '#ddf9dd', '#ffffb2', '#ffb2b2'],
  linecolor = ['#fea802', '#851484', '#ff0000'],
  origin = ['start', 'start', 'start', 'end'],
  legendName = {
    p5: 'P5',
    p50: 'P50',
    p95: 'P95',
  },
  legendNameBg = {
    p5: '无风险',
    p50: '低风险',
    p95: '中风险',
  }

  var rangeSeriesArr = [], index = -1, allCount= 40;
  for(var k in referenceCurves) {
    index++;
    allCount = allCount - 1;
    var arr = [];
    // console.log(referenceCurves[k],'======')
    referenceCurves[k].age.map((item, index) => { 
        if(item>= xArr[0] && item < xArr[xArr.length-1]+1){
            let val = referenceCurves[k].values[index];
            let matchVal = parseFloat(val <= 0 ? Math.abs(val): '-'+val);
            arr.push({
                age: item,
                value: matchVal,
                type: k
            })
        }
     })

    var newArr = [], orignArr = groupByIntValue(arr, 'age');
    xArr.map((item, index) => {
        let values = orignArr[item]
        newArr.push((values[0].value).toFixed(2))
    })
 
    // 折线
    rangeSeriesArr.push({
        name: legendName[k],
        smooth: true,
        symbol: 'none',
        type: 'line',
        emphasis: {
            // focus: 'series'
            disabled: true
        },
        z: allCount,
        lineStyle: {
            type: 'dashed',
            width: 1.5,
            color: linecolor[index]
        },
        data: newArr
    })

    // 折线背景
    rangeSeriesArr.push({
        name: legendNameBg[k],
        smooth: true,
        symbol: 'none',
        type: 'line',
        emphasis: {
            // focus: 'series'
            disabled: true
        },
        z: allCount,
        areaStyle: {
            origin: origin[index],
            opacity: 0.4+index*0.1,
            color: bgcolor[index],
        },
        lineStyle: {
            type: 'dashed',
            width: 0,
            color: linecolor[index]
        },
        data: newArr
    })

    if(k === 'p95') {
      rangeSeriesArr.push({
          name: '高风险',
          smooth: true,
          symbol: 'none',
          type: 'line',
          // stack 值相同，则堆叠
          // stack: 'Total',
          // color: 'rgba(255, 66,66, '+parseFloat('0.'+(index+1)) +')',
          // color:color[index],
          emphasis: {
              // focus: 'series'
              disabled: true
          },
          z: allCount,
          areaStyle: {
              origin: origin[3],
              opacity: 0.6,
              color: bgcolor[3],
          },
          lineStyle: {
              type: 'dashed',
              width: 0,
              color: linecolor[3]
          },
          data: newArr
      })
    }
  }

  return rangeSeriesArr
}

// 原始记录
function getOriginalRecords(originalRecords, xArr, isShowFullScreen) {
  const objOriginalRecords = groupByIntValue(originalRecords, 'age')
  // console.log('arr=',arr)

  // const objOriginalRecords = originalRecords.reduce((accumulator, currentValue, index) => {
  //   accumulator[currentValue.age] = currentValue; // 可以根据需要设置值
  //   return accumulator;
  //   }, {});
    // console.log('objOriginalRecords=',objOriginalRecords)

    let originalRecordsData = [];
    xArr.map((v, i) => { 
      if (objOriginalRecords[v] && objOriginalRecords[v].length > 0) {
          // const item = objOriginalRecords[v];
          // for(let k = 0; k < item.length; k++) {
          //   let ds = item[k].DS <= 0 ? (Math.abs(item[k].DS)).toFixed(2): '-'+(item[k].DS).toFixed(2);
          //   originalRecordsData.push([v+'', ds])
          // }
          const item = objOriginalRecords[v][0];
          let ds = item.DS <= 0 ? (Math.abs(item.DS)).toFixed(2): '-'+(item.DS).toFixed(2);
          originalRecordsData.push([v+'', ds])
      } else {
        originalRecordsData.push([v+'', null]);
      }
    });
    // originalRecordsData[4][1] = '5.43'; 
    return {
      name: '原始纪录',
      type: 'scatter',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      // stack: 'a',
      color: '#1313fa',
      z: 100,
      data: originalRecordsData,
      label: {
        show: isShowFullScreen,
        position: 'top',
      //   offset: [20, 40],
        formatter: function(params) {
            // console.log(params,'===========')
          //   if (params.data.name == dataIndex) {
          //       // 当数值大于 100 时，背景色设置为红色
          //       return '{a|'+ (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
          //   }  else {
                // 当数值小于等于 100 时，背景色设置为绿色
                return '{b|' + (params.value[1] <= 0 ? Math.abs(params.value[1]):'-'+params.value[1]) + '}';
              //   return ''
          //   }
        },
        rich: {
            a: {
                borderType: 'solid',
                borderWidth: 1,
                borderColor: '#22be80',
                fontWeight:'bold',
                borderRadius: 3,
                color: '#22be80',
                backgroundColor: '#d9fff0',
                padding: [3, 4]
            },
            b: {
                color: '#1313fa',
                backgroundColor: 'transparent',
                padding: [0, 0]
            }
        }
      },
      // lineStyle: {
      //   width: 1.5
      // },
    }
}

// 未来预测记录的列表2
function getFutureRecords2(futureRecords, xArr, isShowFullScreen) {
  const objFutureRecords = futureRecords.reduce((accumulator, currentValue, index) => {
    accumulator[currentValue.age] = currentValue; // 可以根据需要设置值
    return accumulator;
    }, {});
    // console.log('objFutureRecords=',objFutureRecords)

    let futureRecordsData = [];
    xArr.map((v, i) => { 
      if (objFutureRecords[v] && objFutureRecords[v].diopter_s != null) {
          const item = objFutureRecords[v];
          let diopterS = item.diopter_s <= 0 ? (Math.abs(item.diopter_s)).toFixed(2): '-'+(item.diopter_s).toFixed(2)
          futureRecordsData.push([v+'', diopterS])
          
      } else {
        futureRecordsData.push([v+'', null]);
      }
    });
    return {
      name: '预测纪录',
      type: 'scatter',
      datasetIndex: 0,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      // stack: 'a',
      color: '#ff0000',
      z: 99,
      data: futureRecordsData,
      label: {
        show: isShowFullScreen,
        position: 'top',
      //   offset: [20, 40],
        formatter: function(params) {
          //   console.log(params, params.dataIndex, params.dataIndex == dataIndex)
          //   if (params.data.name == dataIndex) {
          //       // 当数值大于 100 时，背景色设置为红色
          //       return '{a|'+ (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
          //   }  else {
                // 当数值小于等于 100 时，背景色设置为绿色
                return '{b|' + (params.data[1] <= 0 ? Math.abs(params.data[1]):'-'+params.data[1]) + '}';
              //   return ''
          //   }
        },
        rich: {
            a: {
                borderType: 'solid',
                borderWidth: 1,
                borderColor: '#22be80',
                fontWeight:'bold',
                borderRadius: 3,
                color: '#22be80',
                backgroundColor: '#d9fff0',
                padding: [3, 4]
            },
            b: {
                color: '#101010',
                backgroundColor: 'transparent',
                padding: [2, 4]
            }
        }
      },
      // lineStyle: {
      //   width: 1.5
      // },
    }
}

// 未来预测记录的列表
function getFutureRecords(futureRecords, xArr, dataIndex) {
  const objFutureRecords = futureRecords.reduce((accumulator, currentValue, index) => {
    accumulator[currentValue.age] = currentValue; // 可以根据需要设置值
    return accumulator;
    }, {});
    console.log(objFutureRecords, '============')

    let futureRecordsData = [];
    xArr.map((v, i) => { 
      if (objFutureRecords[v]) {
          const item = objFutureRecords[v];
          if (item.diopter_s == null) {
            futureRecordsData.push({
                name: item.age,
              value: item.diopter_s,
            })
          } else if (dataIndex === i) {
            futureRecordsData.push({ 
                name: item.age,
              value: item.diopter_s <= 0 ? (Math.abs(item.diopter_s)).toFixed(2): '-'+(item.diopter_s).toFixed(2),
              symbol:'roundRect',
              symbolSize: 8,
            });
          } else {
            futureRecordsData.push({
              value: item.diopter_s <= 0 ? (Math.abs(item.diopter_s)).toFixed(2): '-'+(item.diopter_s).toFixed(2),
              name:item.age
            })
          }
      } else {
        futureRecordsData.push(null);
      }
    });

    return {
      name: '预测纪录',
      type: 'line',
      smooth: true,
      // stack: 'a',
      color: '#ff0000',
      z: 100,
      data: futureRecordsData,
      label: {
        show: true,
        position: 'top',
      //   offset: [20, 40],
        formatter: function(params) {
          //   console.log(params, params.dataIndex, params.dataIndex == dataIndex)
          //   if (params.data.name == dataIndex) {
          //       // 当数值大于 100 时，背景色设置为红色
          //       return '{a|'+ (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
          //   }  else {
                // 当数值小于等于 100 时，背景色设置为绿色
                return '{b|' + (params.value <= 0 ? Math.abs(params.value):'-'+params.value) + '}';
              //   return ''
          //   }
        },
        rich: {
            a: {
                borderType: 'solid',
                borderWidth: 1,
                borderColor: '#22be80',
                fontWeight:'bold',
                borderRadius: 3,
                color: '#22be80',
                backgroundColor: '#d9fff0',
                padding: [3, 4]
            },
            b: {
                color: '#101010',
                backgroundColor: 'transparent',
                padding: [2, 4]
            }
        }
      },
      lineStyle: {
        width: 1.5
      },
    }
}

// 数组对象根据字段分组
function groupByIntValue(data, field) {
    return data.reduce((acc, item) => {
        const intValue = Math.floor(item[field]);
        if (!acc[intValue]) {
            acc[intValue] = [];
        }
        acc[intValue].push(item);
        return acc;
    }, {});
}