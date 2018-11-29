'use strict';
class XMLHttpRequest4Upload { 
    constructor() {
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
    open ( method, url, async) {
        this.url = url;
        this.method = method;
        this.async = async;
    }
    send ( form ) {
        var request = form.submit(this.url, function(err, res) {
            if (err) {
                this.observer["error"](err);    
            } else {
                this.observer["load"](res);
            }
            res.resume();
        }.bind(this));
        // console.log(" Request is " + request );
    }

    addEventListener (event,callback) {
        this.observer[event] = callback 
    }
}

exports.XMLHttpRequest4Upload = XMLHttpRequest4Upload