// $.ajaxPrefilter(function(options) {
//     if (options.crossDomain && jQuery.support.cors) {
//         var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
//         options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
//     }
// });

function BaseAnalyzer(url) {
    this.url = url;
    this.htmlFromUrl = null;
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

BaseAnalyzer.prototype.getHtmlFromUrl = function() {
    return new Promise((resolve, reject) => {
        if (this.htmlFromUrl) {
            resolve(this.htmlFromUrl);
        } else {
            $.ajax({
                url: this.url,
                crossDomain: true,
                type: "GET",
                success: function(data) {
                    this.htmlFromUrl = data.responseText;
                    resolve(data.responseText);
                },
                error: function(data) {
                    reject(data);
                }
            });
        }
    });
}

function EmagAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

EmagAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);

EmagAnalyzer.prototype.getPrice = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var $html = $(html);
            var priceNodes = $html.find(".product-new-price");
            var priceNode = priceNodes.html().trim();
            var splitPriceNode = priceNode.split("<sup>");
            var mainPriceNode = splitPriceNode[0].replace(".", "");
            var mainPrice = parseInt(mainPriceNode);
            var subPrice = parseInt(splitPriceNode[1].split("</sup>")[0]);
            var fullPrice = mainPrice + (subPrice / 100);
            resolve(fullPrice);
        });
    });
}

EmagAnalyzer.prototype.getName = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var div = document.createElement("div");
            div.innerHTML = html;
            var nameNodes = div.getElementsByClassName("page-title");
            var name = nameNodes[0].innerHTML.trim();
            resolve(name);
        });
    });
}

EmagAnalyzer.prototype.getImageUrl = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl()
            .then(html => {
                var $html = $(html);
                var image = $html.find("li[data-ph-id='image-0'] img");
                if (!image) {
                    reject(null);
                }
                var imgSource = image.attr('src');
                resolve(imgSource);
            })
            .catch(err => {
                console.log("error occured: ", err);
            });
    });
};

(function(exports) {
    exports.BaseAnalyzer = BaseAnalyzer;
    exports.EmagAnalyzer = EmagAnalyzer;
})(typeof exports === 'undefined' ? this['mymodule'] = {} : exports);