var WifiSetting = require("./WifiSetting.js"),
	chai = require('chai'),
	expect = chai.expect,
	assert = chai.assert,
	should = chai.should(),
	sinon = require('sinon'),
	mockFs = require('mock-fs'),
	fs = require('fs');

var wpaSupplicantContentFilled = 	'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n' +
									'update_config=1\n' +
									'\n' +
									'network={\n' +
									'	ssid="Test SSID"\n' +
									'	proto=RSN\n' +
									'	key_mgmt=WPA-PSK\n' +
									'	pairwise=CCMP TKIP\n' +
									'	group=CCMP TKIP\n' +
									'	psk="YourPresharedKeyHere"\n' +
									'}' +
									'Some More Content';

var wpaSupplicantContentSimple = 	'network={\n' +
									'	ssid="Test SSID"\n' +
									'	proto=RSN\n' +
									'	key_mgmt=WPA-PSK\n' +
									'	pairwise=CCMP TKIP\n' +
									'	group=CCMP TKIP\n' +
									'	psk="YourPresharedKeyHere"\n' +
									'}';

var wpaSupplicantContentSimple2 = 	'network={\n' +
									'	ssid="Test SSID"\n' +
									'	proto=RSN\n' +
									'	key_mgmt=WPA-PSK\n' +
									'	pairwise=CCMP TKIP\n' +
									'	group=CCMP TKIP\n' +
									'	psk="YourPresharedKeyHere"\n' +
									'}' +
									'Some More Content';

var wpaSupplicantContentAfterWrite = 	'ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\n' +
										'update_config=1\n' +
										'\n' +
										'network={\n' +
										'	ssid="New SSID"\n' +
										'	psk="somePassphrase"\n' +
										'}\n' +
										'Some More Content';

var wpaSupplicantContentAfterWriteSimple = 	'network={\n' +
											'	ssid="New SSID"\n' +
											'	psk="somePassphrase"\n' +
											'}\n';

var wpaSupplicantContentAfterWriteSimple2 = 'network={\n' +
											'	ssid="New SSID"\n' +
											'	psk="somePassphrase"\n' +
											'}\n' +
											'Some More Content';

describe("WifiSettings", function() {
	var wifiSetting, fsStub;
	beforeEach(function() {
		wifiSetting = new WifiSetting();
	});

	afterEach(function() {
		mockFs.restore();
	});
	
	it("shout be instantiated", function() {
		wifiSetting = new WifiSetting();
		expect(wifiSetting).not.to.be.undefined;
	});

	describe("reading", function() {
		it("should fail if we don't have access to the wpa_supplicant file", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({mode: 000})
			});
			wifiSetting.read(function(error, data) {
				expect(error).to.deep.equal({error: true, message: "No access to wifi settings"});
				done();
			});
		});

		it("should return the wifi settings if wpa supplicant file contains settings", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: wpaSupplicantContentFilled})
			});
			wifiSetting.read(function(error, data) {
				expect(error).to.equal(null);
				expect(data.ssid).to.equal("Test SSID");
				done();
			});
		});

		it("should return the wifi settings if wpa supplicant file contains settings", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: wpaSupplicantContentFilled})
			});
			wifiSetting.read(function(error, data) {
				expect(error).to.equal(null);
				expect(data.ssid).to.equal("Test SSID");
				done();
			});
		});

		it("should return an error if wpa supplicant file contains no settings", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: ""})
			});
			wifiSetting.read(function(error, data) {
				expect(data).to.be.undefined;
				expect(error).to.deep.equal({error: false, message: "No wifi configured"});
				done();
			});
		});
	});

	describe("writing", function() {
		it("should fail if we don't have access to the wpa_supplicant file", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({mode: 000})
			});
			wifiSetting.write({}, function(error, data) {
				expect(error).to.deep.equal({error: true, message: "No access to wifi settings"});
				done();
			});
		});

		it("should overwrite the wifi settings if wpa supplicant file contains settings I", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: wpaSupplicantContentFilled})
			});
			wifiSetting.write({ssid: "New SSID", passphrase: "somePassphrase"}, function(error, data) {
				expect(error).to.equal(null);
				wifiSetting.read(function(error, data) {
					expect(error).to.equal(null);
					expect(data.ssid).to.equal("New SSID");
					expect(fs.readFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", 'utf8')).to.equal(wpaSupplicantContentAfterWrite);
					done();
				});
			});
		});

		it("should overwrite the wifi settings if wpa supplicant file contains settings II", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: wpaSupplicantContentSimple})
			});
			wifiSetting.write({ssid: "New SSID", passphrase: "somePassphrase"}, function(error, data) {
				expect(error).to.equal(null);
				wifiSetting.read(function(error, data) {
					expect(error).to.equal(null);
					expect(data.ssid).to.equal("New SSID");
					expect(fs.readFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", 'utf8')).to.equal(wpaSupplicantContentAfterWriteSimple);
					done();
				});
			});
		});

		it("should overwrite the wifi settings if wpa supplicant file contains settings III", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: wpaSupplicantContentSimple2})
			});
			wifiSetting.write({ssid: "New SSID", passphrase: "somePassphrase"}, function(error, data) {
				expect(error).to.equal(null);
				wifiSetting.read(function(error, data) {
					expect(error).to.equal(null);
					expect(data.ssid).to.equal("New SSID");
					expect(fs.readFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", 'utf8')).to.equal(wpaSupplicantContentAfterWriteSimple2);
					done();
				});
			});
		});

		it("should write the wifi settings if wpa supplicant file contains no settings", function(done) {
			mockFs({
				"/etc/wpa_supplicant/wpa_supplicant.conf": mockFs.file({content: ""})
			});
			wifiSetting.write({ssid: "New SSID", passphrase: "somePassphrase"}, function(error, data) {
				expect(error).to.equal(null);
				wifiSetting.read(function(error, data) {
					expect(error).to.equal(null);
					expect(data.ssid).to.equal("New SSID");
					done();
				});
			});
		});
	});
});