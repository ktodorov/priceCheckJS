var websitesLibrary = require("./websites.js");
var Websites = websitesLibrary.Websites;

Currencies = {
    BGN: 0,
    USD: 1,
    GBP: 2
};

CurrencySymbols = {
    BGN: "лв.",
    USD: "$",
    GBP: "£"
};

function getCurrencySymbol(currency) {
    if (currency == Currencies.BGN) {
        return CurrencySymbols.BGN;
    } else if (currency == Currencies.USD) {
        return CurrencySymbols.USD;
    } else if (currency == Currencies.GBP) {
        return CurrencySymbols.GBP;
    }

    return "";
}

function getCurrencyFromWebsite(website) {
    switch (website) {
        case Websites.EbayCoUk:
            return Currencies.GBP;
        case Websites.EbayCom:
            return Currencies.USD;
        case Websites.AmazonCoUk:
            return Currencies.GBP;
        case Websites.AmazonCom:
            return Currencies.USD;
    }

    return Currencies.BGN;
}

exports.Currencies = Currencies;
exports.CurrencySymbols = CurrencySymbols;
exports.getCurrencySymbol = getCurrencySymbol;
exports.getCurrencyFromWebsite = getCurrencyFromWebsite;