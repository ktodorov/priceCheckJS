var core = require("../core.js");
var Product = require("../../../database/collections/productsCollection.js");

module.exports = function(app, midFunc) {
    app.get("/analyzeObject", midFunc, function(req, res) {
        var url = req.query.url;
        core.analyzeObject(url, function(result) {
            res.send(result);
        })
    });

    app.get("/getUsername", midFunc, function(req, res) {
        var username = req.session.currentUsername;
        res.send(username);
    });

    app.get("/refreshProduct", midFunc, function(req, res) {
        var productId = req.query.productId;
        if (!productId) {
            return;
        }

        Product.findOne({ _id: productId }, function(err, dbProduct) {
            if (!dbProduct) {
                return;
            }
            core.refreshProduct(dbProduct, function(updatedProduct) {
                updatedProduct.newPrice = 0;
                res.send(updatedProduct);
            });
        });
    });
}