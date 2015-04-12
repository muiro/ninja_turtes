"use strict";

var expect = require('chai').expect;
var request = require('supertest');
process.env.NODE_ENV = 'test';
var app = require(__dirname + '/../index.js');
var log4js_debug = require('log4js');

var logger = log4js_debug.getLogger();


describe("ninja_turtles", function(){

	describe("#fix_cc_message()", function(){
		it("should parse ComputerCraft HTTP API messages", function(done){
			var message = {
				'{"message":"test message"}': ''
			};
			var message_object = app.fix_cc_message(message);
			expect(JSON.stringify(message_object)).to.equal(JSON.stringify({message: 'test message'}));
			done();
		});
	});

	describe("turtle_message", function(){
		it("should accept a json message and return ", function(done){
			var message = {
				'{"message":"test message"}': ''
			};
			request("http://localhost:3000")
			.post("/api/turtle_message")
			.send(message)
			// .end(function(err, res){
			// 	if (err) {
			// 		throw err;
			// 	}
			// 	// for (var key in res) {
			// 	// 	logger.debug(key);
			// 	// }
			// 	// logger.debug(res.request);
			// 	var keys = Object.keys(res.request);
			// 	keys.sort();
			// 	for (var i = 0; i < keys.length; i++) {
			// 		logger.debug(keys[i]);
			// 	}
			// 	done();
			// });-
			.end(function(err, res){
				if (err) return done(err);
				done();
			});
		});
	});
});