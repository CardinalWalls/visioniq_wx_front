var app = require("request.js");
// 专家-分页
export function expertPage(data) {
    const result = app.request({
      url: '/user/expert/page',
      data
    });
    return result;
  }
  
// 视力干预-新增
export function userInterveneAdd(data) {
  const result = app.request({
    url: '/user/userIntervene',
    method: "POST",
    data
  });
  return result;
}
// 视力干预-修改
export function userInterveneUpdate(data) {
  const result = app.request({
    url: '/user/userIntervene',
    method: "PUT",
    data
  });
  return result;
}
// 视力干预-推送给用户
export function userIntervenePush(data) {
  const result = app.request({
    url: '/user/userIntervene/push',
    method: "PUT",
    data
  });
  return result;
}
// 视力干预-分页
export function userIntervenePage(data) {
  const result = app.request({
    url: '/user/userIntervene/page',
    data
  });
  return result;
}
// 视力干预-删除
export function userInterveneDelete(ids,data) {
  const result = app.request({
    url: '/user/userIntervene/'+ids,
    method: "DELETE",
    data
  });
  return result;
}

// 视功能检查报告-新增
export function userVisualFunctionReportAdd(data) {
  const result = app.request({
    url: '/user/userVisualFunctionReport',
    method: "POST",
    data
  });
  return result;
}
// 视功能检查报告-修改
export function userVisualFunctionReportUpdate(data) {
  const result = app.request({
    url: '/user/userVisualFunctionReport',
    method: "PUT",
    data
  });
  return result;
}
// 视功能检查报告-根据ID查询
export function userVisualFunctionReportDetail(id,data) {
  const result = app.request({
    url: '/user/userVisualFunctionReport/'+id,
    data
  });
  return result;
}
// 视功能检查报告-分页
export function userVisualFunctionReportList(data) {
  const result = app.request({
    url: '/user/userVisualFunctionReport/page',
    data
  });
  return result;
}
// 视功能检查报告-删除
export function userVisualFunctionReportDelete(ids,data) {
  const result = app.request({
    url: '/user/userVisualFunctionReport/'+ids,
    method: "DELETE",
    data
  });
  return result;
}



// 客服-统计
export function operatorStatistics() {
  const result = app.request({
    url: '/user/operator/statistics'
  });
  return result;
}

// 档案-分页（客服运营）
export function pageForOperator(data) {
  const result = app.request({
    url: '/user/userArchive/pageForOperator',
    data
  });
  return result;
}

// 专家-修改预约日期限制
export function appointmentLimit(data) {
  const result = app.request({
    url: '/user/expert/appointmentLimit',
    method: "PUT",
    data
  });
  return result;
}

// 在线预约分页
export function bookPage(data) {
  const result = app.request({
    url: '/user/appointmentExpert/page',
    data
  });
  return result;
}

// 在线预约新增
export function bookAdd(data) {
  const result = app.request({
    url: '/user/appointmentExpert',
    method: "POST",
    data
  });
  return result;
}

// 在线预约删除
export function bookDelete(ids) {
  const result = app.request({
    url: '/user/appointmentExpert/' + ids,
    method: "DELETE"
  });
  return result;
}
// 专家-发起申请
export function expertApply(data) {
  const result = app.request({
    url: '/user/expert/apply',
    data,
    method: 'POST'
  });
  return result;
}

// 专家-修改信息
export function expertInfoUpdate(data) {
  const result = app.request({
    url: '/user/expert/info',
    data,
    method: 'PUT'
  });
  return result;
}

// 专家-信息
export function expertInfo(data) {
  const result = app.request({
    url: '/user/expert/info',
    data
  });
  return result;
}

// 专家-统计
export function expertStatistics(data) {
  const result = app.request({
    url: '/user/expert/statistics',
    data
  });
  return result;
}
// 检查报告-根据报告图片识别内容
export function userInspectReportOcr(data) {
  const result = app.request({
    url: '/user/userInspectReport/ocr',
    method: 'POST',
    data
  });
  return result;
}

// 检查报告-根据ID查询
export function userInspectReportDetail(id) {
  const result = app.request({
    url: '/user/userInspectReport/' + id,
  });
  return result;
}

