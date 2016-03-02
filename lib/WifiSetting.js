var WifiSetting = (function() {
	var fs = require('fs');
	var async = require('async');

	function assertAccessToWpaSupplicant(fnCallback) {
		fs.access("/etc/wpa_supplicant/wpa_supplicant.conf", fs.W_OK, function(error) {
			if(error) {
				fnCallback({error: true, message: "No access to wifi settings"});
			} else {
				fnCallback();
			}
		});
	}

	function readWpaSupplicant(fnCallback) {
		fs.readFile("/etc/wpa_supplicant/wpa_supplicant.conf", 'utf8', function(error, data) {
			if(error) {
				fnCallback(error);
			} else {
				var result = /network=\{[\s\S]*ssid=\"(.*)\"[\s\S]*\}/gi.exec(data);
				if(result && result.length > 0) {
					var wifiData = {};
					wifiData.ssid = result[1];
					fnCallback(undefined, wifiData);
				} else {
					fnCallback({error: false, message: "No wifi configured"});
				}
			}
		});
	}

	function writeWpaSupplicant(oData, fnCallback) {
		fs.readFile("/etc/wpa_supplicant/wpa_supplicant.conf", 'utf8', function(error, data) {
			if(error) {
				fnCallback(error);
			} else {
				var networkString = "";
				if(oData) {
					networkString = 'network={\n' +
									'	ssid="' + oData.ssid + '"\n' +
									'	psk="' + oData.passphrase + '"\n' +
									'}\n';
				}
				var result = /([\s\S]*)(network=\{[\s\S]*\})([\s\S]*)/gi.exec(data);
				var content;
				if(!result || result.length === 0) {
					content = networkString;
				} else {
					content = result[1] + networkString + (result[3] ? result[3] : "");
				}
				fs.writeFile("/etc/wpa_supplicant/wpa_supplicant.conf", content, 'utf8', function(error) {
					fnCallback(error);
				});
			}
		});
	}

	function clearWpaSupplicant(oData, fnCallback) {
		writeWpaSupplicant(null, fnCallback);
	}

	return function(oFsLib) {
		this.read = function(fnCallback) {
			async.series([
				assertAccessToWpaSupplicant,
				readWpaSupplicant
			], function(error, data) {
				fnCallback(error, data[1]);
			});
		};

		this.write = function(data, fnCallback) {
			async.series([
				assertAccessToWpaSupplicant,
				function(fnCallback) { writeWpaSupplicant(data, fnCallback) }
			], function(error, data) {
				fnCallback(error, data[1]);
			});
		};

		this.reset = function(fnCallback) {
			async.series([
				assertAccessToWpaSupplicant,
				function(fnCallback) { writeWpaSupplicant(null, fnCallback) }
			], function(error, data) {
				fnCallback(error, data[1]);
			});
		};
	};
})();

module.exports = WifiSetting;