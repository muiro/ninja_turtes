"use strict";

var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = logger = log4js.getLogger();
var bodyParser = require('body-parser');
var UUID = require('node-uuid');

if (process.env.NODE_ENV != 'test') {
	logger.setLevel('DEBUG');
} else {
	logger.setLevel('ERROR');
}

var messages = [];
var message_limit = 100;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/message', function(req, res){
	logger.debug('Got a message!');
	var message = fix_cc_message(req.body);
	if (message != null) {
		log_message(message);
		res.send({status: "ok"});
	} else {
		res.send({status: "error"});
	}
});

app.get('/api/message/:id?', function(req, res){
	logger.debug('Received a message get request!');
	var this_message = get_message(req.params.id);
	if (this_message != null) {
		res.send(this_message);
	} else {
		res.send({status: 'error'});
	}
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
	try {
		for(var key in message) {
			data = JSON.parse(key);
		}

		return data;
	} catch (error) {
		return null;
	}
}

function log_message(message) {
	messages.push(message);
	while (messages.length > message_limit) {
		messages.shift();
	}
	return true;
}

function purge_messages() {
	messages = [];
	return true;
}

function get_messages() {
	try {
		return messages.slice(0);
	} catch (error) {
		logger.error(error);
		return null;
	}
}

function get_message(uuid) {
	try {
		var this_messages = get_messages();
		if (uuid == null || uuid == undefined) {
			return this_messages[this_messages.length -1];
		} else {
			if (this_messages.map(function(element){return element.uuid;}).indexOf(uuid) != -1) {
				return this_messages[this_messages.map(function(element){return element.uuid;}).indexOf(uuid)];
			} else {
				logger.debug(uuid + " not in message queue");
				return null;
			}
		}
		return null;
	} catch (error) {
		logger.error(error);
		return null;
	}
}

exports.fix_cc_message = fix_cc_message;
exports.log_message = log_message;
exports.get_messages = get_messages;
exports.purge_messages = purge_messages;
exports.message_limit = message_limit;
exports.get_message = get_message;