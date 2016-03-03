var NetworkInterface = (function() {
	var fs = require('fs');

	return function(oExec, sIfaceKey) {
		this.getName = function() {
			return sIfaceKey;
		};

		this.start = function(fnCallback) {
			var that = this;
			fs.readFile("/sys/class/net/" + this.getName() + "/operstate", 'utf8', function(readFileError, data) {
				if(readFileError) {
					return fnCallback({error: true, message: "unable to retrieve interface information"});
				}

				if(data === "down") {
					oExec("ifup " + that.getName(), function(error) {
						if(error) {
							return fnCallback("Could not start network interface");
						}
						fnCallback();
					});
				} else if(data === "up") {
					fnCallback({error: false, message: "interface already up"});
				}
			});
		};

		this.stop = function(fnCallback) {
			var that = this;
			fs.readFile("/sys/class/net/" + this.getName() + "/operstate", 'utf8', function(readFileError, data) {
				if(readFileError) {
					return fnCallback({error: true, message: "unable to retrieve interface information"});
				}

				if(data === "up") {
					oExec("ifdown " + that.getName(), function(error) {
						if(error) {
							return fnCallback("Could not stop network interface");
						}
						fnCallback();
					});
				} else if(data === "down") {
					fnCallback({error: false, message: "interface already down"});
				}
			});
		};

		this.restart = function(fnCallback) {
			var that = this;
			this.stop(function(stopError) {
				if(!stopError || stopError.error === false) {
					that.start(function(startError) {
						if(startError) {
							if(startError.hasOwnProperty("error") && startError.error === false) {
								return fnCallback();
							}
							return fnCallback({error: true, message: "Could not restart network interface"});
						}
						fnCallback();
					});
				} else {
					fnCallback({error: true, message: "Could not restart network interface"});
				}
			});
		};
	};
})();

module.exports = NetworkInterface;