// 检查报告-修改
export function userInspectReportUpdate(data) {
  const result = app.request({
    url: '/user/userInspectReport',
    method: 'PUT',
    data
  });
  return result;
}

// 检查报告-新增
export function userInspectReportAdd(data) {
  const result = app.request({
    url: '/user/userInspectReport',
    method: 'POST',
    data
  });
  return result;
}

// 检查报告-分页
export function userInspectReportPage(data) {
  const result = app.request({
    url: '/user/userInspectReport/page',
    data
  });
  return result;
}
// 档案-修改
export function userArchiveUpdate(data) {
  const result = app.request({
    url: '/user/userArchive',
    method: 'PUT',
    data
  });
  return result;
}
// 档案-删除
export function userArchiveDelete(ids,data) {
  const result = app.request({
    url: '/user/userArchive/'+ids,
    method: 'DELETE',
    data
  });
  return result;
}

// 档案-新增
export function userArchiveAdd(data) {
  const result = app.request({
    url: '/user/userArchive',
    method: 'POST',
    data
  });
  return result;
}

// 档案-根据ID查询
export function userArchiveDetail(id) {
  const result = app.request({
    url: '/user/userArchive/' + id
  });
  return result;
}

// 档案-分页
export function userArchivePage(data) {
  const result = app.request({
    url: '/user/userArchive/page',
    data
  });
  return result;
}

// 档案-统计
export function archiveStatistics(data) {
  const result = app.request({
    url: '/user/userArchive/statistics',
    data
  });
  return result;
}

// 5、发送消息
export function chatSend(data) {
  const result = app.request({
    url: '/chat/message/send',
    method: "POST",
    data
  });
  return result;
}

// 3、消息分页
export function chatMessage(id, data) {
  const result = app.request({
    url: '/chat/message/'+id,
    data
  });
  return result;
}

// 2、创建或查找会话-单聊
export function chatCreate(data) {
  const result = app.request({
    url: '/chat/message/group',
    method: "POST",
    data
  });
  return result;
}

// 1、会话分页
export function chatPage(data) {
  const result = app.request({
    url: '/chat/message/group',
    data
  });
  return result;
}

// =======================
// 以下是公共部分
// =======================

// 搜索关键词分页
export function keywordsPage(data) {
  const result = app.request({
    url: '/public/sys/keywords/page',
    data
  });
  return result;
}
// 搜索关键词增加热度
export function keywordsAdd(data) {
  const result = app.request({
    url: '/public/sys/keywords/'+data,
    method:'POST'
  });
  return result;
}

// 关键词查询
export function keywords(data) {
  const result = app.request({
    url: '/sys/behavior/keywords',
    data
  });
  return result;
}


// 新闻分类
export function newsType(data) {
  const result = app.request({
    url: '/news/type',
    data
  });
  return result;
}

// 文章-分页列表
export function newsPage(data) {
  const result = app.request({
    url: '/news/page',
    data
  });
  return result;
}

// 文章-根据ID查询详情并添加阅读数
export function newsAdd(data) {
  const result = app.request({
    url: '/news/' + data
  });
  return result;
}


// 字典
export function dictionarySingle(data) {
  const result = app.request({
    url: '/dictionary/data/single',
    data
  });
  return result;
}

// 字典-列表查询
export function dictionaryList(data) {
  const result = app.request({
    url: '/dictionary/data/list',
    data
  });
  return result;
}

// 广告
export function adList(data) {
  const result = app.request({
    url: '/advertisement/list',
    data
  });
  return result;
}


// 动态配置数据查询
export function variabledata(data) {
  const result = app.request({
    url: '/sys/variabledata',
    data
  });
  return result;
}


// 查询地区根据[省、市、区]名称, 查询id
export function regionFullName(data) {
  const result = app.request({
    url: '/region/by-full-name',
    data
  });
  return result;
}

// 查询地区父级所有数据
export function regionSelected(data) {
  const result = app.request({
    url: '/region/selected/' + data,
  });
  return result;
}


