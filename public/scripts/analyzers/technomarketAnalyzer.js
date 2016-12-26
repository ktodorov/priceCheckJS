var BaseAnalyzer = require("./baseAnalyzer.js");
var core = require("../core.js");
var currencies = require("../currencies.js");
var websites = require("../websites.js");

// Technopolis analyzer class

function TechnomarketAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

TechnomarketAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

TechnomarketAnalyzer.prototype.getPrice = function() {
    this.currency = currencies.Currencies.BGN;

    var html = this.htmlFromUrl;
    var $html = $(html);
    var priceNodes = $html.find("span[itemprop='price'].new");
    var priceNode = priceNodes.first();
    var priceNodeText = priceNode.html().trim();
    var mainPrice = parseInt(core.getNumberFromString(priceNodeText.split("<sup")[0]));
    var subPrice = parseInt(priceNode.find("sup").text().trim());
    var fullPrice = mainPrice + (subPrice / 100);
    return fullPrice;
}

TechnomarketAnalyzer.prototype.getName = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var productNameHeader = $html.find("div.product-heading span[itemprop='name']");
    if (!productNameHeader) {
        throw ("Product name header not found");
    }
    var productName = unescape(productNameHeader.text());
    return productName;
}

TechnomarketAnalyzer.prototype.getImageUrl = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    debugger;
    var image = $html.find("a.product-image img[itemprop='image']");
    if (!image) {
        throw ("Image object not found");
    }
    var imgSource = image.attr('src');
    return imgSource;
};

module.exports = TechnomarketAnalyzer;