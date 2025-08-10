// components/report/report.js

let _this = null;
import * as echarts from '../../components/ec-canvas/echarts';
const util = require('../../utils/util.js');
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
      type: Object,
      value: {},
      observer: "visionChange"
    }
  },
  ready() {
    _this = this;
  },

  /**
   * 组件的初始数据
   */
  data: {
    warningLevel: 0.7,
    // 折线图
    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },

    // 右侧
    ecLineRight: {
      onInit: function (canvas, width, height, dpr) {
        var lineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
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
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(lineChart);
        lineChart.setOption(getBarOptionLeft(0));

        return lineChart;
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    visionChange: function (newVal, oldVal) {
      // console.log(newVal, oldVal);
    }
  }
})
// 图表显示几个日期
var showCount = 3;
// 箭头颜色，提示框背景颜色
var color = {
  0: 'green',
  1: 'yellow',
  2: 'red'
},colorbg = {
0: '0,127,2',
1: '253,253,2',
2: '250,20,25'
};


// 右眼
function getBarOptionRight(index) {
  let {vision} = _this.data;
  // vision.r = demo;
  // vision.l = demo;
  // console.log(vision.r,'=================')
  const visionCur = vision.r;
  const points = visionCur.points;
  const arrows = visionCur.arrows;
  var xArr = [], yArrRightAxis = [],  yArrRightAxisLast = [], links = [], markLine=[],pieces = [];

  xArr = points.map(i => { return i.time });
  // console.log('xArr=',xArr)
  // .replace(/-/g, "")

  if (visionCur && points) {
    let pointObj = {}
    points.map((item, i) => { 
        pointObj[item.time] = item
        yArrRightAxis.push({
            value: item.AL_percentage || null,
            AL: item.AL || null,
            name: item.time
        })
    });

    var arrowsCount = arrows.length;
    arrows.map((item, i) => { 
        // 箭头走向
        links.push({
          source: i,
          target: i + 1,
          label: {
            show: true,
            position: 'middle',
            formatter: function(params) {
              // console.log(params,'===============1111')
              const d = params.data;
              let text = 'AL增长:' + d.AL_growth.toFixed(2) + 'mm';
              text += '\n年增长:' + d.AL_growth_yearly.toFixed(2) + 'mm/年';
              // text += '\n治疗:无';
              // text += '\n日期:' + d.name.replace(/-/g, "");
              return text;
            },
            color: '#424141',
            borderWidth: 0,
            borderColor: 'transparent',
            backgroundColor: 'rgba('+colorbg[item.type_code] +',0.2)',
            padding: [3, 3],
            fontSize: 10,
            lineHeight: 14,
            // align: 'left',
            shadowColor: 'rgba(0,0,0, 0.3)',
            shadowBlur: 5
          },
          lineStyle: {
            width: 3,
            opacity: 0.8,
            color: color[item.type_code]
          },
          ...item,
        })

        // 视觉映射-背景颜色
        pieces.push({
          gt: i,
          lt: i+1,
          color: 'rgba('+colorbg[item.type_code] +',0.2)'
        })

        // 折线X轴markLine
        markLine.push({
          xAxis: i 
        })

        // 箭头走向Data
        let obj = {
            name: item.time_start,
            value: pointObj[item.time_start].AL_percentage,
        }
        yArrRightAxisLast.push(obj);

        // 最后一个的时候
        if(i === arrowsCount-1) {
          let obj = {
            name: item.time_end,
            value: pointObj[item.time_end].AL_percentage,
          }
          yArrRightAxisLast.push(obj);
        }
    });

    // console.log('yArrRightAxisLast=',yArrRightAxisLast,markLine)
  }
  
  var lineArr = [
    {
    name: '右眼',
    type: 'line',
    smooth: false,
    // symbol: 'none',
    // symbolSize: 8,
    color: 'blue',
    z: 60,
    data: yArrRightAxis,
    lineStyle: {
      width: 1.5,
      color: 'blue',
    },
    label: {
      show: true,
      // position:'insideTopRight',
      offset: [-40, 0],
      formatter: function(params) {
        const d = params.data;
        let text = 'AL:' + d.AL + 'mm';
        text += '\n屈光度:' + d.AL + 'D';
        text += '\n百分位:' + (d.value*100).toFixed(2) + '%';
        text += '\n日期:' + d.name.replace(/-/g, "");
        return text;

      },
      color: '#424141',
      borderWidth: 0,
      borderColor: '#5f5f5f',
      backgroundColor: 'rgba(255, 255,255, 0.9)',
      padding: [3, 3],
      fontSize: 10,
      lineHeight: 16,
      align: 'left',

      shadowColor: 'rgba(0,0,0, 0.3)',
      shadowBlur: 5
    },
  },
  {
    name: '趋势参考线',
    type: 'graph',
    layout: 'none',
    coordinateSystem: 'cartesian2d',
    symbolSize: 0,
    edgeSymbol: ['circle', 'arrow'],
    edgeSymbolSize: [4, 10],
    data: yArrRightAxisLast,
    links: links,
    z: 61,
    label: {
      show: false,
    },
  },
  {
    name: '右眼映射',
    type: 'line',
    smooth: false,
    symbol: 'none',
    // symbolSize: 8,
    color: 'rgba(0,0,0,0)',
    z: 59,
    data: yArrRightAxisLast,
    lineStyle: {
      width: 1.5,
      color: 'rgba(0,0,0,0)',
    },
    label: {
      show: false,
    },
    markLine: {
      symbol: ['none', 'none'],
      label: { show: false },
      data: markLine
    },
    areaStyle: {},
  },
]

  var series = lineArr;
  const result = {
    title: {
      show: true,
      text: 'AL增长随时间变化',
      left: 'center',
      textStyle: {
        color: '#a1a1a1',
        fontSize: 12,
        fontWeight: 'normal',
      }
    },
    tooltip: {
      show: false,
      trigger: 'none', //axis
      z: 70,
      axisPointer: {
        type: 'cross', 
        label: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          formatter(params) {
            if (params.axisDimension === 'y') {
              let val = (params.value).toFixed(2)
              return val;
            } else {
              return params.value
            }
            // console.log(params,'=========')
          }
        },
      },
      formatter(params) {
        if (params.componentIndex === 1) return
        var data =  params.data;
        var text = '';
        // percentage: item.AL_percentage || null,
        // grow: item.AL_grow || null,
        // growYear: item.AL_grow_year || null,
        

        text += '眼轴长度：' + data.AL +'mm';
        text += '\n'+'百分比：' + (data.value*100).toFixed(2) +'%';
        // text += '\n'+'眼轴长度：' + data.value +'mm';
     
        return text
      },
      textStyle:{
        fontSize:12,
      },
    },
    legend: [
      {
        data: ['右眼', '趋势参考线'],
        selectedMode: true,
        right: 'center',
        top: 20
      },
    ],
    grid: {
      top: 80,
      left: 26,
      right: 34,
      bottom: 40,
      containLabel: true
    },
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
        formatter: function (value, index) {
          let xDate = value.replace(/-/g, "")
          return xDate;
        }
      },
      name: '时间',
      nameLocation: 'end',
      nameTextStyle:{
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 12,
        color: '#15c295'
      }
    }],
    yAxis: [{
      type: 'value',
      boundaryGap: false,
      // formatter: '{value}',
      axisLabel: {
        formatter(value, index) {
          return value > 0 ?(value* 100) + '%':0
        }
      },
      name: 'AL百分位(%)',
      nameLocation: 'end',
      nameTextStyle:{
        fontSize: 12,
        align: 'center',
        verticalAlign: 'bottom',
        color: '#15c295',
      },
      
    }],
    dataZoom: [
      {
        type: 'inside',
        startValue: xArr[xArr.length -showCount] ? xArr[xArr.length -showCount] : xArr[0],
        endValue: xArr[xArr.length -1],
        // startValue: '2024-09-01',
        zoomLock: true
      },
      {
        type: 'slider',
        height: 18,
        bottom: 10,
        labelFormatter: function (value, k) {
          return k.replace(/-/g, "");
        }
        // backgroundColor: 'rgba(78,211,161,0.1)'
        // borderColor: 'rgba(78,211,161,0.1)',
        // fillerColor: 'rgba(78,211,161,0.4)'
      }
    ],
    series: series,
    visualMap: [{
      type: 'piecewise',
      show: false,
      dimension: 0,
      seriesIndex: 2,
      pieces,
      // outOfRange: {
      //   symbolSize: 4,
      //   color: 'blue',
      //   // colorAlpha:
      // }
    }],
  };
  return result
}

