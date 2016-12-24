function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

if (is_server()) {
    var currenciesLibrary = require("./currencies.js");
    var Currencies = currenciesLibrary.Currencies;
    var CurrencySymbols = currenciesLibrary.CurrencySymbols;
    var getCurrencyFromWebsite = currenciesLibrary.getCurrencyFromWebsite;

    var coreLibrary = require("./core.js");
    var getWebsiteFromUrl = coreLibrary.getWebsiteFromUrl;
    var getNumberFromString = coreLibrary.getNumberFromString;

    var websitesLibrary = require("./websites.js");
    var Websites = websitesLibrary.Websites;
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


// Ebay analyzer class

function EbayAnalyzer(url) {
    BaseAnalyzer.call(this, url);
    this.website = getWebsiteFromUrl(url, false);
}

EbayAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EbayAnalyzer.prototype.getPrice = function() {
    this.currency = getCurrencyFromWebsite(this.website);

    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var priceNodes = $html.find("#prcIsum");
            var priceNode = priceNodes.html().trim();
            var fullPrice = getNumberFromString(priceNode);
            resolve(fullPrice);
        });
    });
}

EbayAnalyzer.prototype.getName = function() {
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

EbayAnalyzer.prototype.getImageUrl = function() {
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


// Technopolis analyzer class

function TechnopolisAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

TechnopolisAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

TechnopolisAnalyzer.prototype.getPrice = function() {
    this.currency = Currencies.BGN;

    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var priceNodes = $html.find(".priceValue");
            var priceNode = priceNodes.first();
            var priceNodeText = priceNode.html().trim();
            var mainPrice = parseInt(getNumberFromString(priceNodeText.split("<span")[0]));
            var subPrice = parseInt(priceNode.find("sup").text().trim());
            var fullPrice = mainPrice + (subPrice / 100);
            resolve(fullPrice);
        });
    });
}

TechnopolisAnalyzer.prototype.getName = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var productNameHeader = $html.find("section.product h1");
            if (!productNameHeader) {
                reject("Product name header not found");
            }
            var productName = unescape(productNameHeader.text());
            resolve(productName);
        });
    });
}

TechnopolisAnalyzer.prototype.getImageUrl = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl()
            .then(html => {
                var $html = $(html);
                debugger;
                var image = $html.find("div.product-preview img");
                if (!image) {
                    reject(null);
                }
                var imgSource = "http://www." + Websites.Technopolis + image.attr('src');
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
    exports.EbayAnalyzer = EbayAnalyzer;
    exports.TechnopolisAnalyzer = TechnopolisAnalyzer;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);