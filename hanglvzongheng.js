/***********************************************
> 应用名称：墨鱼自用航旅纵横脚本
> 脚本作者：@ddgksf2013
> 微信账号：墨鱼手记
> 更新时间：2022-10-26
> 通知频道：https://t.me/ddgksf2021
> 特别提醒：如需转载请注明出处，谢谢合作！
***********************************************/

// Aegis defensive fix, 2026-09-17. Based on ddgksf2013/Scripts/hanglvzongheng.js
// Source: https://raw.githubusercontent.com/ddgksf2013/Scripts/master/hanglvzongheng.js
// Invalid or unknown input: $done({}) preserves the original response.

(function () {
    var result = {};
    try {
        var headers = typeof $request !== "undefined" && $request && $request.headers;
        if (headers && typeof headers === "object" && !Array.isArray(headers)) {
            var keys = Object.keys(headers);
            for (var i = 0; i < keys.length; i++) {
                var value = headers[keys[i]];
                if (keys[i].toLowerCase() === "rpid" && typeof value === "string" &&
                    (value.indexOf("10000012") !== -1 || value.indexOf("1000019") !== -1)) {
                    result = {status: "HTTP/1.1 404 Not Found"};
                    break;
                }
            }
        }
    } catch (error) {
        result = {};
    }
    $done(result);
})();
