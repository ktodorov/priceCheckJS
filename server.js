// server.js
// load the things we need
var express = require('express');

var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');

var bodyParser = require('body-parser');
// var session = require('express-session');
// var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

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

var jwt = require("jsonwebtoken");
var tokenSecret = 'secret';


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

function getLoggedUserId(token) {
    console.log("token is ", token);
    if (token) {
        var decoded = jwt.verify(token, tokenSecret);
        console.log("decoded is ", decoded);
        if (decoded._id) {
            return decoded._id
        }
    }
}

// get login page 
app.get('/login', function(req, res) {
    res.render('pages/login');
});

// post login 
app.post('/login', function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({ 'username': username }, function(err, user) {
        if (user) {
            if (bcrypt.compareSync(password, user.password)) {
                var token = jwt.sign({ _id: user._id }, tokenSecret, {
                    expiresIn: '24h'
                });

                req.session.accessToken = token;
                req.session.currentUsername = user.username;
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
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    if (password != confirmPassword) {
        res.send("Password and confirm password are not equal!");
        return;
    }
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    var hashedPasword = bcrypt.hashSync(password, saltRounds);

    // Submit to the DB
    new User({
        "username": username,
        "password": hashedPasword,
        "email": email,
        "firstName": firstName,
        "lastName": lastName
    }).save(function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem registering the user.");
        } else {
            console.log("saved - ", doc)
                // And forward to success page
            res.redirect("/login");
        }
    });
});

app.get('/logout', requireAuthentication, function(req, res) {
    req.session = null;
    res.redirect("/login");
});

function requireAuthentication(req, res, next) {
    if (req.session.accessToken == null) {
        res.redirect('/login');
    } else {
        jwt.verify(req.session.accessToken, tokenSecret, function(err, decoded) {
            if (decoded) {
                next();
            } else {
                res.redirect('/login');
            }
        });
    }
}

// index page 
app.get('/', requireAuthentication, function(req, res) {
    res.render('pages/index');
});

// about page 
app.get('/about', requireAuthentication, function(req, res) {
    res.render('pages/about');
});

// objects index page 
app.get('/products', requireAuthentication, function(req, res) {
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
    var currentUserId = getLoggedUserId(req.session.accessToken);

    if (!searchText) {
        searchOptions = {
            user: currentUserId
        };
    } else {
        searchOptions = {
            $text: {
                $search: searchText
            },
            user: currentUserId
        }
    }

    Product.count(searchOptions, function(error, docsCount) {
        Product.find(searchOptions).skip(skip).limit(take).exec(function(err, docs) {
            try {
                if (!docs || docs.length == 0) {
                    res.render('pages/products/index', {
                        "objectslist": [],
                        "objectsCount": 0,
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
app.get('/products/edit/:id', requireAuthentication, function(req, res) {
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

app.post('/products/edit/:id', requireAuthentication, function(req, res) {
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
app.get('/products/create', requireAuthentication, function(req, res) {
    res.render('pages/products/create');
});

// objects create page 
app.post('/products/create', requireAuthentication, function(req, res) {
    // Get our form values. These rely on the "name" attributes
    var objectName = req.body.objectName;
    var objectUrl = req.body.objectUrl;
    var objectDescription = req.body.objectDescription;
    var objectOldPrice = req.body.objectPrice;
    var objectNewPrice = req.body.objectPrice;
    var objectImageUrl = req.body.imageUrl;
    var objectWebsite = req.body.website;
    var objectCurrency = req.body.objectCurrency;
    var currentUserId = getLoggedUserId(req.session.accessToken);
    console.log("current user id is ", currentUserId);

    // Submit to the DB
    new Product({
        "name": objectName,
        "objectUrl": objectUrl,
        "oldPrice": objectOldPrice,
        "newPrice": objectNewPrice,
        "description": objectDescription,
        "imageUrl": objectImageUrl,
        "website": objectWebsite,
        "currency": objectCurrency,
        "dateCreated": new Date(),
        "user": currentUserId
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

app.get("/products/delete/:id", requireAuthentication, function(req, res) {
    var productId = req.params.id;
    Product.findByIdAndRemove({ '_id': productId }, function(err, doc) {
        res.redirect("/products");
    });
});

app.get("/analyzeObject", requireAuthentication, function(req, res) {
    var url = req.query.url;
    core.analyzeObject(url, function(result) {
        res.send(result);
    })
});

app.listen(8080);
console.log('Application started on 8080 port');