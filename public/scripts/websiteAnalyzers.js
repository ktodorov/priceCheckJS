var core = require("./core.js");
var websites = require("./websites.js");
var BaseAnalyzer = require("./analyzers/baseAnalyzer.js");
var EmagAnalyzer = require("./analyzers/emagAnalyzer.js");
var EbayAnalyzer = require("./analyzers/ebayAnalyzer.js");
var TechnopolisAnalyzer = require("./analyzers/technopolisAnalyzer.js");

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

exports.getAnalyzerFromUrl = getAnalyzerFromUrl;