"use strict";

var express = require('express');
var app = express();
var log4js = require('log4js');
var logger = logger = log4js.getLogger();
var bodyParser = require('body-parser');
var UUID = require('node-uuid');
var moment = require('moment');

if (process.env.NODE_ENV != 'test') {
	logger.setLevel('DEBUG');
} else {
	logger.setLevel('ERROR');
}

var messages = [];
var message_limit = 100;
var read_messages = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/message', function(req, res){
	logger.debug('Got a message!');
	try {
		var message = fix_cc_message(req.body);
		if (message != null) {
			log_message(message);
			res.send({status: "ok"});
		} else {
			res.send({status: "error"});
		}
	} catch (error) {
		logger.error(error);
		res.send({status: "error"});
	}
});

app.get('/api/message/:id?', function(req, res){
	try {
		logger.debug('Received a message get request!');
		var this_message = get_message(req.params.id);
		if (this_message != null) {
			res.send(this_message);
		} else {
			res.send({status: 'error'});
		}
	} catch (error) {
		logger.error(error);
		res.send({status: "error"});
	}
});

app.get('/api/messages', function(req, res){
	try {
		logger.debug('Received a messages get request!');
		var number = req.query.number;
		if (number) {
			var this_messages = get_messages(number);
			res.send(this_messages);
		} else {
			var this_messages = get_messages();
			res.send(this_messages);
		}
	} catch (error) {
		logger.error(error);
		res.send({status: 'error'});
	}
});

app.get("/api/time", function(req, res){
	try {
		logger.debug('Received a get time request');
		res.send(moment().format());
	} catch (error) {
		logger.error(error);
		res.send({status: 'error'});
	}
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
	read_messages.push({uuid: message.uuid, read:[message.computer_id]});
	while (messages.length > message_limit) {
		messages.shift();
	}
	while (read_messages.length > message_limit) {
		read_messages.shift();
	}
	return true;
}

function purge_messages() {
	messages = [];
	read_messages = [];
	return true;
}

function get_messages(number) {
	try {
		if (number == null || number == undefined) {
			return messages.slice(0);
		} else {
			var this_messages = messages.slice(0);
			while (this_messages.length > number) {
				this_messages.shift();
			}
			return this_messages;
		}
	} catch (error) {
		logger.error(error);
		return null;
	}
}

function get_message(uuid, computer_id) {
	try {
		var this_messages = messages;
		var this_read_messages = read_messages;
		if (uuid == null || uuid == undefined) {
			return this_messages[this_messages.length -1];
		} else {
			if (this_messages.map(function(element){return element.uuid;}).indexOf(uuid) != -1) {
				if (computer_id != null && computer_id != undefined) {
					var currently_read = this_read_messages[this_read_messages.map(function(element){return element.uuid;}).indexOf(uuid)].read;
					if (currently_read.indexOf(computer_id) == -1) {
						currently_read.push(computer_id);
						this_read_messages[this_read_messages.map(function(element){return element.uuid;}).indexOf(uuid)].read = currently_read;
					}
				}
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

function get_read() {
	return read_messages.slice(0);
}

exports.fix_cc_message = fix_cc_message;
exports.log_message = log_message;
exports.get_messages = get_messages;
exports.purge_messages = purge_messages;
exports.message_limit = message_limit;
exports.get_message = get_message;
exports.get_read = get_read;