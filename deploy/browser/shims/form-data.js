// Browser shim for the Node-only `form-data` package.
// brainCloudClient-file.js does `window.FormData = require('form-data')` for multipart
// uploads; browsers ship FormData natively, so resolve the import to the native class.
module.exports = (typeof FormData !== 'undefined') ? FormData : function FormData() {};
