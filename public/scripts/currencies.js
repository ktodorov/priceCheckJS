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

(function(exports) {
    exports.Currencies = Currencies;
    exports.CurrencySymbols = CurrencySymbols;
    exports.getCurrencySymbol = getCurrencySymbol;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);