// 左眼
function getBarOptionLeft(index) {
  let {vision} = _this.data;
  // vision.r = demo;
  // vision.l = demo;
  // console.log(vision.r,'=================')
  const visionCur = vision.l;
  const points = visionCur.points;
  const arrows = visionCur.arrows;
  var xArr = [], yArrRightAxis = [],  yArrRightAxisLast = [], links = [], markLine=[],pieces = [];

  xArr = points.map(i => { return i.time });
  // console.log('xArr=',xArr)
  // .replace(/-/g, "")

  if (visionCur && points) {
    let pointObj = {}
    points.map((item, i) => { 
        pointObj[item.time] = item
        yArrRightAxis.push({
            value: item.AL_percentage || null,
            AL: item.AL || null,
            name: item.time
        })
    });

    var arrowsCount = arrows.length;
    arrows.map((item, i) => { 
        // 箭头走向
        links.push({
          source: i,
          target: i + 1,
          label: {
            show: true,
            position: 'middle',
            formatter: function(params) {
              // console.log(params,'===============1111')
              const d = params.data;
              let text = 'AL增长:' + d.AL_growth.toFixed(2) + 'mm';
              text += '\n年增长:' + d.AL_growth_yearly.toFixed(2) + 'mm/年';
              // text += '\n治疗:无';
              // text += '\n日期:' + d.name.replace(/-/g, "");
              return text;
            },
            color: '#424141',
            borderWidth: 0,
            borderColor: 'transparent',
            backgroundColor: 'rgba('+colorbg[item.type_code] +',0.2)',
            padding: [3, 3],
            fontSize: 10,
            lineHeight: 14,
            // align: 'left',
            shadowColor: 'rgba(0,0,0, 0.3)',
            shadowBlur: 5
          },
          lineStyle: {
            width: 3,
            opacity: 0.8,
            color: color[item.type_code]
          },
          ...item,
        })

        // 视觉映射-背景颜色
        pieces.push({
          gt: i,
          lt: i+1,
          color: 'rgba('+colorbg[item.type_code] +',0.2)'
        })

        // 折线X轴markLine
        markLine.push({
          xAxis: i 
        })

        // 箭头走向Data
        let obj = {
            name: item.time_start,
            value: pointObj[item.time_start].AL_percentage,
        }
        yArrRightAxisLast.push(obj);

        // 最后一个的时候
        if(i === arrowsCount-1) {
          let obj = {
            name: item.time_end,
            value: pointObj[item.time_end].AL_percentage,
          }
          yArrRightAxisLast.push(obj);
        }
    });

    // console.log('yArrRightAxisLast=',yArrRightAxisLast,markLine)
  }
  
  var lineArr = [
    {
    name: '左眼',
    type: 'line',
    smooth: false,
    // symbol: 'none',
    // symbolSize: 8,
    color: 'blue',
    z: 60,
    data: yArrRightAxis,
    lineStyle: {
      width: 1.5,
      color: 'blue',
    },
    label: {
      show: true,
      // position:'insideTopRight',
      offset: [-40, 0],
      formatter: function(params) {
        const d = params.data;
        let text = 'AL:' + d.AL + 'mm';
        text += '\n屈光度:' + d.AL + 'D';
        text += '\n百分位:' + (d.value*100).toFixed(2) + '%';
        text += '\n日期:' + d.name.replace(/-/g, "");
        return text;

      },
      color: '#424141',
      borderWidth: 0,
      borderColor: '#5f5f5f',
      backgroundColor: 'rgba(255, 255,255, 0.9)',
      padding: [3, 3],
      fontSize: 10,
      lineHeight: 16,
      align: 'left',

      shadowColor: 'rgba(0,0,0, 0.3)',
      shadowBlur: 5
    },
  },
  {
    name: '趋势参考线',
    type: 'graph',
    layout: 'none',
    coordinateSystem: 'cartesian2d',
    symbolSize: 0,
    edgeSymbol: ['circle', 'arrow'],
    edgeSymbolSize: [4, 10],
    data: yArrRightAxisLast,
    links: links,
    z: 61,
    label: {
      show: false,
    },
  },
  {
    name: '左眼映射',
    type: 'line',
    smooth: false,
    symbol: 'none',
    // symbolSize: 8,
    color: 'rgba(0,0,0,0)',
    z: 59,
    data: yArrRightAxisLast,
    lineStyle: {
      width: 1.5,
      color: 'rgba(0,0,0,0)',
    },
    label: {
      show: false,
    },
    markLine: {
      symbol: ['none', 'none'],
      label: { show: false },
      data: markLine
    },
    areaStyle: {},
  },
]

  var series = lineArr;
  const result = {
    title: {
      show: true,
      text: 'AL增长随时间变化',
      left: 'center',
      textStyle: {
        color: '#a1a1a1',
        fontSize: 12,
        fontWeight: 'normal',
      }
    },
    tooltip: {
      show: false,
      trigger: 'none', //axis
      z: 70,
      axisPointer: {
        type: 'cross', 
        label: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          formatter(params) {
            if (params.axisDimension === 'y') {
              let val = (params.value).toFixed(2)
              return val;
            } else {
              return params.value
            }
            // console.log(params,'=========')
          }
        },
      },
      formatter(params) {
        if (params.componentIndex === 1) return
        var data =  params.data;
        var text = '';
        // percentage: item.AL_percentage || null,
        // grow: item.AL_grow || null,
        // growYear: item.AL_grow_year || null,
        

        text += '眼轴长度：' + data.AL +'mm';
        text += '\n'+'百分比：' + (data.value*100).toFixed(2) +'%';
        // text += '\n'+'眼轴长度：' + data.value +'mm';
     
        return text
      },
      textStyle:{
        fontSize:12,
      },
    },
    legend: [
      {
        data: ['右眼', '趋势参考线'],
        selectedMode: true,
        right: 'center',
        top: 20
      },
    ],
    grid: {
      top: 80,
      left: 26,
      right: 34,
      bottom: 40,
      containLabel: true
    },
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
        formatter: function (value, index) {
          let xDate = value.replace(/-/g, "")
          return xDate;
        }
      },
      name: '时间',
      nameLocation: 'end',
      nameTextStyle:{
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 12,
        color: '#15c295'
      }
    }],
    yAxis: [{
      type: 'value',
      boundaryGap: false,
      // formatter: '{value}',
      axisLabel: {
        formatter(value, index) {
          return value > 0 ?(value* 100) + '%':0
        }
      },
      name: 'AL百分位(%)',
      nameLocation: 'end',
      nameTextStyle:{
        fontSize: 12,
        align: 'center',
        verticalAlign: 'bottom',
        color: '#15c295',
      },
      
    }],
    dataZoom: [
      {
        type: 'inside',
        startValue: xArr[xArr.length -showCount] ? xArr[xArr.length -showCount] : xArr[0],
        endValue: xArr[xArr.length -1],
        // startValue: '2024-09-01',
        zoomLock: true
      },
      {
        type: 'slider',
        height: 18,
        bottom: 10,
        labelFormatter: function (value, k) {
          return k.replace(/-/g, "");
        }
        // backgroundColor: 'rgba(78,211,161,0.1)'
        // borderColor: 'rgba(78,211,161,0.1)',
        // fillerColor: 'rgba(78,211,161,0.4)'
      }
    ],
    series: series,
    visualMap: [{
      type: 'piecewise',
      show: false,
      dimension: 0,
      seriesIndex: 2,
      pieces,
      // outOfRange: {
      //   symbolSize: 4,
      //   color: 'blue',
      //   // colorAlpha:
      // }
    }],
  };
  return result
}


