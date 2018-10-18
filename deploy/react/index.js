

var bc = require("./lib/brainCloudClient.concat.js")
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage/LocalStorage').LocalStorage;
    os = require('os');
    const configDir = os.homedir() + "/.bciot";
    localStorage = new LocalStorage(configDir);
}

exports.BrainCloudWrapper = bc.BrainCloudWrapper
exports.BrainCloudClient = bc.BrainCloudClient