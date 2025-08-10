// components/report/report.js

let _this = null;
import * as echarts from '../../components/ec-canvas/echarts';
const util = require('../../utils/util.js');
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
            type: Object,
            value: {},
            observer: "visionChange"
        },
        reports: {
            type: Array,
            value: [],
            observer: "reportsChange"
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

        formobj: {}
    },

    /**
     * 组件的方法列表
     */
    methods: {
        visionChange: function (newVal, oldVal) {
            if (newVal) {
                console.log(newVal);
                this.setData({
                    userArchiveId: newVal.l.id || newVal.r.id,
                })
            }
        },
        reportsChange: function (newVal, oldVal) {
            // console.log('reportListChange', newVal, oldVal);
            if (newVal) {
                let record = {}
                newVal.map((item) => {
                    let measures = [];
                    if (item.glassesType !== '') measures.push(item.glassesType)
                    if (item.otherSolution !== '') measures.push(item.otherSolution)
                    record[item.inspectDate] = {
                        inspectDate: item.inspectDate,
                        id: item.id,
                        measures: measures.join(',')
                    };
                })
                // console.log('record=', record)
                this.setData({
                    record
                })
            }
        },
        getData() {


        },

        tapCancel() {
            this.setData({
                isShow: false
            })
        },
        tapUpdate() {
            this.tapCancel();
            const {
                userArchiveId,
                record,
                formobj
            } = this.data;
            wx.navigateTo({
                url: '/pages/addCheck/addCheck?userArchiveId=' + userArchiveId + '&id=' + record[formobj.inspectDate].id,
            })
        },
    }
})

// 箭头颜色，提示框背景颜色
var color = {
        0: 'green',
        1: 'yellow',
        2: 'red'
    },
    colorbg = {
        0: '0,127,2',
        1: '253,253,2',
        2: '250,20,25'
    };

// alY轴边界值
var alMaxMin = [20, 28]

