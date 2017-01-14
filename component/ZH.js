var request = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    jsonfile = require('jsonfile'),
    cookieJar = require('./cookie.js'),
    common = require('./common.js')
    ;

function ZH(account) {
    this.cookieJar = new cookieJar();
    this.cookieFile = './cookie/cookie.json';
    this.cookies = {}
    this.cookie = {
        value: null,
        expires: null,
        _xsrf: ''
    };
    this.headers = {
        'Origin': 'https://www.zhihu.com',
        'Referer': 'https://www.zhihu.com/',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
    };
    this.phoneRegExp = /^1(3|4|5|7|8)\d{9}$/;
    this.init();
}

ZH.prototype = {

    // 初始化
    init: function() {
        console.log('初始化ZH');
    },

    // 从文件中读取cookie并返回cookie
    getCookie: function(id) {
        if (!id) {
            this.cookie = {
                value: null,
                expires: null,
                _xsrf: ''
            }
            return false
        }
        if (common.isEmpty(this.cookies)) {
            if (!fs.existsSync(this.cookieFile)) {
                fs.writeFileSync(this.cookieFile, '{}')
            }
            this.cookies = jsonfile.readFileSync(this.cookieFile)
        }
        if (this.cookies && this.cookies[id]) {
            this.cookie = this.cookies[id]
        } else {
            this.cookie = {
                value: null,
                expires: null,
                _xsrf: ''
            }
        }
        return this.cookie
    },

    // 设置cookie
    setCookie: function(cookie) {
        var that = this,
            value = this.cookieJar.packageData(cookie),
            _xsrf = this.cookie._xsrf || cookie._xsrf.value
            ;
        value.map(function(cookie) {
            var match, date, d1, d2;
            if (match = cookie.match(/[Ee]xpires=([^;]*);/)) {
                date = match[1];
                if (!that.cookie.expires) {
                    that.cookie.expires = date;
                } else {
                    d1 = new Date(that.cookie.expires);
                    d2 = new Date(date);
                    if (d1.valueOf() > d2.valueOf()) {
                        that.cookie.expires = date
                    }
                }
            }
        })
        this.cookie = {
            value: value,
            expires: that.cookie.expires,
            _xsrf: _xsrf
        }
    },

    // 保存cookie
    saveCookie: function(cookie) {
        if (cookie && 'object' === typeof cookie) {
            var id = Math.round(Math.random() * 10e15).toString(36)
            obj = jsonfile.readFileSync(this.cookieFile)
            if (!obj[id]) obj[id] = {}
            obj[id] = cookie
            jsonfile.writeFileSync(this.cookieFile, obj)
            return id
        }
        return false
    },

    // 验证登录
    verify: function(params, cb) {
        this.getCookie(params.id);
        if (expires = this.cookie.expires) {
            expires = new Date(expires)
            if (Date.now() <= expires.valueOf()) {
                cb({
                    status: 'logined',
                    msg: '已经登录'
                })
                return;
            }
        }
        this.getToken(cb)
    },

    // 获取token
    getToken: function(cb) {
        var that = this
        request
            .get('https://www.zhihu.com/')
            .set('Cookie', this.cookie.value)
            .end(function(err, res) {
                cookie = res.headers['set-cookie']
                that.cookieJar.setCookie(cookie)
                that.setCookie(that.cookieJar.getCookie())
                var html = res.text,
                    $ = cheerio.load(html)
                    ;
                cb && cb({
                    status: 'logout',
                    _xsrf: $('input[name="_xsrf"]').val(),
                    captcha_cn: "https://www.zhihu.com/captcha.gif?r=" + Date.now() + "&type=login&lang=cn",
                    captcha: "https://www.zhihu.com/captcha.gif?r=" + Date.now() + "&type=login",
                })
            })
    },

    // 登录
    login: function(params, cb) {
        if (params && cb) {
            params.remember_me = true
            this.cookie._xsrf = params._xsrf
            if (params.phone_num) {
                this.print('手机号登录')
                this.phoneLogin(params, cb)
            } else {
                this.print('邮箱登录')
                this.emailLogin(params, cb)
            }
        }
    },

    // // 登出
    // logout: function(params, cb) {
    //     this.cookie = {
    //         value: null,
    //         expires: null,
    //         _xsrf: null
    //     }
    // },

    // 手机登录
    phoneLogin: function(data, cb) {
        var that = this
        request
            .post('https://www.zhihu.com/login/phone_num')
            .set(that.headers)
            .set('X-Requested-With', 'XMLHttpRequest')
            .set('X-Xsrftoken', data['_xsrf'])
            .send(data)
            .redirects(0)
            .end(function(err, res){
                that.loginSuccess(err, res, cb)
            })
    },

    // 邮箱登录
    emailLogin: function(data, cb) {
        var that = this
        request
            .post('https://www.zhihu.com/login/email')
            .set(that.headers)
            .set('X-Requested-With', 'XMLHttpRequest')
            .set('X-Xsrftoken', data['_xsrf'])
            .send(data)
            .redirects(0)
            .end(function(err, res){
                that.loginSuccess(err, res, cb)
            })
    },

    // 登录成功
    loginSuccess: function(err, res, cb) {
        if (err) {
            this.print('登录出错:', err)
            cb({
                status: 'error'
            })
        }
        else {
            this.print('登录成功:', res.body)
            var cookie = res.headers['set-cookie'];
            this.cookieJar.setCookie(cookie)
            this.setCookie(this.cookieJar.getCookie())
            res.body.id = this.saveCookie(this.cookie)
            cb(res.body)
        }
    },

    // 获取知乎内容列表
    getList: function(data, cb) {
        this.getCookie(data.id)
        request
            .post('https://www.zhihu.com/node/TopStory2FeedList')
            .set(this.headers)
            .set('Accept', '*/*')
            .set('Accept-Encoding', 'zh-CN,zh;q=0.8')
            .set('Host', 'www.zhihu.com')
            .set('X-Requested-With', 'XMLHttpRequest')
            .set('X-Xsrftoken', this.cookie._xsrf)
            .set('Cookie', this.cookie.value)
            .send(data)
            .redirects(0)
            .end(function(err, res) {
                cb(err, res)
            })
    },

    // 信息输出
    print: function(title, message) {
        console.log('==========================================')
        title && console.log(title)
        message && console.log(message)
        console.log('==========================================')
    }

}

module.exports = ZH