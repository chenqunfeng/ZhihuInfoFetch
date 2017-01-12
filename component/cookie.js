var common = require('./common.js');

function Cookie(){
    this.cookies = {};
    this.init();
}

Cookie.prototype = {

    // 初始化
    init: function(){
        console.log('CookieJar init');
    },

    // 设置cookie
    setCookie: function(cookies) {
        if (common.isArray(cookies)) {
            p = this.parseCookie(cookies);
            this.mergeCookies(p);
        }
        return this;

    },

    // 格式化cookies
    parseCookie: function(cookies) {
        t = {};
        if (common.isArray(cookies)) {
            cookies.map(function(cookie) {
                arr = cookie.split(';');
                arr.map(function(unit, index) {
                    s = unit.split('=');
                    k = '';
                    v = '';
                    s.map(function(unit, index) {
                        if (0 === index) {
                            k = unit.trim();
                        } else {
                            if (index > 1) {
                                v += "="
                            }
                            v += unit;
                        }
                    })
                    if (0 === index) {
                        t[k] = {};
                        t[k]['value'] = v;
                        _t = t[k];
                    } else {
                        _t[k] = v;
                    }
                })
            })
        }
        return t;
    },

    // 还原格式化的cookies数据
    packageData: function(cookies) {
        var t = [];
        cookies = cookies || this.cookies
        if (common.isObject(cookies)) {
            var k, v, _k, _v, s;
            for (k in cookies) {
                v = cookies[k];
                s = '';
                s += k + '=' + v['value']
                for (_k in v) {
                    _v = v[_k]
                    if (_v != 'undefined') {
                        if (_k !== 'value') {
                            s += '; '
                            s +=  _k + '=' + _v;
                        }
                    }
                }
                t.push(s);
            }
        }
        return t;
    },

    // 合并cookies
    mergeCookies: function(cookies) {
        if (common.isObject(cookies)) {
            var k, v;
            for (k in cookies) {
                v = cookies[k];
                if (!common.isEmpty(v.value)) {
                    // todo, 针对每一个cookie暂时做全替换
                    this.cookies[k] = v;
                }
            }
        }
        return this.cookies;
    },

    // 获取cookie
    getCookie: function() {
        return this.cookies;
    }

}
module.exports = Cookie