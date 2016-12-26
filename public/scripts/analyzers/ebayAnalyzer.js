var BaseAnalyzer = require("./baseAnalyzer.js");
var core = require("../core.js");
var currencies = require("../currencies.js");

// Ebay analyzer class

function EbayAnalyzer(url) {
    BaseAnalyzer.call(this, url);
    this.website = core.getWebsiteFromUrl(url, false);
}

EbayAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EbayAnalyzer.prototype.getPrice = function() {
    this.currency = currencies.getCurrencyFromWebsite(this.website);

    var html = this.htmlFromUrl;
    var $html = $(html);
    var priceNodes = $html.find("#prcIsum");
    var priceNode = priceNodes.attr("content").trim();
    var fullPrice = core.getNumberFromString(priceNode);
    return fullPrice;
}

EbayAnalyzer.prototype.getName = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var productNameSpan = $html.find("#itemTitle");
    if (!productNameSpan) {
        throw ("Product name span not found");
    }
    var productName = unescape(productNameSpan.html().split("</span>")[1]);
    return productName;
}

EbayAnalyzer.prototype.getImageUrl = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var image = $html.find("#icImg");
    if (!image) {
        throw ("Image object not found");
    }
    var imgSource = image.attr('src');
    return imgSource;
};

module.exports = EbayAnalyzer;