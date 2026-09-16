// Aegis defensive fix, 2026-09-17. Based on ddgksf2013/Scripts/baishitv.js
// Source: https://raw.githubusercontent.com/ddgksf2013/Scripts/master/baishitv.js
// Invalid or unknown input: $done({}) preserves the original response.

(function () {
    var result = {};
    try {
        var body = typeof $response !== "undefined" && $response && $response.body;
        if (typeof body === "string" && body.trim()) {
            var obj = JSON.parse(body);
            var data = obj && typeof obj === "object" && obj.dt && obj.dt.data;
            if (data && typeof data === "object") {
                var entries = Array.isArray(data) ? data : Object.keys(data).map(function (key) { return data[key]; });
                var filtered = entries.filter(function (item) {
                    return !(item && typeof item === "object" && typeof item.jumpTypeString === "string" &&
                        item.jumpTypeString.indexOf("广告") !== -1);
                });
                // 未命中广告时不重新序列化；命中时沿用上游输出数组的形式。
                if (filtered.length !== entries.length) {
                    obj.dt.data = filtered;
                    result = {body: JSON.stringify(obj)};
                }
            }
        }
    } catch (error) {
        result = {};
    }
    $done(result);
})();
