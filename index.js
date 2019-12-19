var express = require('express');
var app = express();
var DPM = require(`./Server/DPM/Routes/route`);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	res.sendFile('/public/bims.html', { root: __dirname });
})

app.use('/bims/api/', DPM)
var port = process.env.PORT || 55688;

app.listen(port);