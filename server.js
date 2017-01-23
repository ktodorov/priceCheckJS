// server.js
// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

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

var cache = require("memory-cache");

var bcrypt = require('bcrypt');
const saltRounds = 10;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));

//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true }));

function mid(req, res, next) {
    var token = req.headers['x-access-token']
    if (token) {
        jwt.verify(token).then(decoded => {
            next();
        });
        return;
    }

    res.redirect(401, '/login');
}

// index page 
app.get('/', mid, function(req, res) {
    res.render('pages/index');
});

// about page 
app.get('/about', mid, function(req, res) {
    res.render('pages/about');
});

// objects index page 
app.get('/products', mid, function(req, res) {
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
    var searchOptions = {};

    if (!searchText) {
        searchOptions = {};
    } else {
        searchOptions = {
            $text: {
                $search: searchText
            }
        }
    }

    Product.count(searchOptions, function(error, docsCount) {
        Product.find(searchOptions).skip(skip).limit(take).exec(function(err, docs) {
            try {
                if (!docs || docs.length == 0) {
                    res.render('pages/products/index', {
                        "objectslist": docs,
                        "objectsCount": docsCount,
                        "skip": skip,
                        "take": take,
                        "search": searchText
                    });
                    return;
                }
                cache.put("docsLength", docs.length);
                cache.put("docsParsed", 0);
                cache.put("docs", docs);
                core.parseDocRecursively(cache, function(parsedDocs) {
                    res.render('pages/products/index', {
                        "objectslist": parsedDocs,
                        "objectsCount": docsCount,
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
app.get('/products/edit/:id', mid, function(req, res) {
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

app.post('/products/edit/:id', function(req, res) {
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
app.get('/products/create', mid, function(req, res) {
    res.render('pages/products/create');
});

// objects create page 
app.post('/products/create', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var objectName = req.body.objectName;
    var objectUrl = req.body.objectUrl;
    var objectDescription = req.body.objectDescription;
    var objectOldPrice = req.body.objectPrice;
    var objectNewPrice = req.body.objectPrice;
    var objectImageUrl = req.body.imageUrl;
    var objectWebsite = req.body.website;
    var objectCurrency = req.body.objectCurrency;

    // Submit to the DB
    new Product({
        "name": objectName,
        "objectUrl": objectUrl,
        "oldPrice": objectOldPrice,
        "newPrice": objectNewPrice,
        "description": objectDescription,
        "imageUrl": objectImageUrl,
        "website": objectWebsite,
        "currency": objectCurrency
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

app.get("/products/delete/:id", mid, function(req, res) {
    var productId = req.params.id;
    Product.findByIdAndRemove({ '_id': productId }, function(err, doc) {
        res.redirect("/products");
    });
});

app.get("/analyzeObject", mid, function(req, res) {
    var url = req.query.url;
    core.analyzeObject(url, function(result) {
        res.send(result);
    })
});

// get login page 
app.get('/login', function(req, res) {
    console.log(res.statusCode);
    res.render('pages/login');
});


// post login 
app.post('/login', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ 'username': username }, function(err, user) {
        if (user) {
            console.log("found user!");
            // user.currencySymbol = currencySymbol;
        } else {
            console.log("not found user!");
            // user = {};
        }
        // res.render('pages/products/edit', {
        //     "user": user
        // });
    });
    // // Submit to the DB
    // new Product({
    //     "name": objectName,
    //     "objectUrl": objectUrl,
    //     "oldPrice": objectOldPrice,
    //     "newPrice": objectNewPrice,
    //     "description": objectDescription,
    //     "imageUrl": objectImageUrl,
    //     "website": objectWebsite,
    //     "currency": objectCurrency
    // }).save(function(err, doc) {
    //     if (err) {
    //         // If it failed, return error
    //         res.send("There was a problem adding the information to the database.");
    //     } else {
    //         // And forward to success page
    //         res.redirect("/products");
    //     }
    // });
});

// get register page 
app.get('/register', function(req, res) {
    res.render('pages/register');
});


// post register 
app.post('/register', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    // Submit to the DB
    new User({
        "username": username,
        "password": password,
        "email": email,
        "firstName": firstName,
        "lastName": lastName
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

app.listen(8080);
console.log('Application started on 8080 port');