var express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression')
    ;

var app = express();

var zh = require('./router/ZH.js');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(compression())

app.use('/zhihu', zh)

app.listen(3000, function () {
    console.log('Express server started.');
});