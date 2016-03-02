var NetworkInterface = require("./NetworkInterface.js"),
	chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should(),
	sinon = require('sinon'),
	child_process = require('child_process');

describe("NetworkInterface", function() {
	var networkInterface, execStub, execError;
	beforeEach(function() {
		execError = false;
		execStub = sinon.stub(child_process, 'exec', function(command, fnCallback) {
			fnCallback(execError ? 'error' : undefined);
		});
		networkInterface = new NetworkInterface(execStub, "wlan0");
	});

	afterEach(function() {
		execStub.restore();
	});
	
	it("shout be instantiated", function() {
		networkInterface = new NetworkInterface();
		expect(networkInterface).not.to.be.undefined;
	});

	it("should know its name", function() {
		expect(networkInterface.getName()).to.equal("wlan0");
	});

	describe("restart", function() {
		it("should be performed", function(done) {
			networkInterface.restart(function(error) {
				expect(error).to.be.undefined;
				done();
			});
		});

		it("should pass an error if exec fails", function(done) {
			execError = true;
			networkInterface.restart(function(error) {
				expect(error).to.equal("Could not restart network interface");
				done();
			});
		});
	});
});