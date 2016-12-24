function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

if (is_server()) {
    var websitesLibrary = require("./websites.js");
    var Websites = websitesLibrary.Websites;
}

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

    for (var websiteKey in Websites) {
        var website = Websites[websiteKey];

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

(function(exports) {
    exports.getWebsiteFromUrl = getWebsiteFromUrl;
    exports.getNumberFromString = getNumberFromString;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);