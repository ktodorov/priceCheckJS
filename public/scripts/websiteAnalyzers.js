var currencies = require("./currencies.js");
var core = require("./core.js");
var websites = require("./websites.js");
var http = require("http");

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function getAnalyzerFromUrl(urlString) {
    var website = core.getWebsiteFromUrl(urlString);
    var analyzer = null;

    if (website == websites.Websites.Emag) {
        analyzer = new EmagAnalyzer(urlString);
    } else if (website == websites.Websites.Ebay) {
        analyzer = new EbayAnalyzer(urlString);
    } else if (website == websites.Websites.Technopolis) {
        analyzer = new TechnopolisAnalyzer(urlString);
    }

    return analyzer;
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

exports.BaseAnalyzer = BaseAnalyzer;
exports.EmagAnalyzer = EmagAnalyzer;
exports.EbayAnalyzer = EbayAnalyzer;
exports.TechnopolisAnalyzer = TechnopolisAnalyzer;
exports.getAnalyzerFromUrl = getAnalyzerFromUrl;