function EmagAnalyzer(url) {
    BaseAnalyzer.call(this, url);
}

EmagAnalyzer.prototype = Object.create(BaseAnalyzer.prototype);


EmagAnalyzer.prototype.getPrice = function() {
    return new Promise((resolve, reject) => {
        this.getHtmlFromUrl().then(function(html) {
            var div = document.createElement("div");
            div.innerHTML = html;
            var priceNodes = div.getElementsByClassName("product-new-price");
            var priceNode = priceNodes[0].innerHTML.trim();
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
        this.getHtmlFromUrl().then(function(html) {
            var div = document.createElement("div");
            div.innerHTML = html;
            var image = div.querySelector("li[data-ph-id='image-0'] img");
            if (!image) {
                reject(null);
            }
            var imgSource = image.getAttribute('src');
            resolve(imgSource);
        });
    });
};