var websites = require("./websites.js");
var currencies = require("./currencies.js");
var websiteAnalyzers = require("./websiteAnalyzers.js");

function getWebsiteFromUrl(urlString, includeFamilyWebsites) {
    var hostnames = urlString.match(/^http:\/\/[^/]+/);
    if (!hostnames || hostnames.length == 0) {
        hostnames = urlString.match(/^https:\/\/[^/]+/);
        if (!hostnames || hostnames.length == 0) {
            return "";
        }
    }
    var hostname = hostnames[0];
    if (!hostname) {
        return "";
    }

    for (var websiteKey in websites.Websites) {
        var website = websites.Websites[websiteKey];

        if (includeFamilyWebsites == false) {
            // Family websites like "ebay" or "amazon" should not be included
            // Only "ebay.com" or "ebay.co.uk" should be
            if (website.indexOf(".") == -1) {
                continue;
            }
        }

        if (hostname.indexOf(website) != -1) {
            return website;
        }
    }

    return "";
}

function getNumberFromString(sentence) {
    var sentenceWithoutSpaces = sentence.replace(/\s/g, '');
    var matches = sentenceWithoutSpaces.replace(/,/g, '').match(/(\+|-)?((\d+(\.\d+)?)|(\.\d+))/);
    return matches && matches[0] || null;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

function parseDocRecursively(cache, res) {
    var currentDocNumber = cache.get("docsParsed");
    var docs = cache.get("docs");

    var analyzer = websiteAnalyzers.getAnalyzerFromUrl(docs[currentDocNumber].objectUrl);
    analyzer.getHtmlFromUrl(function() {
        var currentDoc = cache.get("docs")[currentDocNumber];
        var website = getWebsiteFromUrl(currentDoc.objectUrl, false);
        var currency = currencies.getCurrencySymbol(currentDoc.currency);

        currentDoc.website = website;
        currentDoc.currency = currency;

        var price = analyzer.getPrice();
        if (price && price != currentDoc.newPrice) {
            currentDoc.newPrice = price;
        }

        var imageUrl = analyzer.getImageUrl()
        currentDoc.imageUrl = imageUrl;

        var docs = cache.get("docs");
        docs[currentDocNumber] = currentDoc;
        cache.put("docs", docs);

        var docsParsed = cache.get("docsParsed");
        docsParsed += 1;
        cache.put("docsParsed", docsParsed);
        var docsLength = cache.get("docsLength");

        if (docsParsed >= docsLength) {
            res.render('pages/objects/index', {
                "objectslist": cache.get("docs")
            });
        } else {
            parseDocRecursively(cache, res);
        }

    }.bind(this))
}

exports.getWebsiteFromUrl = getWebsiteFromUrl;
exports.getNumberFromString = getNumberFromString;
exports.guid = guid;
exports.parseDocRecursively = parseDocRecursively;