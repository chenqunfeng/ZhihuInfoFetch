var express = require('express'),
    router = express.Router(),
    ZH = require('./../component/ZH.js'),
    getIP = require('ipware')().get_ip,
    log4js = require('log4js')
    ;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./logs/info.log'), 'ZHFETCH');

var zh = new ZH(),
    logger = log4js.getLogger('ZHFETCH');

var extend = function(obj, target) {
    var k, v;
    if (!obj && 'object' !== typeof obj) obj = {}
    for (k in target) {
        if (!obj[k]) {
            obj[k] = target[k]
        }
    }
    return obj;
}

router.get('/', function(req, res, next) {

    logger.info(getIP(req))

    params = extend(req.body, req.query)

    zh.verify(params, function(data) {
        // if ('logout' == data.status) {
        //     _xsrf = data._xsrf
        //     captcha = data.captcha
        //     captcha_cn = data.captcha_cn
        //     html = ""
        //     html += "<html>"
        //     html += "<head></head>"
        //     html += "<body>"
        //     html += "<div>" + _xsrf + "</div>"
        //     html += "<img src='" + captcha + "'>"
        //     html += "</body>"
        //     html += "</html>"
        //     return res.send(html)
        // } else {
        //     return res.json(data)
        // }
        return res.json(data);
    })

})

router.post('/login', function(req, res, next) {

    logger.info(getIP(req))

    params = req.body

    zh.login(params, function(data) {
        return res.json(data)
    })

})

router.post('/getList', function(req, res, next) {

    logger.info(getIP(req))

    params = extend(req.body, req.query)

    zh.getList(params, function(_err, _res) {
        return res.json(_res.body)
    })

})


module.exports = router