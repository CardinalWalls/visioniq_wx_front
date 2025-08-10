// pages/doctor/archivesDetail/archivesDetail.js
const app = getApp();
const appg = app.globalData;
const http = require('../../../utils/http.js');
const util = require('../../../utils/util.js');
const config = require('../../../utils/config.js');

let _this = null,
    opts = {};
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nvabarData: {
            title: "档案详情",
            type: 0
        },

        datas: {
            pageNum: 1,
            pageSize: 100
        },

        // 已转换视力报告图，l 左，r 右,档案列表对应的视力报告
        vision: [],
    },

    // 打开风险评估弹窗
    tapRisk(e) {
        const {
            type
        } = e.currentTarget.dataset
        let {
            vision,
            d
        } = _this.data;
        if (d.total == 0 && type !== 'speed') {
            app.toast({
                title: '录入检查单后才能评估'
            })
        } else {
            app.toast({
                title: '数据生成中，稍后再试'
            })
        }


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        _this = this;
        opts = options;
        let {
            datas
        } = _this.data;
        datas.userArchiveId = opts.userArchiveId
        _this.setData({
            navheight: appg.navheight,
            datas
        });

    },
    /**
     * @method 登录接口执行完成后，才执行的数据初始化
     * 
     */
    minuserChange() {
        _this.setData({
            minuser: wx.getStorageSync('minuser'),
            isLogin: util.isMinuser()
        });

        if (!util.isMinuser()) {
            wx.reLaunch({
                url: '/pages/login/login',
            })
            return;
        }

        // 档案详情
        http.userArchiveDetail(opts.userArchiveId).then(res => {
            res.age = util.calculateAge(res.birth)
            _this.setData({
                archive: res
            })

            _this.getData(_this.data.datas)
        })


    },
    /**
     * @method getData
     * @param 
     * 
     */
    getData(data, v) {
        http.userInspectReportPage(data).then(res => {
            if (v) {
                let d = _this.data.d;
                d.pageNum = res.pageNum;
                d.list = d.list.concat(res.list);

                let datas = _this.data.datas;
                datas.pageNum = res.pageNum;
                _this.setData({
                    d,
                    datas
                });
            } else {
                _this.setData({
                    d: res
                });

                let {
                    vision,
                    archive
                } = _this.data;
                if (res.total > 0 && archive.age <= 18) {
                    let storageVision = wx.getStorageSync('storageVision');
                    let storageSpeed = wx.getStorageSync('storageSpeed');
                    if (storageVision && storageVision[opts.userArchiveId] && storageSpeed && storageSpeed[opts.userArchiveId]) {
                        if (!vision[0]) vision[0] = {};
                        vision[0] = storageVision[opts.userArchiveId];
                        _this.setData({
                            vision,
                            speed: storageSpeed,
                        })
                        // 设置风险等级
                        _this.setRiskLevel(archive, vision[0].l.nearsight_level, function (level) {
                            archive.riskLevel = level;
                            _this.setData({
                                archive
                            })
                        })
                    } else {
                        _this.getVisionReport(0)
                    }
                } else {
                    let speed = {};
                    speed[opts.userArchiveId] = {
                        l: {},
                        r: {}
                    };
                    _this.setData({
                        speed
                    })
                }
            }
        })
    },

    /**
     * 历史眼轴发展指数、远视储备数据
     * 
     * 根据提供的档案信息、报告信息以及报告列表来获取相关的历叐数据。
     * 
     * @param {Object} archive - 档案对象，包含与档案相关的信息。
     * @param {Object} report - 报告对象，包含具体的报告详情。
     * @param {Array} reportList - 报告列表，包含多个报告对象的数组。
     * @returns {Array|Object} 返回历史记录数据，可能是数组或对象形式。
     */
    getHistory(archive, report, reportList) {
        let obj = {
            patient_id: report.id,
            gender: archive.gender,
            age: util.calculateAge(archive.birth)
        };

        let objL = {
                ...obj
            },
            objR = {
                ...obj
            };

        if (report.leftAxis != '') objL.AL = report.leftAxis;
        if (report.leftCurvatureRadius != '') objL.CR = report.leftCurvatureRadius;

        if (report.rightAxis != '') objR.AL = report.rightAxis;
        if (report.rightCurvatureRadius != '') objR.CR = report.rightCurvatureRadius;

        if (report.leftK1 != '') objL.K1 = report.leftK1;
        if (report.leftK2 != '') objL.K2 = report.leftK2;

        if (report.rightK1 != '') objR.K1 = report.rightK1;
        if (report.rightK2 != '') objR.K2 = report.rightK2;

        // 是否散瞳验光
        // 注意, CR和 K1\K2 不可同时缺省.
        // console.log('是否散瞳验光',report.dilatedRefraction)
        if (report.dilatedRefraction) {
            if (report.leftDiopterS !== '') objL.diopter_s_accurate = parseFloat(report.leftDiopterS);
            if (report.leftDiopterC !== '') objL.diopter_c_accurate = parseFloat(report.leftDiopterC);

            if (report.rightDiopterS !== '') objR.diopter_s_accurate = parseFloat(report.rightDiopterS);
            if (report.rightDiopterC !== '') objR.diopter_c_accurate = parseFloat(report.rightDiopterC);
        } else {
            if (report.leftDiopterS !== '') objL.diopter_s = parseFloat(report.leftDiopterS);
            if (report.leftDiopterC !== '') objL.diopter_c = parseFloat(report.leftDiopterC);

            if (report.rightDiopterS !== '') objR.diopter_s = parseFloat(report.rightDiopterS);
            if (report.rightDiopterC !== '') objR.diopter_c = parseFloat(report.rightDiopterC);
        }

        // history_AL_records 历史眼轴数据的列表
        // history_farsight_records 历史散瞳验光数据的列表
        let historyALRecordsLeft = [],
            historyALRecordsRight = [],
            historyFarsightRecordsLeft = [],
            historyFarsightRecordsRight = [];

        let fieldLeft = ['leftAxis', 'leftCurvatureRadius', 'leftK1', 'leftK2'],
            fieldRight = ['rightAxis', 'rightCurvatureRadius', 'rightK1', 'rightK2'],
            fieldObj = ['AL', 'CR', 'K1', 'K2'],

            ygFieldLeft = ['leftDiopterS', 'leftDiopterC'],
            ygFieldRight = ['rightDiopterS', 'rightDiopterC'],
            ygFieldObj = ['diopter_s_accurate', 'diopter_c_accurate'];

        let visionList = reportList;
        for (let i = 0; i < visionList.length; i++) {
            if (i < 20) {
                let cur = visionList[i];

                let curLeft = {
                        time: cur.inspectDate
                    },
                    curRight = {
                        time: cur.inspectDate
                    };
                for (let x = 0; x < fieldLeft.length; x++) {
                    for (let k in cur) {
                        if (k == fieldLeft[x] && cur[k] !== '') {
                            curLeft[fieldObj[x]] = parseFloat(cur[k]);
                            break;
                        }
                    }
                }

                for (let x = 0; x < fieldRight.length; x++) {
                    for (let k in cur) {
                        if (k == fieldRight[x] && cur[k] !== '') {
                            curRight[fieldObj[x]] = parseFloat(cur[k]);
                            break;
                        }
                    }
                }


                if (!(!curLeft.AL && !curLeft.CR && !curLeft.K1 && !curLeft.K2)) {
                    historyALRecordsLeft.push(curLeft)
                }

                if (!(!curRight.AL && !curRight.CR && !curRight.K1 && !curRight.K2)) {
                    historyALRecordsRight.push(curRight)
                }


                // 散瞳验光
                if (cur.dilatedRefraction) {
                    let ygCurLeft = {
                            time: cur.inspectDate
                        },
                        ygCurRight = {
                            time: cur.inspectDate
                        };
                    for (let x = 0; x < ygFieldLeft.length; x++) {
                        for (let k in cur) {

                            if (k == ygFieldLeft[x] && cur[k] !== '') {
                                ygCurLeft[ygFieldObj[x]] = parseFloat(cur[k]);
                                break;
                            }
                        }
                    }
                    for (let x = 0; x < ygFieldRight.length; x++) {
                        for (let k in cur) {
                            if (k == ygFieldRight[x] && cur[k] !== '') {
                                ygCurRight[ygFieldObj[x]] = parseFloat(cur[k]);
                                break;
                            }
                        }
                    }

                    if (!(!ygCurLeft.diopter_s_accurate && !ygCurLeft.diopter_c_accurate)) {
                        historyFarsightRecordsLeft.push(ygCurLeft)
                    }

                    if (!(!ygCurRight.diopter_s_accurate && !ygCurRight.diopter_c_accurate)) {
                        historyFarsightRecordsRight.push(ygCurRight)
                    }

                }

            }
        }


        objL.history_AL_records = historyALRecordsLeft;
        objR.history_AL_records = historyALRecordsRight;

        objL.history_farsight_records = historyFarsightRecordsLeft;
        objR.history_farsight_records = historyFarsightRecordsRight;


        // 左眼
        util.getHistory(objL, function (resultLeft) {
            let storageHistory = wx.getStorageSync('storageHistory') || {};
            if (!storageHistory[archive.id]) storageHistory[archive.id] = {};
            storageHistory[archive.id].l = resultLeft;
            wx.setStorageSync('storageHistory', storageHistory)
        })

        // 右眼
        util.getHistory(objR, function (resultRight) {
            let storageHistory = wx.getStorageSync('storageHistory') || {};
            if (!storageHistory[archive.id]) storageHistory[archive.id] = {};
            storageHistory[archive.id].r = resultRight;
            wx.setStorageSync('storageHistory', storageHistory)
        })
    },
    // 视力报告初始化
    getVisionReport(index) {
        // | 名称       | 位置  | 类型    | 必选 | 说明          |
        // | ---------- | ----- | ------- | ---- | ------------- |
        // | patient_id | query | integer | 否   | 学生 id       |
        // | AL         | query | number  | 是   | 眼轴长度      |
        // | CR         | query | number  | 是   | 角膜曲率半径  |
        // | age        | query | number  | 是   | 年龄 [3-18]   |
        // | gender     | query | integer | 是   | 1 男性 2 女性 |
        let {
            vision,
            archive,
            d
        } = _this.data;
        const reportList = d.list;

        // 去重后的记录档案
        const uniqueArr = util.uniqueByValue(reportList, 'inspectDate');
        // console.log(uniqueArr); 
        // 历史眼轴发展指数、远视储备数据
        _this.getHistory(archive, uniqueArr[index], uniqueArr);

        let obj = {
            user_info: {
                name: archive.name,
                gender: archive.gender,
                birthday: archive.birth
            },
            all_records: []
        };

        if (!vision[index]) vision[index] = {};

        vision[index].id = archive.id;
        vision[index].age = util.calculateAge(archive.birth);
        vision[index].gender = archive.gender;

        let objL = {
                ...obj
            },
            objR = {
                ...obj
            };

        // 预测
        let leftAllRecords = [],
            rightAllRecords = [];
        uniqueArr.map((item, index) => {
            let lItem = {},
                rItem = {};
            lItem.inspect_date = item.inspectDate + 'T00:00:00'
            rItem.inspect_date = item.inspectDate + 'T00:00:00'

            // 是否散瞳验光
            // 注意, CR和 K1\K2 不可同时缺省.
            // console.log('是否散瞳验光',report.dilatedRefraction)
            if (item.dilatedRefraction) {
                if (item.leftDiopterS !== '') lItem.diopter_s_accurate = parseFloat(item.leftDiopterS);
                if (item.leftDiopterC !== '') lItem.diopter_c_accurate = parseFloat(item.leftDiopterC);

                if (item.rightDiopterS !== '') rItem.diopter_s_accurate = parseFloat(item.rightDiopterS);
                if (item.rightDiopterC !== '') rItem.diopter_c_accurate = parseFloat(item.rightDiopterC);
            } else {
                if (item.leftDiopterS !== '') lItem.diopter_s = parseFloat(item.leftDiopterS);
                if (item.leftDiopterC !== '') lItem.diopter_c = parseFloat(item.leftDiopterC);

                if (item.rightDiopterS !== '') rItem.diopter_s = parseFloat(item.rightDiopterS);
                if (item.rightDiopterC !== '') rItem.diopter_c = parseFloat(item.rightDiopterC);
            }

            if (item.leftAxis != '') lItem.AL = parseFloat(item.leftAxis);
            if (item.leftCurvatureRadius != '') lItem.CR = parseFloat(item.leftCurvatureRadius);

            if (item.rightAxis != '') rItem.AL = parseFloat(item.rightAxis);
            if (item.rightCurvatureRadius != '') rItem.CR = parseFloat(item.rightCurvatureRadius);

            if (item.leftK1 != '') lItem.K1 = parseFloat(item.leftK1);
            if (item.leftK2 != '') lItem.K2 = parseFloat(item.leftK2);

            if (item.rightK1 != '') rItem.K1 = parseFloat(item.rightK1);
            if (item.rightK2 != '') rItem.K2 = parseFloat(item.rightK2);

            leftAllRecords.push(lItem)
            rightAllRecords.push(rItem)
        })
        objL.all_records = leftAllRecords;
        objR.all_records = rightAllRecords;


        // 区间测速
        // history_farsight_records 历史散瞳验光数据的列表
        let historyALRecordsLeftSpeed = [],
            historyALRecordsRightSpeed = [];
        for (let i = 0; i < uniqueArr.length; i++) {
            if (i < 20) {
                let cur = uniqueArr[i];

                let curLeft = {
                        time: cur.inspectDate,
                        AL: cur.leftAxis !== '' ? parseFloat(cur.leftAxis) : ''
                    },
                    curRight = {
                        time: cur.inspectDate,
                        AL: cur.rightAxis !== '' ? parseFloat(cur.rightAxis) : ''
                    };

                if (curLeft.AL && curLeft.AL !== '') {
                    historyALRecordsLeftSpeed.push(curLeft)
                }

                if (curRight.AL && curRight.AL !== '') {
                    historyALRecordsRightSpeed.push(curRight)
                }

            }
        }

        // 左眼
        let storageVision = wx.getStorageSync('storageVision') || {};
        util.getVision(objL, function (resultLeft) {
            vision[index].l = resultLeft;
            if (!storageVision[archive.id]) storageVision[archive.id] = {};
            storageVision[archive.id] = vision[index];
            wx.setStorageSync('storageVision', storageVision)
            _this.setData({
                vision
            });

            // 设置风险等级
            _this.setRiskLevel(archive, resultLeft.nearsight_level, function (level) {
                archive.riskLevel = level;
                _this.setData({
                    archive
                })
            })

            // 左眼区间测速
            let speedobj = {
                birthday: archive.birth,
                gender: archive.gender,
                is_normal: resultLeft.nearsight_level === 0 ? true : false,
            };

            speedobj.history_AL_records = historyALRecordsLeftSpeed;
            if (historyALRecordsLeftSpeed.length == 0) return
            util.getSpeed(speedobj, archive.id, function (speedLeft) {
                let storageSpeed = wx.getStorageSync('storageSpeed') || {};
                if (!storageSpeed[archive.id]) storageSpeed[archive.id] = {};
                speedLeft.birth = archive.birth;
                storageSpeed[archive.id].l = speedLeft;
                wx.setStorageSync('storageSpeed', storageSpeed)
                // console.log('left',wx.getStorageSync('storageSpeed'))

                _this.setData({
                    speed: storageSpeed
                })
            })

        })

        // 右眼
        util.getVision(objR, function (resultRight) {
            vision[index].r = resultRight;
            if (!storageVision[archive.id]) storageVision[archive.id] = {};
            storageVision[archive.id] = vision[index];
            wx.setStorageSync('storageVision', storageVision)

            _this.setData({
                vision
            });


            // 右眼区间测速
            let speedobj = {
                birthday: archive.birth,
                gender: archive.gender,
                is_normal: resultRight.nearsight_level === 0 ? true : false,
            };
            speedobj.history_AL_records = historyALRecordsRightSpeed;
            if (historyALRecordsRightSpeed.length == 0) return
            util.getSpeed(speedobj, archive.id, function (speedRight) {
                let storageSpeed = wx.getStorageSync('storageSpeed') || {};
                if (!storageSpeed[archive.id]) storageSpeed[archive.id] = {};
                speedRight.birth = archive.birth;
                storageSpeed[archive.id].r = speedRight;
                wx.setStorageSync('storageSpeed', storageSpeed)
                // console.log('right', wx.getStorageSync('storageSpeed'))

                _this.setData({
                    speed: storageSpeed
                })
            })

        })
    },

    // 设置风险等级
    setRiskLevel(archive, level, cb) {
        if (!archive) return;

        if (!(level !== 0 && archive.riskLevel !== level - 1)) return
        http.userArchiveUpdate({
            id: archive.id,
            name: archive.name,
            gender: archive.gender,
            birth: archive.birth,
            parentsMyopia: archive.parentsMyopia,
            regionId: archive.regionId,
            idcard: archive.idcard,
            riskLevel: level - 1,
        }).then(res => {
            if (cb) cb(level - 1)
        })
    },


    // 拨打电话
    makePhoneCall(e) {
        const {
            phone
        } = e.currentTarget.dataset
        wx.makePhoneCall({
            phoneNumber: phone,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        _this.minuserChange();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        _this.setData({
            vision: []
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        _this.setData({
            vision: []
        })
    },

    /**
     * 页面滚动的处理函数
     */
    onPageScroll: function (e) {
        let {
            nvabarData
        } = _this.data;

        // 导航样式切换
        if (e.scrollTop >= 10 && nvabarData.type === 0) {
            nvabarData.type = 1;
            _this.setData({
                nvabarData
            });
        } else if (e.scrollTop < 10 && nvabarData.type === 1) {
            nvabarData.type = 0;
            _this.setData({
                nvabarData
            });
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        let {
            datas
        } = _this.data;
        datas.pageNum = 1;

        _this.setData({
            datas,
            vision: []
        });
        _this.minuserChange();
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        // let { datas, d } = _this.data;
        // if (datas.pageNum >= d.pages) {
        //   return;
        // }
        // datas.pageNum = datas.pageNum + 1;
        // _this.getData(datas, 'add');
    }
})