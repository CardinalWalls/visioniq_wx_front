var config = require("config.js");
// 历史眼部数据，包括眼轴长度（AL）和远视记录，生成相应的解读和预警
export const getHistory = (obj, cb) => {
    wx.request({
      url: config.VISIONBASEURL +'/history',
      method: 'POST',
      data: obj,
      success: function(res) {
        // console.log(res,'============')
        if (res.statusCode === 200) {
          if (cb) cb(res.data)
        } else {
            wx.showToast({
                icon: 'none',
                title: (res.statusCode === 500 || res.statusCode === 502) ? '历史数据请求失败': '历史数据错误',
                duration: 4000
            })
        }
      }, fail: function(err) {
        // console.log(res,'error============')
      }
    })
  }

// 预测图接口请求
export const getVision = (obj, cb) => {
  wx.request({
    url: config.VISIONBASEURL +'/newpredict',
    method: 'POST',
    data: obj,
    success: function(res) {
      // console.log(res,'============')
      if (res.statusCode === 200) {
        if (cb) cb(res.data)
      } else {
          wx.showToast({
                icon: 'none',
              title: (res.statusCode === 500 || res.statusCode === 502) ? '预测请求失败': '预测图错误',
              duration: 4000
          })
      }
    }, fail: function(err) {
      // console.log(res,'error============')
    }
  })
}

// 区间测速请求接口 https://vpac-chart.cqwangkuai.com
export const getSpeed = (obj,id, cb) => {
  wx.request({
    url: config.VISIONBASEURL +'/interval-speed?id=' + id,
    method: 'POST',
    data: obj,
    success: function(res) {
      // console.log(res,'============')
      if (res.statusCode === 200) {
        if (cb) cb(res.data)
      } else {
          wx.showToast({
            icon: 'none',
              title: (res.statusCode === 500 || res.statusCode === 502) ? '区间测速请求失败': '区间测速错误',
              duration: 4000
          })
      }
    }, fail: function(err) {
      // console.log(res,'error============')
    }
  })
}

// 手机号码星号加密
export const phonePwd = (phone) => {
  if (phone && phone != '') {
    return phone.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2")
  }
}

// 判断是否过期
export const isExpiry = () => {
  const minuser = wx.getStorageSync('minuser');
  const minuser_expiration = wx.getStorageSync('minuser_expiration') || 0;

  // 过期时间2天 1000*60*60*48
  const expiryTime = 1000 * 60 * 60 * 24 * 2;
  // const expiryTime = 1000 * 30;

  if (!minuser || minuser === '' || new Date().getTime() - minuser_expiration > expiryTime) {
    return true;
  } else {
    return false;
  }
};


// 时间是否过期
export const isTimeExpire = (dateTimeStamp) => {
  var time = dateTimeStamp.replace(/-/g, "/");
  var now = (new Date()).getTime();
  var timeStamp = new Date(time).getTime();
  var diffValue = timeStamp - now;
  var b = false;
  if (diffValue < 0) {
    b = true;
  }
  return b;
};


// 日期格式化
export const formatDate = function (date) {
  let nowDate = new Date(date);
  var year = nowDate.getFullYear(); // 年
  var month = nowDate.getMonth() + 1; // 月
  var strDate = nowDate.getDate(); //日
  var hours = nowDate.getHours(); // 时
  var minutes = nowDate.getMinutes(); // 分
  var seconds = nowDate.getSeconds(); // 秒
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = "0" + seconds;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }
  var dateStr = year + '-' + month + '-' + strDate + " " + hours + ':' + minutes + ':' + seconds;
  return dateStr;
}


// 图片获取地址
// @params url 地址
// @params privates 是否私有
export const requestImgUrl = (url, privates) => {
  if (!url || url === "undefined") {
    return getNetworkImg('default-img.png');
  }
  const token = wx.getStorageSync('minuser') ?
    wx.getStorageSync('minuser').token :
    "";

  let sp = "/";
  if (url.indexOf("/") === 0) {
    sp = "";
  }

  let imgurl = "";
  let u = "";
  if (privates) {
    u = sp + url + "&__token__=" + token;
  } else {
    u = sp + url;
  }
  imgurl = config.BASEURL + "/api/oss/redirect?file=" + encodeURIComponent(u);

  return imgurl;
};

