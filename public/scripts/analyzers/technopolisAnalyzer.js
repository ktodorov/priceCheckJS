var BaseAnalyzer = require("./baseAnalyzer.js");
var core = require("../core.js");
var currencies = require("../currencies.js");
var websites = require("../websites.js");

// Technopolis analyzer class

function TechnopolisAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

TechnopolisAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

TechnopolisAnalyzer.prototype.getPrice = function() {
    this.currency = currencies.Currencies.BGN;

    var html = this.htmlFromUrl;
    var $html = $(html);
    var priceNodes = $html.find(".priceValue");
    var priceNode = priceNodes.first();
    var priceNodeText = priceNode.html().trim();
    var mainPrice = parseInt(core.getNumberFromString(priceNodeText.split("<span")[0]));
    var subPrice = parseInt(priceNode.find("sup").text().trim());
    var fullPrice = mainPrice + (subPrice / 100);
    return fullPrice;
}

TechnopolisAnalyzer.prototype.getName = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    var productNameHeader = $html.find("section.product h1");
    if (!productNameHeader) {
        throw ("Product name header not found");
    }
    var productName = unescape(productNameHeader.text());
    return productName;
}

TechnopolisAnalyzer.prototype.getImageUrl = function() {
    var html = this.htmlFromUrl;
    var $html = $(html);
    debugger;
    var image = $html.find("div.product-preview img");
    if (!image) {
        throw ("Image object not found");
    }
    var imgSource = "http://www." + websites.Websites.Technopolis + image.attr('src');
    return imgSource;
};

module.exports = TechnopolisAnalyzer;