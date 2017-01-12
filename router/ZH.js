var express = require('express'),
    router = express.Router(),
    ZH = require('./../component/ZH.js')
    ;

var zh = new ZH();

router.get('/', function(req, res, next) {

    zh.verify(function(data) {
        if ('logout' == data.status) {
            _xsrf = data._xsrf
            captcha = data.captcha
            captcha_cn = data.captcha_cn
            html = ""
            html += "<html>"
            html += "<head></head>"
            html += "<body>"
            html += "<div>" + _xsrf + "</div>"
            html += "<img src='" + captcha + "'>"
            html += "</body>"
            html += "</html>"
            return res.send(html)
        } else {
            return res.json(data)
        }
        
    })

})

router.post('/login', function(req, res, next) {

    params = req.body

    zh.login(params, function(_err, _res) {
        return res.json(_res.body)
    })

})

router.post('/getList', function(req, res, next) {

    params = req.body

    zh.getList(params, function(_err, _res) {
        return res.json(_res.body)
    })

})


module.exports = router