// 时间范围内
export const inDuringDate = (beginDateStr, endDateStr) => {
  var cur = (new Date()).getTime();
  var start = new Date(beginDateStr.replace(/-/g, "/")).getTime();
  var end = new Date(endDateStr.replace(/-/g, "/")).getTime();

  // 0 未开始， 1 进行中， 2 已结束
  var v = 0;
  if (cur < start) {
    v = 0;
  } else if (cur >= start && cur <= end) {
    v = 1;
  } else {
    v = 2;
  }
  return v;
}

// 时间比大小
export const compareDate = (t2, t1) => {
  var myDate = new Date();
  if (t1) {
    myDate = new Date(t1.replace(/-/g, "/"))
  }
  var time1 = myDate.getTime(); // 当前日期时间戳
  var day2 = new Date(t2.replace(/-/g, "/"));
  var time2 = day2.getTime(); //所选日期时间戳
  if (parseInt(time2) > parseInt(time1)) {
    return true;
  }
  return false;
}

// 数字，金额 用逗号 隔开（数字格式化）
export const fmoney = (v) => {
  let t = "";
  var r = /^[0-9]*[0-9][0-9]*$/;　　//正整数
  console.log(v, r.test(v));
  if (!r.test(v)) {
    v = v.toFixed(2);
  }

  let sArr = (v + '').split('.'),
    s = parseInt((sArr[0] + "").replace(/[^\d\.-]/g, "")) + "";
  // console.log(sArr, s);
  const l = s.split("").reverse();
  for (let i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }

  return t.split("").reverse().join("") + (sArr[1] ? '.' + sArr[1] : '');
}

// 日期裁剪
export const dateClipping = function (v, start, end) {
  if (v) {
    v = v.substring(start, end);
    return v;
  }
}

// 当前天数上加上一天
export const addOrReduceDate = function (type, date, num) {
  var nowDate = null;
  var strDate = "";
  num = parseInt(num); // 防止传入字符串报错
  var seperator1 = "/";
  var seperator2 = ":";
  if (date == "") {
    nowDate = new Date();
  } else {
    nowDate = new Date(date);
  }

  if (type === "Y") {
    nowDate.setFullYear(nowDate.getFullYear() + num);
  }
  if (type === "M") {
    nowDate.setMonth(nowDate.getMonth() + num);
  }
  if (type === "D") {
    nowDate.setDate(nowDate.getDate() + num);
  }
  if (type === "A") {
    nowDate.setFullYear(nowDate.getFullYear() + num);
    nowDate.setMonth(nowDate.getMonth() + num);
    nowDate.setDate(nowDate.getDate() + num);
  }
  var year = nowDate.getFullYear(); // 年
  var month = nowDate.getMonth() + 1; // 月
  strDate = nowDate.getDate(); //日
  // var hours = nowDate.getHours(); // 时
  // var minutes = nowDate.getMinutes(); // 分
  // var seconds = nowDate.getSeconds(); // 秒
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  // if (seconds >= 0 && seconds <= 9) {
  //   seconds = "0" + seconds;
  // }
  // var dateStr = year + seperator1 + month + seperator1 + strDate + " " + hours + seperator2 + minutes + seperator2 + seconds;

  var dd = nowDate.getDay();
  var week = '', value = '';
  if (dd == 0) {
    week = '周日'
    value = 7
  } else if (dd == 1) {
    week = '周一'
    value = 1
  } else if (dd == 2) {
    week = '周二'
    value = 2
  } else if (dd == 3) {
    week = '周三'
    value = 3
  } else if (dd == 4) {
    week = '周四'
    value = 4
  } else if (dd == 5) {
    week = '周五';
    value = 5
  } else if (dd == 6) {
    week = '周六'
    value = 6
  }
  var dateStr = year + ' 年 ' + month + ' 月 ' + strDate + ' 日 ';
  var dt = year + '-' + month + '-' + strDate;
  return {
    date: dt,
    dateStr: dateStr,
    week,
    value
  };
}


