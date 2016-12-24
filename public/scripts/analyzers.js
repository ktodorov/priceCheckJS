function is_server() {
    return (typeof process === 'object' && process + '' === '[object process]');
}

if (is_server()) {
    var websiteAnalyzers = require("./websiteAnalyzers.js");
    var BaseAnalyzer = websiteAnalyzers.BaseAnalyzer;
    var EmagAnalyzer = websiteAnalyzers.EmagAnalyzer;
    var EbayAnalyzer = websiteAnalyzers.EbayAnalyzer;
    var TechnopolisAnalyzer = websiteAnalyzers.TechnopolisAnalyzer;

    var currenciesLibrary = require("./currencies.js");
    var Currencies = currenciesLibrary.Currencies;
    var CurrencySymbols = currenciesLibrary.CurrencySymbols;
    var getCurrencySymbol = currenciesLibrary.getCurrencySymbol;

    var coreLibrary = require("./core.js");
    var getWebsiteFromUrl = coreLibrary.getWebsiteFromUrl;

    var websitesLibrary = require("./websites.js");
    var Websites = websitesLibrary.Websites;
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

    if (website == Websites.Emag) {
        analyzer = new EmagAnalyzer(urlString);
    } else if (website == Websites.Ebay) {
        analyzer = new EbayAnalyzer(urlString);
    } else if (website == Websites.Technopolis) {
        analyzer = new TechnopolisAnalyzer(urlString);
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

(function(exports) {
    exports.getAnalyzerFromUrl = getAnalyzerFromUrl;
    exports.getImageFromUrl = getImageFromUrl;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);