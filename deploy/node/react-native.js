
try {
    var AsyncStorage = require('@react-native-community/async-storage').default
} catch (er) {
    AsyncStorage = { 
        getItem: () => {},
        setItem: () => {}
    };
}
/* 
 *   BrainCloudClient expect localStorage to be available as a
 *   synchronous API, this will simulate the minimum required 
 *   functions and use AsyncStorage to persist the data. 
 */
localStorageData ={};

try {
    AsyncStorage.getItem("@AppData", function (err, result) {
      if (result) {
        localStorageData = JSON.parse(result);
      } else if (err) {
        console.error(err);
      } else {
        console.log("No Data");
      }
    })
  } catch (reason) {
    console.error("Error loading localStorage " + reason);
    reject(reason);
  }
  
  localStorage = {
    getItem(key) {
      value = null;
      if (localStorageData.hasOwnProperty(key)) {
        value = localStorageData[key];
      }
      return value;
    },
    setItem(key, value) {
      localStorageData[key] = value;
      AsyncStorage.setItem("@AppData", JSON.stringify(localStorageData), function (error) {
        if (error)
          console.error("Persisted localStorage returned " + JSON.stringify(error));  
      });
    }
  }

// MD5
if (typeof CryptoJS === "undefined" || CryptoJS === null) {
    CryptoJS = {};
}
if (!CryptoJS.MD5) {
    CryptoJS.MD5 = require('md5');
}

var bc = require("./lib/brainCloudClient.concat.js")

function XMLHttpRequest4Upload() {
    this.upload = { 
        addEventListener : this.addEventListener.bind(this)
    };
    this.observer = { 
        load:null,
        error:null,
        abort:null,
        progress:null
    }
}
XMLHttpRequest4Upload.prototype.open = function(method, url, async) {
    this.url = url;
    this.method = method;
    this.async = async;
}
XMLHttpRequest4Upload.prototype.send = function(form) {
    form.submit(this.url, function(err, res) {
        if (err) {
            this.observer["error"](err);
        } else {
            this.observer["load"](res);
        }
        res.resume();
    }.bind(this));
}
XMLHttpRequest4Upload.prototype.addEventListener = function(event,callback) {
    this.observer[event] = callback 
}

exports.XMLHttpRequest4Upload = XMLHttpRequest4Upload;
exports.BrainCloudWrapper = bc.BrainCloudWrapper
exports.BrainCloudClient = bc.BrainCloudClient
