// server.js
// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/priceCheckDb');
// To start MongoDB:
// mongod --dbpath e:\OneDrive\University\Year4\JavascriptAdvanced\priceCheckJS\data\ 

require('babel-core/register');

var jsdom = require("jsdom").jsdom;
var doc = jsdom();
window = doc.defaultView;

// Load jQuery with the simulated jsdom window.
$ = jQuery = require('jquery');

var analyzers = require("./public/scripts/analyzers.js");
var currencies = require("./public/scripts/currencies.js");

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));

// Make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});

//Note that in version 4 of express, express.bodyParser() was
//deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true }));

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
    res.render('pages/index');
});

// about page 
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// objects index page 
app.get('/objects', function(req, res) {
    var db = req.db;
    var collection = db.get('priceCheckObjectsCollection');
    collection.find({}, {}, function(e, docs) {
        for (var i = 0; i < docs.length; i++) {
            var analyzer = analyzers.getAnalyzerFromUrl(docs[i].objectUrl);
            var website = analyzers.getWebsiteFromUrl(docs[i].objectUrl);
            var currency = currencies.getCurrencySymbol(docs[i].currency);

            docs[i].website = website;
            docs[i].currency = currency;

            try {
                $.when(analyzer.getImageUrl())
                    .then(function(imageUrl) {
                        docs[i].imageUrl = imageUrl;
                    })
                    .catch(err => {
                        console.log("error occured: ", err);
                    })
                    .bind(this);
            } catch (e) {

            }
        }

        res.render('pages/objects/index', {
            "objectslist": docs
        });
    });
});



// objects create page 
app.get('/objects/create', function(req, res) {
    res.render('pages/objects/create');
});

// objects create page 
app.post('/objects/create', function(req, res) {
    // Set our internal DB variable
    var db = req.db;

    console.log('posting...');

    // Get our form values. These rely on the "name" attributes
    var objectName = req.body.objectName;
    var objectUrl = req.body.objectUrl;
    var objectDescription = req.body.objectDescription;
    var objectOldPrice = req.body.objectPrice;
    var objectNewPrice = req.body.objectPrice;
    var objectImageUrl = req.body.imageUrl;
    var objectWebsite = req.body.website;
    var objectCurrency = req.body.objectCurrency;
    // console.log('objectName = ' + objectName);
    // console.log('objectUrl = ' + objectUrl);
    // console.log('objectDescription = ' + objectDescription);
    // console.log('objectOldPrice = ' + objectOldPrice);
    // console.log('objectNewPrice = ' + objectNewPrice);
    // console.log('objectImageUrl = ' + objectImageUrl);
    // console.log('objectWebsite = ' + objectWebsite);

    // Set our collection
    var collection = db.get('priceCheckObjectsCollection');

    // Submit to the DB
    collection.insert({
        "name": objectName,
        "objectUrl": objectUrl,
        "oldPrice": objectOldPrice,
        "newPrice": objectNewPrice,
        "description": objectDescription,
        "imageUrl": objectImageUrl,
        "website": objectWebsite,
        "currency": objectCurrency
    }, function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        } else {
            // And forward to success page
            res.redirect("/objects");
        }
    });

});

app.listen(8080);
console.log('Application started on 8080 port');