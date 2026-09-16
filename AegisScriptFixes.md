# Aegis 脚本防御性修复

日期：2026-09-17。依据现有本地脚本修复，不下载新资源，不执行远端代码。

## 已完成

| 修复文件 | 修改内容 |
|---|---|
| Aegishanglvzongheng.js | 检查请求及headers类型；不区分rpid请求头大小写，仅接受字符串；缺失或无匹配时保留响应。仍使用上游的子串判定及404动作。 |
| Aegiscaixinads.js | 解析JSON并遍历对象/数组，只修改精确的sday/eday/intval字段。有限数值intval完整改为0，避免多位数替换残留；沿用原2029年日期，不调整展示期限策略。 |
| Aegis555Ad.js | 验证data/list数组；删除已识别的advert_self布局及数值type=3条目；保留空条目、未知结构及其他内容。 |
| Aegisbaishitv.js | 兼容data数组/对象，仅在jumpTypeString为字符串且包含“广告”时删除条目。 |
| Aegisithome.js | 兼容list数组/对象；仅删除已识别的flag=2或字符串“2”，保留缺失feedContent等未知条目。 |

响应脚本对非JSON、空响应、根结构变化与异常统一返回 `$done({})`，使客户端沿用原响应。无命中时也不重新序列化。百视TV/IT之家命中广告时沿用上游将集合输出为数组的形式。每个脚本只在最后调用一次 `$done`，不在catch中重试。

原作者说明保留；baishitv原文件无头部，修复版补充上游来源。原文件保持不变。

## 本地缺失，尚未修复

- `server-info-pure.js`：工作目录各仓库中未找到，评分缺失处理、HTTP状态校验及HTML转义问题尚未处理。
- `streaming-ui-check.js`：工作目录各仓库中未找到，异步查询等待、超时及重复结束问题尚未处理。

遵循只修改已有本地资源的要求，没有自动下载这两个脚本。需提供其本地文件后继续。

## 验证

`node tests/aegis-defensive.test.cjs`

102次隔离执行通过：正常响应、无效/空JSON、缺失字段、数组/对象集合、未知条目、数值/字符串广告标记、多位/负数/小数intval、无请求头、大小写请求头，以及完成回调抛错时不重复调用。使用Node vm提供QX变量进行静态输入模拟；未在手机或真实接口上验证。

## 使用状态

仅本地提交，未推送；QuantumultX.conf、AegisStartUpAds.conf等入口仍引用原脚本。这些修复尚不会自动作用于手机。批准发布后，再将实际使用的入口改到用户Scripts仓库对应Aegis文件的raw.githubusercontent.com地址。文件头内原作者的示例规则是来源说明，不代表已切换到修复版。

本轮不处理混淆脚本、不扩大远端依赖维护范围。报告中“等”不视为所有JS均已审查完毕。

## 本地输入指纹

| 原文件 | SHA-256 |
|---|---|
| hanglvzongheng.js | `24173b13433fc3c46b29577301c044425b1159f24f6fe577eef9a8227120f201` |
| caixinads.js | `592c181611f5b89682c93cfc59a29de84e35606e8ab1837118a175886acd6e58` |
| 555Ad.js | `24e580861f900fb775adb4cbbd106ef46d946c7f47db132e3036ee29d90d2dec` |
| baishitv.js | `b4af6e3ea6d58d20567a04e47f7dc7de137307773a6f06e5916b9278c9c00717` |
| ithome.js | `e8e1210c6a10d98258e56821267bcc2c66455633765263acb3d3ff423d254ece` |
