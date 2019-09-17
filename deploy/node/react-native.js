// Set up AsyncStorage.
var AsyncStorage = null;
try {
    AsyncStorage = require('@react-native-community/async-storage').default
} catch (er) {
    AsyncStorage = {
        getItem: function () { },
        setItem: function () { }
    };
}

// Set up BackgroundTimer.
var BackgroundTimer = null;
var customSetInterval = null;
try {
    BackgroundTimer = require('react-native-background-timer').default;
    customSetInterval = function (func, interval) { BackgroundTimer.setInterval(func, interval); };
} catch (e) {
    customSetInterval = null;
}

/* 
 *   BrainCloudClient expect localStorage to be available as a
 *   synchronous API, this will simulate the minimum required 
 *   functions and use AsyncStorage to persist the data. 
 */
var localStorageData = {};

try {
    AsyncStorage.getItem("@AppData", function (err, result) {
        if (result) {
            localStorageData = JSON.parse(result);
        } else if (err) {
            console.error(err);
        } else {
            console.log("No Data");
        }
    });
} catch (reason) {
    console.error("Error loading localStorage " + reason);
    reject(reason);
}

if (typeof localStorage === 'undefined' || localStorage === null) {
    localStorage = {
        getItem: function (key) {
            value = null;
            if (localStorageData.hasOwnProperty(key)) {
                value = localStorageData[key];
            }
            return value;
        },
        setItem: function (key, value) {
            localStorageData[key] = value;
            AsyncStorage.setItem("@AppData", JSON.stringify(localStorageData), function (error) {
                if (error)
                    console.error("Persisted localStorage returned " + JSON.stringify(error));
            });
        }
    }
}

function XMLHttpRequest4Upload() {
    this.upload = {
        addEventListener: this.addEventListener.bind(this)
    };
    this.observer = {
        load: null,
        error: null,
        abort: null,
        progress: null
    }
}
XMLHttpRequest4Upload.prototype.open = function (method, url, async) {
    this.url = url;
    this.method = method;
    this.async = async;
}
XMLHttpRequest4Upload.prototype.send = function (form) {
    form.submit(this.url, function (err, res) {
        if (err) {
            this.observer["error"](err);
        } else {
            this.observer["load"](res);
        }
        res.resume();
    }.bind(this));
}
XMLHttpRequest4Upload.prototype.addEventListener = function (event, callback) {
    this.observer[event] = callback
}

// Lastly, import the brainCloudClient module.
var bc = require("./lib/brainCloudClient.concat.js")

exports.XMLHttpRequest4Upload = XMLHttpRequest4Upload;
exports.BrainCloudWrapper = bc.BrainCloudWrapper
exports.BrainCloudClient = bc.BrainCloudClient