// 右眼
function getBarOptionRight(index) {
    let {
        vision
    } = _this.data;

    // console.log(vision.r, '=================')
    const visionCur = vision.r;
    let points = visionCur.points;
    let arrows = visionCur.arrows;
    const background = JSON.parse(visionCur.background);
    // console.log('background=',background)
    var xArr = [],
        bgLineArr = [],
        yArrRightAxis = [],
        links = [],
        markLine = [],
        pieces = [];

    for (let i = 3; i <= 18; i++) {
        xArr.push(i)
    }

    let maxHasValIndex = 6, minHasValIndex = 0
    if (visionCur && points) {
        // 每个点代表一个时间记录点
        let pointObj = {}
        points.map((item, i) => {
            points[i].AL = getALMaxMin(item.AL)
            // const ageObj = util.calculateAgeDecimal(visionCur.birth, item.time);
            const age = calculateBirthdayDecimal(visionCur.birth, item.time);
            points[i].age = age;
            points[i].ageText = convertToAgeNum(age);
            if (arrows[i]) {
                points[i].type_code = arrows[i].type_code
            }
        })
        pointObj = groupByIntValue(points, 'ageText')
        const pointYear = points.map(item => item.age)
        xArr = util.mergeAndUnique(xArr.concat(pointYear))
        xArr = convertToAge(xArr)

        // 背景折现
        bgLineArr = getBg(background, xArr)

        xArr.map((item, index) => {
            const isAge = pointObj[item];
            let curItem = {};
            if (isAge) curItem = isAge[isAge.length - 1]
            let obj = {
                value: curItem.AL || null,
                AL_percentage: curItem.AL_percentage || null,
                time: curItem.time || null,
                age: curItem.age || item,
                index
            }
            if (curItem.type_code != undefined) {
                obj.type_code = curItem.type_code
            }
            yArrRightAxis.push(obj)
        })

        // 每个箭头代表相邻两个点之间的变化
        yArrRightAxis.map((item, i) => {
            if (item.value) {
                const nextItem = findNextWithValue(yArrRightAxis, i, 'value');
                if (nextItem) {
                    maxHasValIndex = nextItem.index;
                    // 箭头走向
                    const typeCode = item.type_code || 0;
                    links.push({
                        source: i,
                        target: nextItem.index,
                        label: {
                            show: true,
                            position: 'middle',
                            formatter: function (params) {
                                // console.log(params,'===============1111')
                                const d = params.data;
                                let text = '' + (d.AL_growth > 0 ? '+' + d.AL_growth.toFixed(2) : d.AL_growth.toFixed(2)) + '';
                                return text;
                            },
                            color: '#424141',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(' + colorbg[typeCode] + ',0.2)',
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
                            color: color[typeCode]
                        },
                        AL_growth: nextItem.value - item.value,
                        ...item,
                    })

                    // 视觉映射-背景颜色
                    pieces.push({
                        gt: i,
                        lt: nextItem.index,
                        color: 'rgba(' + colorbg[typeCode] + ',0.2)'
                    })

                    // 折线X轴markLine
                    markLine.push({
                        xAxis: i,
                        ...item,
                    })


                }
            }
        });

        console.log('right links=', links)
    }

    var lineArr = [{
            name: '右眼',
            type: 'line',
            connectNulls: true,
            smooth: false,
            // symbol: 'none',
            symbolSize: 8,
            color: 'blue',
            z: 60,
            data: yArrRightAxis,
            lineStyle: {
                width: 1.5,
                color: 'blue',
            },
            label: {
                show: false,
                // position:'insideTopRight',
                offset: [-40, 0],
                formatter: function (params) {
                    const d = params.data;
                    let text = 'AL:' + d.values + 'mm';
                    text += '\n百分位:' + (d.AL_percentage * 100).toFixed(2) + '%';
                    text += '\n日期:' + d.time.replace(/-/g, "");
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
            // markArea: {
            //     silent: true,
            //     itemStyle: {
            //         borderColor: '#ff0000'
            //     }
            // }
        },
        {
            name: '趋势参考线',
            type: 'graph',
            // layout: 'none',
            coordinateSystem: 'cartesian2d',
            symbolSize: 0,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            data: yArrRightAxis,
            links: links,
            z: 61,
            label: {
                show: false,
            },
            axisLine: {
                show: false
            }
        },
        {
            name: '右眼映射',
            type: 'line',
            connectNulls: true,
            smooth: false,
            symbol: 'none',
            // symbolSize: 8,
            color: 'rgba(0,0,0,0)',
            z: 59,
            data: yArrRightAxis,
            lineStyle: {
                width: 1.5,
                color: 'rgba(0,0,0,0)',
            },
            label: {
                show: false,
            },
            markLine: {
                symbol: ['none', 'none'],
                label: {
                    show: false
                },
                data: markLine
            },
            areaStyle: {},
        },
    ]

    minHasValIndex = maxHasValIndex - 5 < 0 ? 0:maxHasValIndex - 5;
    var series = lineArr.concat(bgLineArr);
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
            show: true,
            trigger: 'item', //none
            z: 70,
            axisPointer: {
                type: 'none',
                label: {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    formatter(params) {
                        if (params.axisDimension === 'y') {
                            let val = (params.value).toFixed(2)
                            return val;
                        } else {
                            return params.value
                        }
                    }
                },
            },
            formatter(params) {
                // if (params.componentIndex === 1) return
                const {
                    record
                } = _this.data;
                var p0 = params.data;
                var text = '';
                // console.log(p0.time, record)

                if (record[p0.time]) {
                    let formobj = {}
                    formobj.inspectDate = p0.time;
                    _this.setData({
                        formobj,
                        isShow: true
                    })
                    // text += '日期1：' + p0.time;
                    // text += '\n防控办法：' + (record[p0.time].measures||'暂无');
                    // return text
                }
            },
            // split
            textStyle: {
                fontSize: 12,
            },
        },
        legend: [{
            data: ['右眼', '趋势参考线'],
            selectedMode: true,
            right: 'center',
            top: 20
        }, ],
        grid: {
            top: 80,
            left: 26,
            right: 34,
            bottom: 40,
            containLabel: true
        },
        dataZoom: [{
                type: 'slider',
                height: 18,
                bottom: 10,
                show: true,
                realtime: true,
                startValue: minHasValIndex,
                endValue: maxHasValIndex
            },
            {
                type: 'inside',
                realtime: true,
                startValue: minHasValIndex,
                endValue: maxHasValIndex
            }
        ],
        xAxis: [{
            type: 'category',
            // 让点落在x轴的刻度上，而不是刻度之间
            boundaryGap: false,
            data: xArr,
            splitLine: {
                show: true,
                interval: 2,
                lineStyle: {
                    //   color: ['#aaa', '#ddd']
                    color: ['rgba(170,170,170, 0.1)']
                }
            },
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
                interval: 0, // 设置为 0 表示显示所有标签
                // rotate: -90,
                // formatter: function (value, index) {
                //     // 隐藏第3个和第7个标签
                //     if (index === 0 || index === 1) {
                //         return '';
                //     }
                //     return value;
                // }
            },
            name: '年龄',
            nameLocation: 'end',
            nameTextStyle: {
                align: 'center',
                verticalAlign: 'middle',
                fontSize: 12,
                color: '#15c295'
            }
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: false,
            min: alMaxMin[0],
            max: alMaxMin[1],
            //   interval: 4,
            // formatter: '{value}',
            //   axisLabel: {
            //     formatter(value, index) {
            //       return value > 0 ?(value* 100) + '%':0
            //     }
            //   },
            name: '眼轴(AL)',
            nameLocation: 'end',
            splitLine: {
                show: true,
                lineStyle: {
                    //   color: ['#aaa', '#ddd']
                    color: ['rgba(170,170,170, 0.1)']
                }
            },
            nameTextStyle: {
                fontSize: 12,
                align: 'center',
                verticalAlign: 'bottom',
                color: '#15c295',
            },
            axisLine: {
                show: true,
                // onZero: false, // x轴线始终在底部 刻度轴上-重点
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
            },

        }],
        series: series,
        visualMap: [{
            type: 'piecewise',
            show: false,
            dimension: 0,
            seriesIndex: 2,
            hoverLink: false,
            pieces,
        }],
    };
    return result
}