// 动态表单-查询分页
export function dynamicFormDataPage(data) {
  const result = app.request({
    url: '/dynamicFormData/page',
    data
  });
  return result;
}


// 动态表单-添加数据
export function dynamicFormData(data) {
  const result = app.request({
    url: '/dynamicFormData/pub',
    data,
    method: 'POST'
  });
  return result;
}


// 地址修改
export function addressUpdate(data) {
  const result = app.request({
    url: '/user/address',
    data,
    method: 'PUT'
  });
  return result;
}

// 地址新增
export function addressAdd(data) {
  const result = app.request({
    url: '/user/address',
    data,
    method: 'POST'
  });
  return result;
}

// 地址删除
export function addressDelete(data) {
  const result = app.request({
    url: '/user/address/' + data,
    method: 'DELETE'
  });
  return result;
}

// 地址查询
export function addressDetail(data) {
  const result = app.request({
    url: '/user/address/' + data,
  });
  return result;
}

// 地区-查询子级列表
export function regionList(data) {
  const result = app.request({
    url: '/region/list',
    data,
  });
  return result;
}

// 地址列表
export function addressList(data) {
  const result = app.request({
    url: '/user/address/list',
    data,
  });
  return result;
}

// 手机号修改
export function putPhone(data) {
  const result = app.request({
    url: '/user/phone',
    data,
    method: "PUT",
  });
  return result;
}


// 用户信息查询
export function userInfo(data) {
  const result = app.request({
    url: '/user/info',
    data
  });
  return result;
}


// 用户信息查询修改
export function userInfoPut(data) {
  const result = app.request({
    url: '/user/info',
    data,
    method: 'PUT'
  });
  return result;
}

// 发送短信获取验证码
export function sendMsg(data) {
  const result = app.request({
    url: '/edge/sms/code',
    data
  });
  return result;
}

// 短信验证码校验
export function smsValidate(data) {
  const result = app.request({
    url: '/edge/sms/validate',
    data
  });
  return result;
}


// 生成的小程序码 - 永久有效 - 无次数限制 - 可接受页面参数较短
export function getwxacodeunlimit(data) {
  const result = app.request({
    url: '/mini/getwxacodeunlimit/fromservice',
    data
  });
  return result;
}


// 统一接口，获取上传凭证
export function ossTokenUploading(data) {
  const result = app.request({
    url: '/oss/token/uploading',
    data
  });
  return result;
}

// =======================
// 小程序相关接口
// =======================
// 获取SessionTicket
export function miniSession(data) {
  const result = app.request({
    url: '/mini/session',
    data,
    method: 'GET'
  });
  return result;
}

// 小程序获取用户信息手机号
export function miniPhoneLogin(data) {
  const result = app.request({
    url: '/mini/login/phone/auto',
    data,
    method: 'POST'
  });
  return result;
}

// 小程序获取用户信息手机号
export function miniUserPhone(data) {
  const result = app.request({
    url: '/mini/user/phone',
    data
  });
  return result;
}


// 记录分享者
export function shareOpen(data) {
  const result = app.request({
    url: '/user/share/open',
    data,
    method: 'POST'
  });
  return result;
}


// 生成的小程序码 - 持久化参数-生成MD5码
export function postParamMd5(data) {
  const result = app.request({
    url: '/public/param-md5',
    data,
    method: 'POST'
  });
  return result;
}

// 生成的小程序码 - 持久化参数-生成MD5码-解码
export function getParamMd5(data) {
  const result = app.request({
    url: '/public/param-md5/'+data,
  });
  return result;
}


// 获取播放地址(重定向直接播放默认清晰度)
export function playSource(data) {
  const result = app.request({
    url: '/oss/vod/play/source',
    data
  });
  return result;
}

// 上传凭证
export function uploadAuth(data) {
  const result = app.request({
    url: '/oss/vod/upload/auth',
    data
  });
  return result;
}

// 刷新上传凭证
export function uploadAuthrefresh(data) {
  const result = app.request({
    url: '/oss/vod/upload/auth/refresh',
    data
  });
  return result;
}

// 阿里云
export function ossVodConfig(data) {
  const result = app.request({
    url: '/oss/vod/config',
  });
  return result;
}