// 当前日期
export const getCurrentDate = function (v) {
  var date = new Date();
  if (v) {
    date = new Date(v.replace(/-/g, "/"));
  }

  var y = date.getFullYear();
  var m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss

  // var dd = date.getDay();
  // var ddc = '';
  // if (dd == 0) {
  //   ddc = '天';
  // } else if (dd == 1) {
  //   ddc = '一';
  // } else if (dd == 2) {
  //   ddc = '二';
  // } else if (dd == 3) {
  //   ddc = '三';
  // } else if (dd == 4) {
  //   ddc = '四';
  // } else if (dd == 5) {
  //   ddc = '五';
  // } else if (dd == 6) {
  //   ddc = '六';
  // }

  // return {
  //   year: y,
  //   month: m,
  //   day: d,
  //   hours: hh,
  //   minutes: mm,
  //   seconds: ss,
  //   week: '星期' + ddc
  // }
}

// 当前日期-年月日
export const getCurrentDateDay = function (v) {
  var date = new Date();
  if (v) {
    date = new Date(v.replace(/-/g, "/"));
  }

  var y = date.getFullYear();
  var m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  // var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  // var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  // var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  // var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  return y + '-' + m + '-' + d
}

// 当前日期
export const getCurrentDateObj = function (v) {
  var date = new Date();
  if (v) {
    date = new Date(v.replace(/-/g, "/"));
  }

  var y = date.getFullYear();
  var m = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var ss = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  // return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss

  var dd = date.getDay();
  var ddc = '';
  if (dd == 0) {
    ddc = '天';
  } else if (dd == 1) {
    ddc = '一';
  } else if (dd == 2) {
    ddc = '二';
  } else if (dd == 3) {
    ddc = '三';
  } else if (dd == 4) {
    ddc = '四';
  } else if (dd == 5) {
    ddc = '五';
  } else if (dd == 6) {
    ddc = '六';
  }

  return {
    year: y,
    month: m,
    day: d,
    hours: hh,
    minutes: mm,
    seconds: ss,
    week: '星期' + ddc
  }
}

// 30分钟倒计时
export const countDown = function (downTime) {
  let v = {};
  let day = parseInt(downTime / 3600 / 24);
  let hour = parseInt(downTime / 3600 % 24);
  let minute = parseInt(downTime / 60 % 60);
  let second = parseInt(downTime % 60);
  if (hour >= 0 && hour <= 9) {
    hour = "0" + hour;
  }
  if (minute >= 0 && minute <= 9) {
    minute = "0" + minute;
  }
  if (second >= 0 && second <= 9) {
    second = "0" + second;
  }
  v.minute = minute;
  v.second = second;
  v.hour = hour;
  v.day = day;
  return v;
}


// 检查地址是否 含有http://
export const isHttps = function (v) {
  var t = "";
  if (v) {
    t = v.indexOf('http') != "-1" ? true : false;
  }
  return t;
}


// 是否已登录
export const isMinuser = () => {
  let b = false;
  if (wx.getStorageSync('minuser') && wx.getStorageSync('minuser') !== '') {
    b = true;
  }
  return b;
}


// 小程序获取当前页面路径及参数
export const getCurrentPageUrlWithArgs = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const url = currentPage.route
  const options = currentPage.options
  let urlWithArgs = `/${url}?`
  for (let key in options) {
    const value = options[key]
    urlWithArgs += `${key}=${value}&`
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)
  return urlWithArgs
}

/**
   * @author: wangjing
   * @update: 20200805
   * @func
   * @description: 获取当前页面完整路径
   */
export const getCurrentRoute = function () {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  var optsv = "?" //如果要获取url中所带的参数可以查看options

  if (JSON.stringify(currentPage.options) !== "{}") {
    for (let i in currentPage.options) {
      optsv = optsv + i + "=" + currentPage.options[i] + "&";
    }
  }
  const path = "/" + url + optsv;
  return path;
}


/**
   * @author: wangjing
   * @update: 20200825
   * @func
   * @description: 加版本号的网络图片
   */
export const getNetworkImg = function (v) {
  const url = config.XCXALIYUNURL + "img/" + v + "?v=" + getTimestamp();
  return url;
}

/**
 * @author: wangjing
 * @update: 20200825
 * @func
 * @description: 版本号
 */
export const getTimestamp = function () {
  const myDate = new Date();
  const month = myDate.getMonth() < 10 ? "0" + (myDate.getMonth() + 1) : (myDate.getMonth() + 1);
  const day = myDate.getDate() < 10 ? "0" + myDate.getDate() : myDate.getDate();
  const hours = myDate.getHours() < 10 ? "0" + myDate.getHours() : myDate.getHours();
  const minutes = myDate.getMinutes() < 10 ? "0" + myDate.getMinutes() : myDate.getMinutes();
  const timestamp = myDate.getFullYear() + "" + month + "" + day + "" + hours + "" + minutes;
  return timestamp;
}