// 背景折线图
function getBg(background, xArr = []) {
    let bgArr = [];
    const centiles = background.centiles;
    const data = background.data;
    const age = background.age;
    let centilesObj = {};
    centiles.map((item, index) => {
        centilesObj[item] = {};
        data.map((ditem, i) => {
            centilesObj[item][age[i] + '岁'] = ditem[index];
        })
    })

    centiles.map((item, index) => {
        let yarr = [];
        for (let i = 0; i < xArr.length; i++) {
            yarr.push(centilesObj[item][xArr[i]] || null)
        }
        yarr = replaceNullsWithNextValues(yarr)
        // console.log(replaceNullsWithNextValues(yarr),'======')
        bgArr.push({
            name: item,
            type: 'line',
            connectNulls: true,
            smooth: false,
            symbol: 'none',
            // symbolSize: 8,
            color: 'blue',
            z: 1 + index,
            data: yarr,
            lineStyle: {
                width: 1,
                color: (index === 0 || index === Math.ceil((centiles.length / 2) - 1) || index === centiles.length - 1) ? 'rgba(0,0,0, 0.5)' : 'rgba(204, 204, 204, 0.6)',
            },
            label: {
                show: false
            },
        })
    })
    return bgArr
}

// 循环对象数组且找到下一个有值的对象
function findNextWithValue(array, currentIndex, k) {
    for (let i = currentIndex + 1; i < array.length; i++) {
        if (array[i][k] !== null && array[i][k] !== undefined) {
            return array[i];
        }
    }
    return null; // 如果没有找到，返回 null
}

