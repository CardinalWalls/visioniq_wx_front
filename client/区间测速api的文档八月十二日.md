# API 文档

## 接口描述

**接口地址**: `/interval-speed`  
**请求方式**: `POST`  
**请求类型**: `application/json`

## 输入参数

- `history_AL_records` (数组): 每个记录包含时间和 AL 值。
  - `time` (字符串): AL 值的记录时间，格式为 `YYYY-MM-DD`。
  - `AL` (浮点数): 轴长(AL)的值。
- `birthday` (字符串): 患者的出生日期，格式为 `YYYY-MM-DD`。
- `gender` (整数): 性别，1 表示男性，0 表示女性。
- `is_normal` (布尔值): 是否近视，`true` 表示不近视，`false` 表示近视。

## 输出参数

- `points` (数组): 每个点代表一个时间记录点，包括以下信息：

  - `time` (字符串): 记录时间，格式为 `YYYY-MM-DD`。
  - `AL` (浮点数): 该时间点的轴长(AL)值。
  - `AL_percentage` (浮点数): 该时间点对应的百分位数。

- `arrows` (数组): 每个箭头代表相邻两个点之间的变化，包括以下信息：

  - `time_start` (字符串): 起始时间，格式为 `YYYY-MM-DD`。
  - `time_end` (字符串): 结束时间，格式为 `YYYY-MM-DD`。
  - `age_difference` (浮点数): 时间间隔对应的年龄差（年）。
  - `AL_growth` (浮点数): 轴长的增长值。
  - `AL_growth_yearly` (浮点数): 年化后的轴长增长值。
  - `type_code` (整数): 变化类型的编码:
    - `1`: 百分位数上升（用**黄色**表示）。
    - `2`: 轴长快速增长（用**红色**表示）。
    - `0`: 无上升（用**绿色**表示）。

- `y_axis_range` (对象): y 轴的百分位数范围。
  - `min` (浮点数): 最小百分位数。
  - `max` (浮点数): 最大百分位数。

## 示例请求

\`\`\`bash
curl -X POST "https://vpac-chart.cqwangkuai.com/interval-speed" \
-H "Content-Type: application/json" \
-d '{
"history_AL_records": [
{
"time": "2023-01-01",
"AL": 22.5
},
{
"time": "2023-06-01",
"AL": 23.0
},

{
"time": "2023-12-01",
"AL": 23.0
},

{
"time": "2024-06-01",
"AL": 23.2
}
],
"birthday": "2015-01-01",
"gender": 1,
"is_normal": false
}'
\`\`\`

## 示例响应

\`\`\`json
{
"arrows": [
{
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
"AL_growth_yearly":0.39918032786885105,
"age_difference": 0.5010266940451745,
"time_start": "2023-12-01",
"time_end": "2024-06-01",
"type_code": 1
}
],
"points": [
{
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
"AL": 23.0,
"AL_percentage": 0.25,
"time": "2023-12-01"
},
{
"AL": 24.0,
"AL_percentage": 0.67,
"time": "2024-06-01"
}
],
"y_axis_range": {
"max": 0.67,
"min": 0.14
}
}
\`\`\`

## 注意事项

- 输入的 `time` 和 `birthday` 字符串格式必须为 `YYYY-MM-DD`。
- 输出中的 `AL_percentage` 表示在给定的年龄和 AL 值下的百分位数，`type_code` 用于标识每段时间间隔的增长类型。