/**
  * 手机号加空格
  */
export const phoneAddTrim = function (v) {
  if (!v) {
    return "";
  }
  return v.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1 $2 $3').trim()
}


// 根据身份证获取年龄
export const getAge = function (identityCard) {
  var len = (identityCard + "").length;
  if (len == 0) {
    return 0;
  } else {
    if ((len != 15) && (len != 18))//身份证号码只能为15位或18位其它不合法
    {
      return 0;
    }
  }
  var strBirthday = "";
  if (len == 18)//处理18位的身份证号码从号码中得到生日和性别代码
  {
    strBirthday = identityCard.substring(6, 6 + 4) + "/" + identityCard.substring(10, 10 + 2) + "/" + identityCard.substring(12, 12 + 2);
  }
  if (len == 15) {
    strBirthday = "19" + identityCard.substring(6, 6 + 2) + "/" + identityCard.substring(8, 8 + 2) + "/" + identityCard.substring(10, 10 + 2);
  }

  //时间字符串里，必须是“/”
  var birthDate = new Date(strBirthday);
  var nowDateTime = new Date();
  var age = nowDateTime.getFullYear() - birthDate.getFullYear();
  //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
  if (nowDateTime.getMonth() < birthDate.getMonth() || (nowDateTime.getMonth() == birthDate.getMonth() && nowDateTime.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.abs(age) || 0;
}


// 根据生日计算年龄（年月天）
export const calculateAge = function(birthday, d1) {
  var today = new Date();
  if(d1) {
      today = new Date(d1)
  }
  var birthDate = new Date(birthday);
  var age = today.getFullYear() - birthDate.getFullYear();
  var monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * 根据指定时间和生日计算年龄（年、月、天）
 * @param {string} birthDate - 出生日期，格式为 "YYYY-MM-DD"
 * @param {string} specifiedDate - 指定日期，格式为 "YYYY-MM-DD"
 * @returns {{years: number, months: number, days: number}} 年龄对象
 */
export const calculateAgeDecimal = function(birthDate, specifiedDate) {
     // 将出生日期和指定日期字符串转换为Date对象
     const birthDateObj = new Date(birthDate);
     const specifiedDateObj = new Date(specifiedDate);
 
     let years = specifiedDateObj.getFullYear() - birthDateObj.getFullYear();
     let months = specifiedDateObj.getMonth() - birthDateObj.getMonth();
     let days = specifiedDateObj.getDate() - birthDateObj.getDate();
 
     // 调整月份和天数
     if (days < 0) {
         // 当前日期的天数小于出生日期的天数，需要从上一个月借一天
         const lastMonth = new Date(specifiedDateObj.getFullYear(), specifiedDateObj.getMonth(), 0);
         days += lastMonth.getDate();
         months--;
     }
 
     if (months < 0) {
         // 当前日期的月份小于出生日期的月份，需要从上一年借一个月
         months += 12;
         years--;
     }
 
     return { years, months, days };
}

 // 身份证正则验证
export const validateIdcard = function(value) {
  let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
  let b = true
  if (value) {
      if (!idcardReg.test(value)) {
          b = false
      } else {
          b = true
      }
  } else {
    b = true
  }
  return b
}

export const getBirthDateAndGender = function(idCard) {
  if (idCard.length !== 18) {
      throw new Error("身份证号长度不正确");
  }

  // 提取出生日期
  const birthYear = idCard.substring(6, 10);
  const birthMonth = idCard.substring(10, 12);
  const birthDay = idCard.substring(12, 14);
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

  // 提取性别
  const genderCode = parseInt(idCard.charAt(16), 10);
  // const gender = genderCode % 2 === 1 ? '男' : '女';
  const gender = genderCode % 2 === 1 ? '1' : '2';

  return {
      birthDate: birthDate,
      gender: gender
  };
}

/**
 * 合并两个数组，去重并排序
 * @param {Array} arr1 - 第一个数组
 * @param {Array} arr2 - 第二个数组
 * @returns {Array} 合并后去重并排序的数组
 */
export const mergeAndUnique = function(mergedArray) {
    // 合并两个数组
    // const mergedArray = arr1.concat(arr2);

    // 使用 Set 去重
    const uniqueArray = Array.from(new Set(mergedArray));

    // 排序
    uniqueArray.sort((a, b) => a - b);

    let newArr = [];
    for(let i = 0; i < uniqueArray.length; i++) {
        if (uniqueArray[i] <= 18) {
            newArr.push(uniqueArray[i])
        }
    }

    return uniqueArray;
}


// 剩余天数 replace(/-/g, "/")
export const getDateDurationDay = function (pend, pstart) {
  var start, end;
  if (pend && pend !== 'undefined') {
    var time = pend.replace(/-/g, "/");
    end = (new Date(time)).getTime();
  } else {
    end =(new Date()).getTime()
  }

  if (pstart && pstart !== 'undefined') {
    var time = pstart.replace(/-/g, "/");
    start = (new Date(time)).getTime();
  } else {
    start = (new Date()).getTime()
  }

  var redu = end - start;
  var dayDiff = redu / (24 * 3600 * 1000); //计算出相差天数
  return dayDiff;
}


export const textToHtmlImage = (str) => {
  if (str == null) {
    return "";
  } else if (str.length == 0) {
    return "";
  }
  if (str.indexOf('src="/api/oss/redirect') !== -1) {
    str = str.replaceAll('src="/api/oss/redirect', 'class="editor-img" src="' + config.BASEURL + '/api/oss/redirect');
  }
  return str;
}


// 用户角色
export const userType = function (v) {
  var t = {
    text: "普通用户"
  };
  if (v == 5) {
    t = {
      text: "心理咨询师",
      key: 'psychologist'
    }
  } else if (v == 2) {
    t = {
      text: "营养专家",
      key: 'expert'
    }
  } else if (v == 3) {
    t = {
      text: "主治医生",
      key: 'doctor'
    }
  } else if (v == 4) {
    t = {
      text:"健康顾问",
      key: 'adviser'
    }
  } else if (v == 6) {
    t = {
      text: "医生助理",
      key: 'doctor'
    }
  }
  return t;
}


// 版本号比较
export const compareVersion = (v1, v2) => {
  v1 = v1.split('.')
      v2 = v2.split('.')
      const len = Math.max(v1.length, v2.length)

      while (v1.length < len) {
        v1.push('0')
      }
      while (v2.length < len) {
        v2.push('0')
      }

      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])

        if (num1 > num2) {
          return 1
        } else if (num1 < num2) {
          return -1
        }
      }

      return 0
}