var demo = {
  "arrows": [{
      "AL_growth": 0.5,
      "AL_growth_yearly": 1.2094370860927153,
      "age_difference": 0.4134154688569473,
      "time_start": "2023-01-01",
      "time_end": "2023-06-01",
      "type_code": 2
    },
    {
      "AL_growth": 0.0,
      "AL_growth_yearly": 0.0,
      "age_difference": 0.5010266940451745,
      "time_start": "2023-06-01",
      "time_end": "2023-12-01",
      "type_code": 0
    },
    {
      "AL_growth": 0.1999999999999993,
      "AL_growth_yearly": 0.39918032786885105,
      "age_difference": 0.5010266940451745,
      "time_start": "2023-12-01",
      "time_end": "2024-06-01",
      "type_code": 1
    },



  ],
  "points": [{
      "AL": 22.5,
      "AL_percentage": 0.14,
      "time": "2023-01-01"
    },
    {
      "AL": 23.0,
      "AL_percentage": 0.3,
      "time": "2023-06-01"
    },
    {
      "AL": 24.0,
      "AL_percentage": 0.25,
      "time": "2023-12-01"
    },
    {
      "AL": 24.0,
      "AL_percentage": 0.67,
      "time": "2024-06-01"
    },

    {
      "AL": 16.0,
      "AL_percentage": 0.57,
      "time": "2024-07-01"
    },
    {
      "AL": 93.0,
      "AL_percentage": 0.87,
      "time": "2024-08-01"
    },
    {
      "AL": 56.0,
      "AL_percentage": 0.5,
      "time": "2024-09-01"
    },
    
  ],
  "y_axis_range": {
    "max": 0.67,
    "min": 0.14
  }
};

