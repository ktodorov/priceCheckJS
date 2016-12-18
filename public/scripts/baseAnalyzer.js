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
        // $.get(this.url, null, function(data) {
        //     debugger;
        //     resolve(data.responseText);
        // });

        // reject(null);
        if (this.htmlFromUrl) {
            resolve(this.htmlFromUrl);
        } else {
            $.ajax({
                url: this.url,
                crossDomain: true,
                success: function(data) {
                    this.htmlFromUrl = data;
                    resolve(data);
                },
                error: function(data) {
                    reject(data);
                }
            });
        }
    });
}

$.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
        options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
});