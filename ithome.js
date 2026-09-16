/***********************************************
> 应用名称：ithome去除信息流广告
> 脚本作者：@ddgksf2013
> 微信账号：墨鱼手记
> 更新时间：2024-10-12
> 通知频道：https://t.me/ddgksf2021
> 特别提醒：如需转载请注明出处，谢谢合作！
***********************************************/

// Aegis defensive fix, 2026-09-17. Based on ddgksf2013/Scripts/ithome.js
// Source: https://raw.githubusercontent.com/ddgksf2013/Scripts/master/ithome.js
// Invalid or unknown input: $done({}) preserves the original response.

(function () {
    var result = {};
    try {
        var body = typeof $response !== "undefined" && $response && $response.body;
        if (typeof body === "string" && body.trim()) {
            var obj = JSON.parse(body);
            var list = obj && typeof obj === "object" && obj.data && obj.data.list;
            if (list && typeof list === "object") {
                var entries = Array.isArray(list) ? list : Object.keys(list).map(function (key) { return list[key]; });
                var filtered = entries.filter(function (item) {
                    var feed = item && typeof item === "object" && item.feedContent;
                    var flag = feed && typeof feed === "object" && feed.flag;
                    return flag !== 2 && flag !== "2";
                });
                if (filtered.length !== entries.length) {
                    obj.data.list = filtered;
                    result = {body: JSON.stringify(obj)};
                }
            }
        }
    } catch (error) {
        result = {};
    }
    $done(result);
})();
