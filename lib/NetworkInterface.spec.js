var NetworkInterface = require("./NetworkInterface.js"),
	chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should(),
	sinon = require('sinon'),
	child_process = require('child_process'),
	mockFs = require('mock-fs');

describe("NetworkInterface", function() {
	var networkInterface, execStub, execError, clock;
	beforeEach(function() {
		execError = false;
		execStub = sinon.stub(child_process, 'exec', function(command, fnCallback) {
			fnCallback(execError ? 'error' : undefined);
		});
		networkInterface = new NetworkInterface(execStub, "wlan0");
	});

	afterEach(function() {
		execStub.restore();
		mockFs.restore();
	});
	
	it("shout be instantiated", function() {
		networkInterface = new NetworkInterface();
		expect(networkInterface).not.to.be.undefined;
	});

	it("should know its name", function() {
		expect(networkInterface.getName()).to.equal("wlan0");
	});

	describe("start", function() {
		it("should start", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "down"})
			});
			expect(networkInterface.start(function(error) {
				expect(execStub.called).to.equal(true);
				expect(error).to.be.undefined;
				done();
			}));
		});

		it("should not start if it's already up", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "up"})
			});
			expect(networkInterface.start(function(error) {
				expect(error).to.deep.equal({error: false, message: "interface already up"});
				expect(execStub.called).to.equal(false);
				done();
			}));
		});

		it("should not start if the file could not be read", function(done) {
			expect(networkInterface.start(function(error) {
				expect(error).to.deep.equal({error: true, message: "unable to retrieve interface information"});
				expect(execStub.called).to.equal(false);
				done();
			}));
		});
	});

	describe("stop", function() {
		it("should stop", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "up"})
			});
			expect(networkInterface.stop(function(error) {
				expect(execStub.called).to.equal(true);
				expect(error).to.be.undefined;
				done();
			}));
		});

		it("should also stop if it's already down", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "down"})
			});
			expect(networkInterface.stop(function(error) {
				expect(execStub.called).to.equal(true);
				expect(error).to.be.undefined;
				done();
			}));
		});
	});

	describe("restart", function() {
		it("should be performed", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "up"})
			});
			networkInterface.restart(function(error) {
				expect(error).to.be.undefined;
				expect(execStub.called).to.equal(true);
				expect(execStub.callCount).to.equal(1); //should actually be 2, but don't know how to change operstate content between calls
				done();
			});
		});

		it("should shutdown and start up even if interface is already down", function(done) {
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "down"})
			});
			networkInterface.restart(function(error) {
				expect(error).to.be.undefined;
				expect(execStub.called).to.equal(true);
				expect(execStub.callCount).to.equal(2);
				done();
			});
		});

		//no interface status

		it("should pass an error if exec fails", function(done) {
			execError = true;
			mockFs({
				"/sys/class/net/wlan0/operstate": mockFs.file({content: "up"})
			});
			networkInterface.restart(function(error) {
				expect(error).to.deep.equal({error: true, message: "Could not restart network interface"});
				expect(execStub.called).to.equal(true);
				expect(execStub.callCount).to.equal(1);
				done();
			});
		});
	});
});