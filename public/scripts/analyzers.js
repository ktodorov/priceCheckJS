function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

if (is_server()) {
    var websiteAnalyzers = require("./websiteAnalyzers.js");
    var BaseAnalyzer = websiteAnalyzers.BaseAnalyzer;
    var EmagAnalyzer = websiteAnalyzers.EmagAnalyzer;
    var EbayCoUkAnalyzer = websiteAnalyzers.EbayCoUkAnalyzer;

    var currenciesLibrary = require("./currencies.js");
    var Currencies = currenciesLibrary.Currencies;
    var CurrencySymbols = currenciesLibrary.CurrencySymbols;
    var getCurrencySymbol = currenciesLibrary.getCurrencySymbol;
}

function analyzeObject() {
    debugger;
    var url = $("#objectUrl").val();
    var website = getWebsiteFromUrl(url);


    if (!website || !url) {
        return;
    }

    $("#loading-div").removeClass('invisible');

    var analyzer = getAnalyzerFromUrl(url);

    try {

        analyzer.getHtmlFromUrl().then(function(html) {
                analyzer.htmlFromUrl = html;
                analyzer.getPrice().then(function(price) {
                    $("#objectPrice").val(price);
                    var objectCurrency = analyzer.currency;
                    var objectCurrencySymbol = getCurrencySymbol(objectCurrency);
                    $("#objectCurrency").val(objectCurrency);
                    $("#objectCurrencySymbol").val(objectCurrencySymbol);

                    analyzer.getName().then(function(name) {
                        $("#objectName").val(name);

                        analyzer.getImageUrl().then(function(imageUrl) {
                            $("#objectImage").attr('src', imageUrl);
                            $("#imageUrl").val(imageUrl);

                        });
                    });
                });
            })
            .then(() => {
                $("#objectImage").removeClass("invisible");
                $("#additionalFields").removeClass('invisible');
                $("#loading-div").addClass('invisible');
            })
    } catch (err) {
        console.log("error occured: ", err);
        return;
    }

}

function getAnalyzerFromUrl(urlString) {
    var website = getWebsiteFromUrl(urlString);
    var analyzer = null;

    if (website == "emag") {
        analyzer = new EmagAnalyzer(urlString);
    } else if (website == "ebay.co.uk") {
        analyzer = new EbayCoUkAnalyzer(urlString);
    }

    return analyzer;
}

function getImageFromUrl(urlString) {
    return new Promise((resolve, reject) => {
        var analyzer = getAnalyzerFromUrl(urlString);

        $.when(analyzer.getImageUrl())
            .then((imageUrl) => {
                resolve(imageUrl);
            })
            .catch(err => {
                console.log("error occured: ", err);
            });
    })
}

function getWebsiteFromUrl(urlString) {
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

    if (hostname.indexOf("emag.bg") != -1) {
        return "emag";
    } else if (hostname.indexOf("amazon.com") != -1) {
        return "amazon.com";
    } else if (hostname.indexOf("amazon.co.uk") != -1) {
        return "amazon.co.uk";
    } else if (hostname.indexOf("technomarket") != -1) {
        return "technomarket";
    } else if (hostname.indexOf("technopolis") != -1) {
        return "technopolis";
    } else if (hostname.indexOf("ebay.co.uk") != -1) {
        return "ebay.co.uk";
    }

    return "";
}

(function(exports) {
    exports.getAnalyzerFromUrl = getAnalyzerFromUrl;
    exports.getWebsiteFromUrl = getWebsiteFromUrl;
    exports.getImageFromUrl = getImageFromUrl;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);