// components/report/report.js

let _this = null;
import * as echarts from '../../components/ec-canvas/echarts';
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

    ecLine: {
      onInit: function (canvas, width, height, dpr) {
        var lineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(lineChart);
        // console.log(_this.data.vision)
        // var obj = _this.data.vision[0];
        // var index = canvas.canvasId.replace('mychart-dom-line'+obj.id+'-','');
        // console.log('index='+obj.id)
        lineChart.setOption(getBarOption(0));

        return lineChart;
      }
    },

  },

  /**
   * 组件的方法列表
   */
  methods: {
    visionChange: function(newVal, oldVal) {
      // console.log(newVal, oldVal);
    }
  }
})


function getBarOption(index) {
  var {vision} = _this.data;
  var currentCharts = vision.reverse();

  var xArr = [], yArrLeftS= [], yArrRightS = [], yArrLeftC= [], yArrRightC = [], count = currentCharts.length;

  xArr = currentCharts.map(i => { return i.inspectDate.replace(/-/g, '') });

  currentCharts.map((item, i) => { 
    item.rightDiopterS = parseFloat(item.rightDiopterS);
    item.leftDiopterS = parseFloat(item.leftDiopterS);
    item.rightDiopterC = parseFloat(item.rightDiopterC);
    item.leftDiopterC = parseFloat(item.leftDiopterC);

    yArrRightS.push(item.rightDiopterS <= 0 ? Math.abs(item.rightDiopterS): '-'+item.rightDiopterS)
    
    yArrLeftS.push(item.leftDiopterS <= 0 ? Math.abs(item.leftDiopterS): '-'+item.leftDiopterS)

    yArrRightC.push(item.rightDiopterC <= 0 ? Math.abs(item.rightDiopterC): '-'+item.rightDiopterC)
    
    yArrLeftC.push(item.leftDiopterC <= 0 ? Math.abs(item.leftDiopterC): '-'+item.leftDiopterC)
    
  });
  

  // console.log(yArrRightS, yArrLeftS,yArrRightC, yArrLeftC)
  var lineArr = [
    {
    name: '右眼球镜度数(D)',
    type: 'line',
    smooth: false,
    // stack: 'a',
    color: '#22be80',
    z: 60,
    data: yArrRightS,
    label: {},
    lineStyle: {
      width: 2
    },
  },
  {
    name: '左眼球镜度数(D)',
    type: 'line',
    smooth: false,
    // stack: 'a',
    data: yArrLeftS,
    color: '#fac858',
    z: 61,
    label: {},
    lineStyle: {
      width: 2
    },
  },
  {
    name: '右眼柱镜度数(D)',
    type: 'line',
    smooth: false,
    // stack: 'a',
    data: yArrRightC,
    color: '#222dbe',
    z: 62,
    label: {},
    lineStyle: {
      width: 2
    },
  },
  {
    name: '左眼柱镜度数(D)',
    type: 'line',
    smooth: false,
    // stack: 'a',
    data: yArrLeftC,
    color: '#229fbe',
    z: 63,
    label: {},
    lineStyle: {
      width: 2
    },
  }]

  var series = lineArr;
  // console.log(series)
  return {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      z: 70,
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
            // console.log(params,'=========')
          }
        },
      },
      formatter(params) {
        var text = '检查日期：' + (params[0].name);
        for(var i = 0; i < params.length; i++) {
          text += '\n'+params[i].seriesName+'：' + (params[i].value <=0 ? Math.abs(params[i].value):'-'+params[i].value);
        }
        // return value > 0 ? '-'+value: Math.abs(value)
        return text
      },
      textStyle:{
        fontSize:12,
      },
    },
    legend: [
      {
        data: ['右眼球镜度数(D)', '左眼球镜度数(D)','右眼柱镜度数(D)', '左眼柱镜度数(D)'],
        selectedMode: true,
        left: 10,
      },
    ],
    grid: {
      top: 80,
      left: '4%',
      right: 34,
      bottom: '3%',
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
      },
      name: '日期',
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
          var val = value <= 0 ? Math.abs(value):'-'+value;
          return val
        }
      },
      name: '屈光度(D)',
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