var http = require("http");
var currencies = require("../currencies.js");

// Analyzer base class

function BaseAnalyzer(url) {
    this.url = url;
    this.htmlFromUrl = null;
    this.currency = "";
}

BaseAnalyzer.prototype.getUrl = function() {
    return this.url;
};

BaseAnalyzer.prototype.getPrice = function() {
    return 0;
};

BaseAnalyzer.prototype.getName = function() {
    return "";
};

BaseAnalyzer.prototype.getImageUrl = function() {
    return "";
};

BaseAnalyzer.prototype.getCurrencySymbol = function() {
    var currencySymbol = currencies.getCurrencySymbol(this.currency);
    return currencySymbol;
};

BaseAnalyzer.prototype.getHtmlFromUrl = function(callbackFunc) {
    if (this.htmlFromUrl) {} else {
        var options = {
            host: this.url,
            method: 'GET'
        };

        var that = this;
        var req = http.get(this.url, (res) => {
            var output = '';
            res.setEncoding('utf8');

            res.on('data', function(chunk) {
                output += chunk;
            });

            res.on('end', function() {
                that.htmlFromUrl = output;
                callbackFunc();
            });
        });

        req.on('error', function(err) {
            console.log('error occured: ', err);
        });

        req.end();
    }
}

module.exports = BaseAnalyzer;