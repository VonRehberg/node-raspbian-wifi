# node-raspbian-wifi
This module enables you to setup wifi connections on a raspbian based device.
The user executing the module needs access to /etc/wpa_supplicant/wpa_supplicant.conf

## Usage
```javascript
var wifi = require('node-raspbian-wifi');

wifi.resetWifi(function(error) {
  console.log(error);
});

var options = {
  ssid: "YOUR_SSID",
  passphrase: "SECRET"
};

wifi.connectToWifi(options, function(error) {
  console.log(error);
});

wifi.getCurrentWifiSettings(function(error, data) {
  console.log(data.ssid);
});
```
