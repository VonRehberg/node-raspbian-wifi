var NetworkInterface = (function() {
	return function(oExec, sIfaceKey) {
		this.getName = function() {
			return sIfaceKey;
		};

		this.restart = function(fnCallback) {
			var that = this;
			oExec("ifdown " + that.getName(), function(error) {
				if(error) {
					return fnCallback("Could not restart network interface");
				}
				oExec("ifup " + that.getName(), function(error) {
					if(error) {
						return fnCallback("Could not restart network interface");
					}
					fnCallback();
				});
			});
		};
	};
})();

module.exports = NetworkInterface;