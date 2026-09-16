/***********************************

> 应用名称：财新
> 脚本作者：ddgksf2013
> 微信账号：墨鱼手记
> 更新时间：2024-01-14
> 通知频道：https://t.me/ddgksf2021
> 脚本功能：去开屏广告
> 特别说明：⛔⛔⛔
           本脚本仅供学习交流使用，禁止转载售卖
           ⛔⛔⛔


请在本地添加下面分流
host, gg.caixin.com, direct

[rewrite_local]

# ～ 财新（2024-01-14）@ddgksf2013
^https?:\/\/gg\.caixin\.com\/s\?z=caixin&op=1&c=3362 url script-response-body https://github.com/ddgksf2013/Scripts/raw/master/caixinads.js

[mitm]

hostname=gg.caixin.com

***********************************/

// Aegis defensive fix, 2026-09-17. Based on ddgksf2013/Scripts/caixinads.js
// Source: https://raw.githubusercontent.com/ddgksf2013/Scripts/master/caixinads.js
// Invalid or unknown input: $done({}) preserves the original response.

(function () {
    var result = {};
    try {
        var body = typeof $response !== "undefined" && $response && $response.body;
        if (typeof body === "string" && body.trim()) {
            var obj = JSON.parse(body);
            if (obj && typeof obj === "object") {
                var pending = [obj];
                var changed = false;
                while (pending.length) {
                    var item = pending.pop();
                    Object.keys(item).forEach(function (key) {
                        var value = item[key];
                        // 保留上游日期语义，只改写精确字段名和已知类型。
                        if ((key === "sday" || key === "eday") && typeof value === "string") {
                            var target = key === "sday" ? "2029-12-01 00:00:00" : "2029-12-30 00:00:00";
                            if (value !== target) { item[key] = target; changed = true; }
                        } else if (key === "intval" && typeof value === "number" && isFinite(value)) {
                            if (value !== 0) { item[key] = 0; changed = true; }
                        } else if (value && typeof value === "object") {
                            pending.push(value);
                        }
                    });
                }
                if (changed) result = {body: JSON.stringify(obj)};
            }
        }
    } catch (error) {
        result = {};
    }
    $done(result);
})();
