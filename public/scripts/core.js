var websites = require("./websites.js");
var currencies = require("./currencies.js");
var websiteAnalyzers = require("./websiteAnalyzers.js");
var authenticationHelper = require("./helpers/authenticationHelper.js");
var Product = require("../../database/collections/productsCollection.js");

function getWebsiteFromUrl(urlString, includeFamilyWebsites) {
    if (!urlString) {
        return;
    }

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

function refreshProduct(product, callbackFunction) {
    var currentProduct = product;
    var analyzer = websiteAnalyzers.getAnalyzerFromUrl(currentProduct.objectUrl);
    if (!analyzer) {
        callbackFunction(null);
        return;
    }
    analyzer.getHtmlFromUrl(function() {
        try {
            var price = analyzer.getPrice();
            if (price && price != currentProduct.newPrice) {
                currentProduct.newPrice = price;
            }

            var imageUrl = analyzer.getImageUrl()
            currentProduct.imageUrl = imageUrl;

            // Save updated product in database
            var upsertData = currentProduct.toObject();
            delete upsertData._id;
            upsertData.lastChecked = new Date();
            Product.findOneAndUpdate({ _id: currentProduct._id }, upsertData, { new: true }, function(error, result) {
                callbackFunction(result);
            });
        } catch (err) {
            console.log("error occured: ", err);
        }
    }.bind(this));
}

function populateTemporaryFields(product) {
    var website = getWebsiteFromUrl(product.objectUrl, false);
    var currencySymbol = currencies.getCurrencySymbol(product.currency);
    product.website = website;
    product.currencySymbol = currencySymbol;
}

function parseDocRecursively(cache, callbackFunction) {
    var currentProductNumber = cache.get("productsParsed");
    var currentDate = new Date();
    var currentProduct = cache.get("products")[currentProductNumber];
    var currentProductLastCheckedDate = currentProduct.lastChecked;

    if (!currentProductLastCheckedDate || (currentDate - currentProductLastCheckedDate > 3600000)) { // 3,600,000 milliseconds = 60 minutes
        refreshProduct(currentProduct, function(updatedProduct) {
            if (!updatedProduct) {
                callbackFunction(cache.get("products"));
            }

            populateTemporaryFields(updatedProduct);
            var products = cache.get("products");
            products[currentProductNumber] = updatedProduct;
            cache.put("products", products);

            var productsParsed = cache.get("productsParsed");
            productsParsed += 1;
            cache.put("productsParsed", productsParsed);
            var productsLength = cache.get("productsLength");

            if (productsParsed >= productsLength) {
                callbackFunction(cache.get("products"));
            } else {
                parseDocRecursively(cache, callbackFunction);
            }
        });
    } else {
        populateTemporaryFields(currentProduct);
        var products = cache.get("products");
        products[currentProductNumber] = currentProduct;
        cache.put("products", products);

        var productsParsed = cache.get("productsParsed");
        productsParsed += 1;
        cache.put("productsParsed", productsParsed);
        var productsLength = cache.get("productsLength");

        if (productsParsed >= productsLength) {
            callbackFunction(cache.get("products"));
        } else {
            parseDocRecursively(cache, callbackFunction);
        }
    }
}

function analyzeObject(url, callbackFunction) {
    var website = getWebsiteFromUrl(url);

    if (!website || !url) {
        return;
    }

    var analyzer = websiteAnalyzers.getAnalyzerFromUrl(url);

    analyzer.getHtmlFromUrl(function() {
        var price = analyzer.getPrice();
        var imageUrl = analyzer.getImageUrl();
        var name = analyzer.getName();
        var currencySymbol = analyzer.getCurrencySymbol();

        var result = {
            "name": name,
            "price": price,
            "imageUrl": imageUrl,
            "currency": analyzer.currency,
            "currencySymbol": currencySymbol
        }

        callbackFunction(result);
    });
}

function constructSearchOptions(searchText, accessToken) {
    var searchOptions = {};
    var currentUserId = authenticationHelper.getLoggedUserId(accessToken);

    if (!searchText) {
        searchOptions = {
            user: currentUserId
        };
    } else {
        searchOptions = {
            $text: {
                $search: searchText
            },
            user: currentUserId
        }
    }

    return searchOptions;
}

exports.getWebsiteFromUrl = getWebsiteFromUrl;
exports.getNumberFromString = getNumberFromString;
exports.guid = guid;
exports.parseDocRecursively = parseDocRecursively;
exports.analyzeObject = analyzeObject;
exports.constructSearchOptions = constructSearchOptions;
exports.refreshProduct = refreshProduct;