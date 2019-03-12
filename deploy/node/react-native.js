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