// al超过边界取值20-28
function getALMaxMin(AL) {
    if (AL > alMaxMin[1]) {
        return alMaxMin[1]
    } else if (AL < alMaxMin[0]) {
        return alMaxMin[0]
    } else {
        return AL
    }
}
// 左眼
function getBarOptionLeft(index) {
    let {
        vision
    } = _this.data;
    // console.log(vision.l, '=================')
    const visionCur = vision.l;
    let points = visionCur.points;
    let arrows = visionCur.arrows;
    const background = JSON.parse(visionCur.background);
    //  console.log('background=',background)
    var xArr = [],
        bgLineArr = [],
        yArrRightAxis = [],
        links = [],
        markLine = [],
        pieces = [];

    for (let i = 3; i <= 18; i++) {
        xArr.push(i)
    }

    let maxHasValIndex = 6, minHasValIndex = 0
    if (visionCur && points) {
        // 每个点代表一个时间记录点
        let pointObj = {}
        points.map((item, i) => {
            points[i].AL = getALMaxMin(item.AL)
            // const ageObj = util.calculateAgeDecimal(visionCur.birth, item.time);
            const age = calculateBirthdayDecimal(visionCur.birth, item.time);
            points[i].age = age;
            points[i].ageText = convertToAgeNum(age);
            if(arrows[i]) {
                points[i].type_code = arrows[i].type_code
            }
        })
        pointObj = groupByIntValue(points, 'ageText')
        const pointYear = points.map(item => item.age)
        xArr = util.mergeAndUnique(xArr.concat(pointYear))
        xArr = convertToAge(xArr)

        // 背景折现
        bgLineArr = getBg(background, xArr)

        xArr.map((item, index) => {
            const isAge = pointObj[item];
            let curItem = {};
            if (isAge) curItem = isAge[isAge.length - 1]
            let obj = {
              value: curItem.AL || null,
              AL_percentage: curItem.AL_percentage || null,
              time: curItem.time || null,
              age: curItem.age || item,
              index
            }
            if(curItem.type_code != undefined) {
              obj.type_code = curItem.type_code
            }
            yArrRightAxis.push(obj)
        })

        // 每个箭头代表相邻两个点之间的变化
        yArrRightAxis.map((item, i) => {
            if (item.value) {
                const nextItem = findNextWithValue(yArrRightAxis, i, 'value');
                if (nextItem) {
                    maxHasValIndex = nextItem.index;
                    // 箭头走向
                    const typeCode = item.type_code || 0;
                    links.push({
                        source: i,
                        target: nextItem.index,
                        label: {
                            show: true,
                            position: 'middle',
                            formatter: function (params) {
                                // console.log(params,'===============1111')
                                const d = params.data;
                                let text = '' + (d.AL_growth > 0 ? '+' + d.AL_growth.toFixed(2) : d.AL_growth.toFixed(2)) + '';
                                return text;
                            },
                            color: '#424141',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(' + colorbg[typeCode] + ',0.2)',
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
                            color: color[typeCode]
                        },
                        AL_growth: nextItem.value - item.value,
                        ...item,
                    })

                    // 视觉映射-背景颜色
                    pieces.push({
                        gt: i,
                        lt: nextItem.index,
                        color: 'rgba(' + colorbg[typeCode] + ',0.2)'
                    })

                    // 折线X轴markLine
                    markLine.push({
                        xAxis: i,
                        ...item,
                    })


                }
            }
        });

        // console.log('right links=', links)
    }

    var lineArr = [{
            name: '左眼',
            type: 'line',
            connectNulls: true,
            smooth: false,
            // symbol: 'none',
            symbolSize: 8,
            color: 'blue',
            z: 60,
            data: yArrRightAxis,
            lineStyle: {
                width: 1.5,
                color: 'blue',
            },
            label: {
                show: false,
                // position:'insideTopRight',
                offset: [-40, 0],
                formatter: function (params) {
                    const d = params.data;
                    let text = 'AL:' + d.values + 'mm';
                    text += '\n百分位:' + (d.AL_percentage * 100).toFixed(2) + '%';
                    text += '\n日期:' + d.time.replace(/-/g, "");
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
            // markArea: {
            //     silent: true,
            //     itemStyle: {
            //         borderColor: '#ff0000'
            //     }
            // }
        },
        {
            name: '趋势参考线',
            type: 'graph',
            layout: 'none',
            coordinateSystem: 'cartesian2d',
            symbolSize: 0,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            data: yArrRightAxis,
            links: links,
            z: 61,
            label: {
                show: false,
            },
        },
        {
            name: '左眼映射',
            type: 'line',
            connectNulls: true,
            smooth: false,
            symbol: 'none',
            // symbolSize: 8,
            color: 'rgba(0,0,0,0)',
            z: 59,
            data: yArrRightAxis,
            lineStyle: {
                width: 1.5,
                color: 'rgba(0,0,0,0)',
            },
            label: {
                show: false,
            },
            markLine: {
                symbol: ['none', 'none'],
                label: {
                    show: false
                },
                data: markLine
            },
            areaStyle: {},
        },
    ]

    minHasValIndex = maxHasValIndex - 5 < 0 ? 0:maxHasValIndex - 5;
    var series = lineArr.concat(bgLineArr);
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
            show: true,
            trigger: 'item', //none
            z: 70,
            axisPointer: {
                type: 'none',
                label: {
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    formatter(params) {
                        if (params.axisDimension === 'y') {
                            let val = (params.value).toFixed(2)
                            return val;
                        } else {
                            return params.value
                        }
                    }
                },
            },
            formatter(params) {
                // console.log(params)
                // if (params.componentIndex === 1) return
                const {
                    record
                } = _this.data;
                var p0 = params.data;
                var text = '';

                if (record[p0.time]) {
                    let formobj = {}
                    formobj.inspectDate = p0.time;
                    _this.setData({
                        formobj,
                        isShow: true
                    })
                    // text += '日期1：' + p0.time;
                    // text += '\n防控办法：' + (record[p0.time].measures||'暂无');
                    // return text
                }
            },
            // split
            textStyle: {
                fontSize: 12,
            },
        },
        legend: [{
            data: ['左眼', '趋势参考线'],
            selectedMode: true,
            right: 'center',
            top: 20
        }, ],
        grid: {
            top: 80,
            left: 26,
            right: 34,
            bottom: 40,
            containLabel: true
        },
        dataZoom: [{
                type: 'slider',
                height: 18,
                bottom: 10,
                show: true,
                realtime: true,
                startValue: minHasValIndex,
                endValue: maxHasValIndex
            },
            {
                type: 'inside',
                realtime: true,
                startValue: minHasValIndex,
                endValue: maxHasValIndex
            }
        ],
        xAxis: [{
            type: 'category',
            // 让点落在x轴的刻度上，而不是刻度之间
            boundaryGap: false,
            data: xArr,
            splitLine: {
                show: true,
                interval: 2,
                lineStyle: {
                    //   color: ['#aaa', '#ddd']
                    color: ['rgba(170,170,170, 0.1)']
                }
            },
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
                interval: 0, // 设置为 0 表示显示所有标签
                // rotate: -45,
                // formatter: function (value, index) {
                //   let xDate = value.replace(/-/g, "")
                //   return xDate;
                // }
            },
            name: '年龄',
            nameLocation: 'end',
            nameTextStyle: {
                align: 'center',
                verticalAlign: 'middle',
                fontSize: 12,
                color: '#15c295'
            }
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: false,
            min: alMaxMin[0],
            max: alMaxMin[1],
            //   interval: 4,
            // formatter: '{value}',
            //   axisLabel: {
            //     formatter(value, index) {
            //       return value > 0 ?(value* 100) + '%':0
            //     }
            //   },
            name: '眼轴(AL)',
            nameLocation: 'end',
            splitLine: {
                show: true,
                lineStyle: {
                    //   color: ['#aaa', '#ddd']
                    color: ['rgba(170,170,170, 0.1)']
                }
            },
            nameTextStyle: {
                fontSize: 12,
                align: 'center',
                verticalAlign: 'bottom',
                color: '#15c295',
            },
            axisLine: {
                show: true,
                // onZero: false, // x轴线始终在底部 刻度轴上-重点
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
                // formatter: function (value, index) {
                //   let xDate = value.replace(/-/g, "")
                //   return xDate;
                // }
            },

        }],
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

// 数组对象根据字段分组
function groupByIntValue(data, field) {
    return data.reduce((acc, item) => {
        const intValue = item[field];
        if (!acc[intValue]) {
            acc[intValue] = [];
        }
        acc[intValue].push(item);
        return acc;
    }, {});
}

function replaceNullsWithNextValues(arr) {
    let nextValue = null; // 用于存储下一个非null的值

    // 从后向前遍历数组
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] !== null) {
            nextValue = arr[i]; // 更新nextValue为当前非null值
        } else {
            arr[i] = nextValue; // 将null替换为nextValue
        }
    }

    return arr;
}

// 将生日变成小数
function calculateBirthdayDecimal(birthDate, targetDate) {
    // 将日期字符串转换为 Date 对象
    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    // 计算两个日期之间的差值
    const yearsDiff = target.getFullYear() - birth.getFullYear();
    const monthsDiff = target.getMonth() - birth.getMonth();
    const daysDiff = target.getDate() - birth.getDate();

    // 调整月份和天数的差值
    let totalMonths = monthsDiff;
    if (daysDiff < 0) {
        totalMonths -= 1;
    }

    // 计算总的小数年份
    const decimalYears = yearsDiff + (totalMonths / 12);

    return decimalYears;
}
// 讲数组中的值变成年月文字
function convertToAge(arr) {
    const newArr = arr.map(num => {
        return convertToAgeNum(num)
    })
    return newArr;
}

// 将数的值变成年月文字
function convertToAgeNum(num) {
    if (Number.isInteger(num)) {
        return num + '岁'; // 如果是整数，直接返回
    } else {
        const years = Math.floor(num);
        const months = Math.round((num - years) * 12);
        return `${years}岁${months}月`;
    }
}