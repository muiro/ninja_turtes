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

		it("should mark a message as read when a uuid is passed", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_label: 'Test',
				computer_id: 11,
				message: "#get_message() test message"
			};
			app.log_message(message);
			app.get_message(uuid, 12);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid, read: [11, 12]}]);
			done();
		});

		it("should return the oldest unread message if no uuid is passed", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var uuid2 = UUID.v4();
			var message11 = {
				uuid: uuid,
				computer_label: 'Test 11',
				computer_id: 11,
				message: "#get_message() test message 11"
			};
			var message12 = {
				uuid: uuid2,
				computer_label: 'Test 12',
				computer_id: 12,
				message: "#get_message() test message 12"
			};
			app.log_message(message11);
			app.log_message(message12);
			var result = app.get_message(null, 12);
			expect(result).to.deep.equal(message11);
			done();
		});

		it("should return null if there are no unread messages if no uuid is passed", function(done){
			app.purge_messages();
			var result = app.get_message(null, 12);
			expect(result).to.equal(null);
			done();
		});

		it("should mark the message as read by the requesting computer", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_label: 'Test',
				computer_id: 11,
				message: "#get_message() test message"
			};
			app.log_message(message);
			app.get_message(null, 12);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid, read: [11, 12]}]);
			done();
		});

		it("should mark the message as read by additional computers that read it", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_label: 'Test',
				computer_id: 11,
				message: "#get_message() test message"
			};
			app.log_message(message);
			app.get_message(null, 12);
			app.get_message(null, 13);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid, read: [11, 12, 13]}]);
			done();
		});

		it("should not re-add a reader that already exists on a message's read queue", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_label: 'Test',
				computer_id: 11,
				message: "#get_message() test message"
			};
			app.log_message(message);
			app.get_message(null, 12);
			app.get_message(uuid, 12);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid, read: [11, 12]}]);
			done();
		});

		it("should not mark a message as read if no computer_id is passed", function(done){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_label: 'Test',
				computer_id: 11,
				message: "#get_message() test message"
			};
			app.log_message(message);
			app.get_message(uuid);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid, read: [11]}]);
			done();

		});
	});

	describe("#get_read()", function(){
		it("should return the read queue (an array)", function(done){
			var response = app.get_read();
			expect(response).to.be.an('array');
			done();
		});
	});

	describe("#get_messages()", function(){
		it("should return all messages from the queue if no number or computer id is specified", function(done){
			app.purge_messages();
			var messages = [];
			for (var i = 0; i < 20; i++) {
				var message = {
					uuid: UUID.v4(),
					computer_id: 11,
					message: "/messages GET test message " + i
				};
				app.log_message(message);
				messages.push(message);
			}

			var result = app.get_messages();
			expect(result).to.deep.equal(messages);
			done();
		});

		it("should return a certain number of messages if specified and with no computer id", function(done){
			app.purge_messages();
			var messages = [];
			for (var i = 0; i < 20; i++) {
				var message = {
					uuid: UUID.v4(),
					message: "get_messages() test message " + i
				};
				app.log_message(message);
				messages.push(message);
			}

			while (messages.length > 5) {
				messages.shift();
			}

			var result = app.get_messages(5);
			expect(result).to.deep.equal(messages);
			done();
		});

		it("should return a certain number of unread messages if number and computer id specified", function(done){
			app.purge_messages();
			var messages = [];
			for (var i = 0; i < 20; i++) {
				var message = {
					uuid: UUID.v4(),
					computer_id: 11,
					computer_label: 'Test get_messages()',
					message: "get_messages() test message " + i
				};
				app.log_message(message);
				messages.push(message);
			}

			while (messages.length > 5) {
				messages.shift();
			}

			var result = app.get_messages(5, 12);
			expect(result).to.deep.equal(messages);

			done();
		});

		it("should mark the messages as read by the requesting computer", function(done){
			app.purge_messages();
			var uuid11 = UUID.v4();
			var uuid12 = UUID.v4();
			var message11 = {
				uuid: uuid11,
				computer_id: 11,
				computer_label: 'Test 11',
				message: 'test message 11'
			};
			var message12 = {
				uuid: uuid12,
				computer_id: 12,
				computer_label: 'Test 12',
				message: 'test message 12'
			};
			app.log_message(message11);
			app.log_message(message12);
			var messages = app.get_messages(null, 13);
			var result = app.get_read();
			expect(result).to.deep.equal([{uuid: uuid11, read: [11, 13]}, {uuid: uuid12, read: [12, 13]}]);
			done();
		});

		it("should not return messages already read by the computer", function(done){
			app.purge_messages();
			var uuid11 = UUID.v4();
			var uuid12 = UUID.v4();
			var message11 = {
				uuid: uuid11,
				computer_id: 11,
				computer_label: 'Test 11',
				message: 'test message 11'
			};
			var message12 = {
				uuid: uuid12,
				computer_id: 12,
				computer_label: 'Test 12',
				message: 'test message 12'
			};
			app.log_message(message11);
			app.log_message(message12);
			var result = app.get_messages(null, 12);
			expect(result).to.deep.equal([message11]);
			done();
		});

		it("should return fewer than the number of specified messages if number and computer id passed but there exist fewer unread messages than specified", function(done){
			app.purge_messages();
			var messages = [];
			for (var i = 0; i < 20; i++) {
				var computer_id = 0;
				if (i % 2 == 0) {
					computer_id = 11;
				} else {
					computer_id = 12;
				}
				var message = {
					uuid: UUID.v4(),
					computer_id: computer_id,
					computer_label: 'Test get_messages()',
					message: "get_messages() test message " + i
				};
				app.log_message(message);
				messages.push(message);
			}

			messages = messages.filter(function(element){
				if (element.computer_id == 11) {
					return true;
				} else {
					return false;
				}
			});

			while (messages.length > 5) {
				messages.shift();
			}

			var result = app.get_messages(5, 12);
			expect(result).to.deep.equal(messages);

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

		it("should instantiate the read_messages[] element for the message", function(){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_id: 11,
				computer_label: 'Test',
				message: 'Test message'
			};
			app.log_message(message);
			expect(app.get_read()).to.have.length(1);
		});

		it("should only keep " + app.message_limit + " messages in the read_messages[] array", function(){
			app.purge_messages();
			for (var i = 0; i < app.message_limit + 2; i++) {
				var uuid = UUID.v4();
				var message = {
					uuid: uuid,
					computer_id: 11,
					computer_label: 'Test',
					message: 'Test message'
				};
				app.log_message(message);
			}
			var result = app.get_read();
			expect(result).to.have.length(100);
		});

		it("should mark the message as read by the posting computer", function(){
			app.purge_messages();
			var uuid = UUID.v4();
			var message = {
				uuid: uuid,
				computer_id: 11,
				computer_label: 'Test',
				message: 'Test message'
			};
			app.log_message(message);
			expect(app.get_read()).to.deep.equal([{uuid: uuid, read: [11]}]);
		});
	});

	describe("#purge_messages()", function(){
		it("should blank out the messages queue", function(done){
			app.purge_messages();
			app.log_message("test");
			app.purge_messages();
			expect(app.get_messages()).to.deep.equal([]);
			done();
		});

		it("should blank out the read messages queue", function(){
			app.purge_messages();
			app.log_message("test");
			app.purge_messages();
			expect(app.get_read()).to.deep.equal([]);
		});
	});

	describe("/api", function(){
		describe("/message", function(){
			describe("POST", function(){
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

				it("should mark the message as read by the posting computer", function(done){
					app.purge_messages();
					var uuid = UUID.v4();
					var message = {
						uuid: uuid,
						computer_label: 'Test',
						computer_id: 11,
						message: 'Test message'
					};
					message = make_cc_message(message);
					request("http://localhost:3000")
					.post("/api/message")
					.send(message)
					.end(function(err, res){
						if (err) return done(err);
						expect(app.get_read()).to.deep.equal([{uuid: uuid, read:[11]}]);
						done();
					});
				});

				it("should check for completeness of required fields in the request (comuter_id, computer_label, uuid, message) " + 
					" and return an error if not all are present");
			});

			describe("GET", function(){
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

				it("should accept a computer_id in the request object");
				it("should return the oldest unread message for the computer id if no uuid specified");
				it("should return {status: 'ok'} when there are no unread messages if no uuid is specified");
				it("should mark the message as read by the requesting computer");
				it("should check for completeness of required fields in the request (comuter_id) " + 
					" and return an error if not all are present");
			});
		});

		describe("/messages", function(){
			describe("GET", function(){
				it("should return all messages from the queue if no amount is specified", function(done){
					app.purge_messages();
					var messages = [];
					for (var i = 0; i < 20; i++) {
						var message = {
							uuid: UUID.v4(),
							message: "/messages GET test message " + i
						};
						app.log_message(message);
						messages.push(message);
					}

					request("http://localhost:3000")
					.get("/api/messages")
					.send()
					.end(function(err, res){
						if (err) return done(err);
						expect(res.body).to.deep.equal(messages);
						done();
					});
				});

				it("should return a certain number of messages if one is specified", function(done){
					app.purge_messages();
					var messages = [];
					for (var i = 0; i < 20; i++) {
						var message = {
							uuid: UUID.v4(),
							message: "/messages GET test message " + i
						};
						app.log_message(message);
						messages.push(message);
					}

					while (messages.length > 5) {
						messages.shift();
					}

					request("http://localhost:3000")
					.get("/api/messages?number=5")
					.send()
					.end(function(err, res){
						if (err) return done(err);
						expect(res.body).to.deep.equal(messages);
						done();
					});
				});

				it("should mark the messages as ready by the requesting computer");

				it("should check for completeness of required fields in the request (comuter_id) " + 
					" and return an error if not all are present");
			});
		});

		describe("/time", function(){
			describe("GET", function(){
				it("should return a time value in UTC", function(done){
					request("http://localhost:3000")
					.get("/api/time")
					.send()
					.end(function(err, res){
						if (err) return done(err);
						expect(res.text).to.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}/);
						done();
					});
				});
			});
		});
	});
});


function make_cc_message(object) {
	var string = JSON.stringify(object);
	var new_object = {};
	new_object[string] = '';
	return new_object;
}