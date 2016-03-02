var NetworkInterface = require('./lib/NetworkInterface.js');
var WifiSetting = require('./lib/WifiSetting.js');

var interface = new NetworkInterface('wlan0');
var setting = new WifiSetting();

module.exports = {
	resetWifi: function(fnCallback) {
		setting.clear(function(error) {
			if(error) {
				return fnCallback(error);
			}
			interface.restart(function(error) {
				fnCallback(error);
			});
		});
	},
	connectToWifi: function(oOptions, fnCallback) {
		setting.write(oOptions, function(error) {
			if(error) {
				return fnCallback(error);
			}
			interface.restart(function(error) {
				fnCallback(error);
			});
		});
	},
	getCurrentWifiSettings: function(fnCallback) {
		setting.read(function(error, data) {
			if(error) {
				fnCallback(error);
			} else {
				fnCallback(undefined, data);
			}
		});	
	}
}
