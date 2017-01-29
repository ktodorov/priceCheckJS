// server.js
// load the things we need
var express = require('express');

var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');

// var bodyParser = require('body-parser');
// var cookieSession = require('cookie-session');

require('babel-core/register');

var jsdom = require("jsdom").jsdom;
var doc = jsdom();
window = doc.defaultView;

// Load jQuery with the simulated jsdom window.
$ = jQuery = require('jquery');

require("./database/connection.js");
var Product = require("./database/collections/productsCollection.js");
var User = require("./database/collections/usersCollection.js");

var core = require("./public/scripts/core.js");
var currencies = require("./public/scripts/currencies.js");

var authenticationHelper = require("./public/scripts/helpers/authenticationHelper.js");

var cache = require("memory-cache");

require("./public/scripts/appExtensions/requirements.js")(app, express, __dirname);

// get login page 
app.get('/login', function(req, res) {
    if (authenticationHelper.isUserLoggedIn(req)) {
        res.redirect("/products");
    } else {
        res.render('pages/login');
    }
});

// post login 
app.post('/login', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    User.findOne({ 'username': req.body.username }, function(err, user) {
        if (user) {
            if (authenticationHelper.logUser(req, res, user)) {
                res.redirect("/products");
            } else {
                res.send("Invalid password!");
                return;
            }
        } else {
            res.send("No such user found!");
            return;
        }
    });
});

// get register page 
app.get('/register', function(req, res) {
    res.render('pages/register');
});


// post register 
app.post('/register', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    if (password != confirmPassword) {
        res.send("Password and confirm password are not equal!");
        return;
    }

    var hashedPasword = authenticationHelper.hashPassword(password);
    // Submit to the DB
    new User({
        "username": req.body.username,
        "password": hashedPasword,
        "email": req.body.email,
        "firstName": req.body.firstName,
        "lastName": req.body.lastName
    }).save(function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem registering the user.");
        } else {
            // And forward to success page
            res.redirect("/login");
        }
    });
});

app.get('/logout', authenticationHelper.requireAuthentication, function(req, res) {
    req.session = null;
    res.redirect("/login");
});


// index page 
app.get('/', authenticationHelper.requireAuthentication, function(req, res) {
    res.render('pages/index');
});

// about page 
app.get('/about', authenticationHelper.requireAuthentication, function(req, res) {
    res.render('pages/about');
});

// objects index page 
app.get('/products', authenticationHelper.requireAuthentication, function(req, res) {
    var skip = parseInt(req.query.skip);
    if (!skip) {
        skip = 0;
    }
    var take = parseInt(req.query.take);
    if (!take) {
        take = 10;
    }

    var searchText = req.query.search;
    var queryOptions = { skip: skip, limit: take };
    var searchOptions = core.constructSearchOptions(searchText, req.session.accessToken);
    Product.count(searchOptions, function(error, productsCount) {
        Product.find(searchOptions).skip(skip).limit(take).exec(function(err, products) {
            try {
                if (!products || products.length == 0) {
                    res.render('pages/products/index', {
                        "objectslist": [],
                        "objectsCount": 0,
                        "skip": skip,
                        "take": take,
                        "search": searchText
                    });
                    return;
                }

                cache.put("productsLength", products.length);
                cache.put("productsParsed", 0);
                cache.put("products", products);
                core.parseDocRecursively(cache, function(product) {
                        var upsertData = product.toObject();
                        delete upsertData._id;
                        upsertData.lastChecked = new Date();
                        Product.findOneAndUpdate({ _id: product._id }, upsertData, { upsert: true }, function(error, result) {
                            product = result;
                        });
                    },
                    function(parsedProducts) {
                        res.render('pages/products/index', {
                            "objectslist": parsedProducts,
                            "objectsCount": productsCount,
                            "skip": skip,
                            "take": take,
                            "search": searchText
                        });
                    });
            } catch (e) {
                console.log("error occured: ", e);
            }
        });
    });
});

// objects create page 
app.get('/products/edit/:id', authenticationHelper.requireAuthentication, function(req, res) {
    var productId = req.params.id;
    Product.findOne({ '_id': productId }, function(err, doc) {
        if (doc) {
            var currencySymbol = currencies.getCurrencySymbol(doc.currency);
            doc.currencySymbol = currencySymbol;
        } else {
            doc = {};
        }
        res.render('pages/products/edit', {
            "doc": doc
        });
    });
});

app.post('/products/edit/:id', authenticationHelper.requireAuthentication, function(req, res) {
    var productId = req.params.id;

    var updatedProduct = {
        "name": req.body.objectName,
        "description": req.body.objectDescription,
    }

    Product.findByIdAndUpdate(productId, updatedProduct, function(err, doc) {
        res.redirect("/products");
    });
});

// objects create page 
app.get('/products/create', authenticationHelper.requireAuthentication, function(req, res) {
    res.render('pages/products/create');
});

// objects create page 
app.post('/products/create', authenticationHelper.requireAuthentication, function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var currentUserId = authenticationHelper.getLoggedUserId(req.session.accessToken);
    // Submit to the DB
    new Product({
        "name": req.body.objectName,
        "objectUrl": req.body.objectUrl,
        "oldPrice": req.body.objectPrice,
        "newPrice": req.body.objectPrice,
        "description": req.body.objectDescription,
        "imageUrl": req.body.imageUrl,
        "website": req.body.website,
        "currency": req.body.objectCurrency,
        "dateCreated": new Date(),
        "user": currentUserId,
        "lastChecked": new Date()
    }).save(function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        } else {
            // And forward to success page
            res.redirect("/products");
        }
    });

});

app.get("/products/delete/:id", authenticationHelper.requireAuthentication, function(req, res) {
    var productId = req.params.id;
    Product.findByIdAndRemove({ '_id': productId }, function(err, doc) {
        res.redirect("/products");
    });
});

require("./public/scripts/appExtensions/methods.js")(app, authenticationHelper.requireAuthentication);

app.listen(8080);
console.log('Application started on 8080 port');