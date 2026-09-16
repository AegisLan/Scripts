/**********************************************

> 应用名称：墨鱼自用555去广告脚本
> 脚本作者：@ddgksf2013
> 微信账号：墨鱼手记
> 更新时间：2024-10-30
> 通知频道：https://t.me/ddgksf2021
> 特别提醒：如需转载请注明出处，谢谢合作！
> 脚本说明：去除首页轮播图广告、首页信息流广告、我的页面推广、缩短开屏广告倒计时

请在QuantumultX配置文件的[general]下添加 udp_drop_list=443

[rewrite_local]

^https?:\/\/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){1,3}(:\d+)?\/api\/v\d\/movie\/index_recommend url script-response-body https://github.com/ddgksf2013/Scripts/raw/master/555Ad.js
^https?:\/\/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){1,3}(:\d+)?\/api\/v\d\/advert url reject-200
^https?:\/\/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){1,3}(:\d+)?\/api\/v\d\/notice url reject-200


[mitm]

hostname = *.qyfxgd.cn, *.weilai555.com, *.ecoliving168.com

**********************************************/

// Aegis defensive fix, 2026-09-17. Based on ddgksf2013/Scripts/555Ad.js
// Source: https://raw.githubusercontent.com/ddgksf2013/Scripts/master/555Ad.js
// Invalid or unknown input: $done({}) preserves the original response.

(function () {
    var result = {};
    try {
        var body = typeof $response !== "undefined" && $response && $response.body;
        if (typeof body === "string" && body.trim()) {
            var obj = JSON.parse(body);
            if (obj && typeof obj === "object" && !Array.isArray(obj) && Array.isArray(obj.data)) {
                var changed = false;
                obj.data = obj.data.filter(function (item) {
                    if (item && typeof item === "object" && item.layout === "advert_self") {
                        changed = true;
                        return false;
                    }
                    return true;
                });
                obj.data.forEach(function (item) {
                    if (!item || typeof item !== "object" || !Array.isArray(item.list)) return;
                    item.list = item.list.filter(function (entry) {
                        if (entry && typeof entry === "object" && entry.type === 3) {
                            changed = true;
                            return false;
                        }
                        return true;
                    });
                });
                if (changed) result = {body: JSON.stringify(obj)};
            }
        }
    } catch (error) {
        result = {};
    }
    $done(result);
})();
