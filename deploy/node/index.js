window = {"navigator": {"userLanguage":"en"}};
CryptoJS = {};
window.FormData = require('form-data');
FormData = window.FormData;

var bc = require("./lib/brainCloudClient.concat.js")
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    os = require('os');
    const configDir = os.homedir() + "/.bciot";
    localStorage = new LocalStorage(configDir);
}
window.XMLHttpRequest = require("xmlhttprequest-ssl").XMLHttpRequest;
XMLHttpRequest = window.XMLHttpRequest;

XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

// XMLHttpRequest4Upload = require('./xmlHttpRequest4Upload.js');
// class XMLHttpRequest4Upload { 
//     constructor() {
//         this.upload = { 
//             addEventListener : this.addEventListener.bind(this)
//         };
//         this.observer = { 
//             load:null,
//             error:null,
//             abort:null,
//             progress:null
//         }
//     }
//     open ( method, url, async) {
//         this.url = url;
//         this.method = method;
//         this.async = async;
//     }
//     send ( form ) {
//         var request = form.submit(this.url, function(err, res) {
//             if (err) {
//                 this.observer["error"](err);    
//             } else {
//                 this.observer["load"](res);
//             }
//             res.resume();
//         }.bind(this));
//         // console.log(" Request is " + request );
//     }

//     addEventListener (event,callback) {
//         this.observer[event] = callback 
//     }
// }

CryptoJS.MD5 = require('md5');

exports.XMLHttpRequest4Upload = require('./xmlHttpRequest4Upload.js').XMLHttpRequest4Upload;
exports.BrainCloudWrapper = bc.BrainCloudWrapper
exports.BrainCloudClient = bc.BrainCloudClient