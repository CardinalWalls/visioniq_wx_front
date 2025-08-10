# API Endpoint: GET /prediction

此接口用于获取预测数据。请通过 HTTPS 进行访问.
在测试阶段为了方便, 移除了白名单限制.

### 请求参数

| 名称       | 位置  | 类型    | 必选 | 范围 -| 说明          |
| ---------- | ----- | ------- | ----| -----| ------------- |
| patient_id | query | integer | 否  | -----| 学生 id       |
| AL         | query | number  | 是  |[20.0, 32] | 眼轴长度      |
| CR         | query | number  | 是  | [6.0, 10.0] | 角膜曲率半径  |
| age        | query | number  | 是  |[3,18] | 年龄   |
| gender     | query | integer | 是  |{1,2} | 1 男性 2 女性 |

### 状态码含义

| 状态码 | 含义                 |
| ------ | --------------------|
| 200    | 正常返回结果         |
| 400    | 必要参数为空         |
| 403    | IP地址不在白名单里   |
| 500    | 服务器内部错误       |


### 返回数据结构

状态码 **200**

| 名称             | 类型    | 必选 | 约束 | 中文名 | 说明 |
| ---------------- | ------- | ---- | ---- | ------ | ---- |
| » reflection_S   | number  | true | none | 屈光度    | none |
| » warning_level  | string  | true | none | 预警值    | none |
| » future_records | [array] | true | none | 3-18岁屈光度预测| none |

状态码 **400**

| 名称      | 类型   | 必选 | 约束 | 中文名 | 说明 |
| --------- | ------ | ---- | ---- | ------ | ---- |
| » message | string | true | none | 错误信息   | none |

状态码 **500**

| 名称      | 类型   | 必选 | 约束 | 中文名 | 说明 |
| --------- | ------ | ---- | ---- | ------ | ---- |
| » message | string | true | none |  错误信息 | none |


> Successful Response (200 OK)

> 示例：
```bash
curl -X GET "https://pmyopia.reach2o.org/prediction?patient_id=992112&AL=24.0&CR=7.8&age=9&gender=1"
```

> 返回示例


```json
{
  "future_records": [
    [3, "-2.73"],
    [4, "-2.87"],
    [5, "-2.48"],
    [6, "-2.24"],
    [7, "-2.23"],
    [8, "-2.50"],
    [9, "-2.75"],
    [10, "-3.06"],
    [11, "-3.42"],
    [12, "-3.82"],
    [13, "-3.98"],
    [14, "-4.27"],
    [15, "-4.75"],
    [16, "-5.37"],
    [17, "-5.61"],
    [18, "-5.50"]
  ],
  "reflection_S": -2.754735231399536,
  "warning_level": "0.73166"
}
```

reflection_S是根据输入参数(年龄,性别,AL,CR)得到的预测值. 值为正是远视, 值为负是近视.

warning_Level是病人的严重程度, 是百分比的小数形式。这个数字越靠近1，说明病人的近视程度在同年龄组中越严重。一般而言，超过0.7，就建议要看医生，做散瞳验光。

future_records是预测病人在3-18岁期间屈光度的变化值, 每个数组项是[年龄,屈光度]。

在调用示例中，病人的当前年龄是9岁。因此，3-8岁的预测值可能不符合病人的实际情况。如果在运营数据库中有病人的真实数据，应该用真实数据取而代之，只采用之后几年的预测值。

但warning_level的警告值来自当前的大数据比较，仍然是有效的。


> 示例：
```bash
curl -X GET "https://pmyopia.reach2o.org/prediction?patient_id=992112&AL=24.0&CR=7.8&age=1&gender=1"
```

> 返回示例
{
  "future_records":[],
  "reflection_S":-3.7608139514923096,
  "warning_level":null
}

如果年龄超出[3,18]岁的范围,虽然不会报错, 但是future_records和warning_level返回空值。
同理, 如果性别在{1,2}之外, 也会返回空值.

> 示例：
```bash
curl -X GET "https://pmyopia.reach2o.org/prediction?patient_id=992112&AL=242.0&CR=7.8&age=9&gender=1"
```

> 返回示例
{"future_records":[[3,"-5.81"],[4,"-4.83"],[5,"-4.45"],[6,"-3.93"],[7,"-4.09"],[8,"-4.75"],[9,null],[10,"-5.46"],[11,"-6.13"],[12,"-6.75"],[13,"-7.05"],[14,"-7.56"],[15,"-7.87"],[16,"-8.08"],[17,"-8.45"],[18,"-8.09"]],"reflection_S":-29.5968074798584,"warning_level":"0.98792"}

如果AL和CR超出范围, 结果中可能出现空值, 比如"[9,null]"

> Error Responses

> 400 : 必要参数为空

> 示例：
```bash
curl -X GET "https://pmyopia.reach2o.org/prediction?patient_id=992112&CR=7.8&age=1&gender=1"
```

```
<!doctype html>
<html lang=en>
<title>400 Bad Request</title>        
<h1>Bad Request</h1>
<p>Value for AL should not be None</p>
```

> 403 : ip地址不在白名单里

> 500 : 服务器错误

```json
{
  "message": "string"
}
```
