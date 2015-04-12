"use strict";

var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = null;
var bodyParser = require('body-parser');

if (process.env.NODE_ENV !== 'test') {
	log4js.loadAppender('console');
	log4js.addAppender(log4js.appenders.console(), 'logger');
	logger = log4js.getLogger('logger');
} 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/turtle_message', function(req, res){
	logger.debug('Got a turtle message!');
	var message = fix_cc_message(req.body);
	res.send({status: "ok"});
});

app.get('/test', function(req, res){
	logger.debug('Got /test request');
	res.send("test");
});

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;

	logger.debug('ninja_turtles server listening at http://%s:%s', host, port);
});

function fix_cc_message(message) {
	var data = null;
	for(var key in message) {
		data = JSON.parse(key);
	}
	return data;
}

exports.fix_cc_message = fix_cc_message;