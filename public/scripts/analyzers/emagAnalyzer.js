var BaseAnalyzer = require("./baseAnalyzer.js");
var core = require("../core.js");
var currencies = require("../currencies.js");

// Emag.bg analyzer class

function EmagAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

EmagAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EmagAnalyzer.prototype.getPrice = function() {
    this.currency = currencies.Currencies.BGN;

    var html = this.htmlFromUrl;
    var $html = $(html);
    var priceNodes = $html.find(".product-new-price");
    var priceNode = priceNodes.html().trim();
    var splitPriceNode = priceNode.split("<sup>");
    var mainPriceNode = splitPriceNode[0].replace(".", "");
    var mainPrice = parseInt(mainPriceNode);
    var subPrice = parseInt(splitPriceNode[1].split("</sup>")[0]);
    var fullPrice = mainPrice + (subPrice / 100);
    return fullPrice;
}

EmagAnalyzer.prototype.getName = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var nameNodes = $html.find(".page-title");
    var name = nameNodes.html().trim();
    return name;
}

EmagAnalyzer.prototype.getImageUrl = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var image = $html.find("li[data-ph-id='image-0'] img");
    if (!image) {
        throw ("Image object not found");
    }
    var imgSource = image.attr('src');
    return imgSource;
};

module.exports = EmagAnalyzer;