function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

if (is_server()) {
    var currenciesLibrary = require("./currencies.js");
    var Currencies = currenciesLibrary.Currencies;
    var CurrencySymbols = currenciesLibrary.CurrencySymbols;
}

// $.ajaxPrefilter(function(options) {
//     if (options.crossDomain && jQuery.support.cors) {
//         var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
//         options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
//     }
// });

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

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

BaseAnalyzer.prototype.getHtmlFromUrl = function() {
    return new Promise((resolve, reject) => {
        if (this.htmlFromUrl) {
            resolve(this.htmlFromUrl);
        } else {
            $.ajax({
                url: this.url,
                crossDomain: true,
                type: "GET",
                success: function(data) {
                    this.htmlFromUrl = data.responseText;
                    resolve(data.responseText);
                },
                error: function(data) {
                    reject(data);
                }
            });
        }
    });
}

// Emag.bg analyzer class

function EmagAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

EmagAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EmagAnalyzer.prototype.getPrice = function() {
    debugger;
    this.currency = Currencies.BGN;

    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var priceNodes = $html.find(".product-new-price");
            var priceNode = priceNodes.html().trim();
            var splitPriceNode = priceNode.split("<sup>");
            var mainPriceNode = splitPriceNode[0].replace(".", "");
            var mainPrice = parseInt(mainPriceNode);
            var subPrice = parseInt(splitPriceNode[1].split("</sup>")[0]);
            var fullPrice = mainPrice + (subPrice / 100);
            resolve(fullPrice);
        });
    });
}

EmagAnalyzer.prototype.getName = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var nameNodes = $html.find(".page-title");
            var name = nameNodes.html().trim();
            resolve(name);
        });
    });
}

EmagAnalyzer.prototype.getImageUrl = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl()
            .then(html => {
                var $html = $(html);
                var image = $html.find("li[data-ph-id='image-0'] img");
                if (!image) {
                    reject(null);
                }
                var imgSource = image.attr('src');
                resolve(imgSource);
            })
            .catch(err => {
                console.log("error occured: ", err);
            });
    });
};


// Amazon.co.uk analyzer class

function EbayCoUkAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

EbayCoUkAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EbayCoUkAnalyzer.prototype.getPrice = function() {
    debugger;
    this.currency = Currencies.GBP;

    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var priceNodes = $html.find("#prcIsum");
            var priceNode = priceNodes.attr('content').trim();
            var fullPrice = parseFloat(priceNode);
            resolve(fullPrice);
        });
    });
}

EbayCoUkAnalyzer.prototype.getName = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var productNameSpan = $html.find("#itemTitle");
            if (!productNameSpan) {
                reject("Product name span not found");
            }
            var productName = unescape(productNameSpan.html().split("</span>")[1]);
            resolve(productName);
        });
    });
}

EbayCoUkAnalyzer.prototype.getImageUrl = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl()
            .then(html => {
                var $html = $(html);
                var image = $html.find("#icImg");
                if (!image) {
                    reject(null);
                }
                var imgSource = image.attr('src');
                resolve(imgSource);
            })
            .catch(err => {
                console.log("error occured: ", err);
            });
    });
};

(function(exports) {
    exports.BaseAnalyzer = BaseAnalyzer;
    exports.EmagAnalyzer = EmagAnalyzer;
    exports.EbayCoUkAnalyzer = EbayCoUkAnalyzer;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);