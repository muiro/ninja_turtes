"use strict";

var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = log4js.getLogger();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.post('/api/turtle_message', jsonParser, function(req, res){
	logger.debug('Got a turtle message!');
	logger.debug(req.body);
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