// 初始化检测隐私是否已授权
export const getPrivacyInit = (cb) => {
  // 隐私协议弹窗
  const SDKVersion = wx.getSystemInfoSync().SDKVersion;
  if (compareVersion(SDKVersion, '2.32.3') >= 0) {
    wx.getPrivacySetting({
      success: res => {
        console.log(res) // 返回结果为: res = { needAuthorization: true/false, privacyContractName: '《xxx隐私保护指引》' }
        // res.needAuthorization = true;
        if (cb) cb(res);
        // if (res.needAuthorization) {
        //   // 需要弹出隐私协议
        //   _this.setData({
        //     showPrivacy: true
        //   })
        // }
      },
      fail: () => {},
      complete: () => {}
    })
  }
}


// 数组分组
export const groupBy = (array, key) => {
  return array.reduce((result, currentItem) => {
    // 使用 key 函数获取分组的键
    const groupKey = key(currentItem);
 
    // 确保 result 对象中有对应键的数组
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
 
    // 将当前项添加到对应分组的数组中
    result[groupKey].push(currentItem);
 
    return result;
  }, {});
}

// textarea 文本转化
export const textToHtml = (str) => {
  if (str == null) {
    return "";
  } else if (str.length == 0) {
    return "";
  }
  // str = str.replaceAll(/\r\n/g, "\n");
  str = str.replaceAll('<br />', "\n");
  str = str.replaceAll("<br />", "\r");    
  return str;
}

// js根据数组对象中的一个值去重
export const uniqueByValue = (array, key) => {
    const set = new Set();
    const result = [];
    for (let i = 0; i < array.length; i++) {
      const value = array[i][key];
      if (!set.has(value)) {
        set.add(value);
        result.push(array[i]);
      }
    }
    return result;
  }