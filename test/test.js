"use strict";

var expect = require('chai').expect;
var request = require('supertest');
process.env.NODE_ENV = 'test';
var UUID = require('node-uuid');
var app = require(__dirname + '/../index.js');

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

		it("should return null if data is bad", function(done){
			var message = {
				'{"message":"test message"': ''
			};
			var message_object = app.fix_cc_message(message);
			expect(message_object).to.equal(null);
			done();
		});
	});

	describe("#get_message()", function(){
		it("should return a message by uuid", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				message: "#get_message(uuid) test message"
			};
			app.log_message(message);
			var result = app.get_message(uuid);
			expect(result).to.deep.equal(message);
			done();
		});

		it("should return null if no message by that uuid exists", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var result = app.get_message(uuid);
			expect(result).to.equal(null);
			done();
		});

		it("should return the most recent message if no uuid is passed", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var uuid2 = UUID.v4();
			var message = {
				uuid: uuid,
				message: "#get_message(uuid) test message 1"
			};
			var message2 = {
				uuid: uuid2,
				message: "#get_message(uuid) test message 2"
			};
			app.log_message(message);
			app.log_message(message2);
			var result = app.get_message();
			expect(result).to.deep.equal(message2);
			done();
		});
	});

	describe("#get_messages()", function(){
		it("should return the message queue", function(done){
			app.purge_messages();
			var messages = app.get_messages();
			expect(messages).to.deep.equal([]);
			done();
		});
	});

	describe("#log_message()", function(){
		it("should accept a message and place it in the messages queue", function(done){
			app.purge_messages();
			app.log_message("test");
			expect(app.get_messages()).to.deep.equal(['test']);
			done();
		});

		it("should add a second message to the queue", function(done){
			app.purge_messages();
			app.log_message("test");
			app.log_message("test2");
			expect(app.get_messages()).to.deep.equal(['test', 'test2']);
			done();
		});

		it("should only keep " + app.message_limit + " messages in the queue", function(done){
			app.purge_messages();
			var messages = [];
			for (var i = 0; i < app.message_limit + 10; i++) {
				app.log_message("test " + i);
				messages.push("test " + i);
			}
			while (messages.length > app.message_limit) {
				messages.shift();
			}
			expect(app.get_messages()).to.deep.equal(messages);
			done();
		});
	});

	describe("#purge_messages()", function(){
		it("should set blank out the messages queue", function(done){
			app.purge_messages();
			app.log_message("test");
			app.purge_messages();
			expect(app.get_messages()).to.deep.equal([]);
			done();
		});
	});

	describe("/api", function(){
		describe("/message POST", function(){
			it("should accept a json message and return status: ok", function(done){
				var message = {
					'{"message":"test message"}': ''
				};
				request("http://localhost:3000")
				.post("/api/message")
				.send(message)
				.end(function(err, res){
					if (err) return done(err);
					expect(res.body).to.deep.equal({status: 'ok'});
					done();
				});
			});

			it("should return status: error if message is not json or it can't be parsed", function(done){
				var message = {
					'{"message":"test message"': ''
				};
				request("http://localhost:3000")
				.post("/api/message")
				.send(message)
				.end(function(err, res){
					if (err) return done(err);
					expect(res.body).to.deep.equal({status: 'error'});
					done();
				});
			});

			it("should add new messages to the message queue", function(done){
				app.purge_messages();
				var message = {
					'{"message":"test message2"}': ''
				};
				request("http://localhost:3000")
				.post("/api/message")
				.send(message)
				.end(function(err, res){
					if (err) return done(err);
					expect(app.get_messages()).to.deep.equal([{message: "test message2"}]);
					done();
				});
			});
		});

		describe("/message/:id GET", function(){
			it("should return a message by the specified uuid", function(done){
				app.purge_messages();
				var uuid = UUID.v4();
				var message = {
					uuid: uuid,
					message: "/message/:id GET test message"
				};
				app.log_message(message);
				request("http://localhost:3000")
				.get("/api/message/" + uuid)
				.send()
				.end(function(err, res){
					if (err) return done(err);
					expect(res.body).to.deep.equal(message);
					done();
				});
			});

			it("should return an error if the message doesn't exist in the queue", function(done){
				app.purge_messages();
				var uuid = UUID.v4();
				request("http://localhost:3000")
				.get("/api/message/" + uuid)
				.send()
				.end(function(err, res){
					if (err) return done(err);
					expect(res.body).to.deep.equal({status: 'error'});
					done();
				});
			});

			it("should return the most recent message if no uuid is specified", function(done){
				app.purge_messages();
				var uuid = UUID.v4();
				var message = {
					uuid: uuid,
					message: "/message/:id GET test message 1"
				};
				var uuid2 = UUID.v4();
				var message2 = {
					uuid: uuid2,
					message: "/message/:id GET test message 2"
				};
				app.log_message(message);
				app.log_message(message2);
				request("http://localhost:3000")
				.get("/api/message/")
				.send()
				.end(function(err, res){
					if (err) return done(err);
					expect(res.body).to.deep.equal(message2);
					done();
				});
			});
		});
	});
});