// server.js
// load the things we need
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/priceCheckDb');

var priceObjects = [];

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

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
    var objectOldPrice = 150;
    var objectNewPrice = 100;
    console.log('objectName = ' + objectName);
    console.log('objectUrl = ' + objectUrl);
    console.log('objectDescription = ' + objectDescription);
    console.log('objectOldPrice = ' + objectOldPrice);
    console.log('objectNewPrice = ' + objectNewPrice);

    // Set our collection
    var collection = db.get('priceCheckObjectsCollection');

    // Submit to the DB
    collection.insert({
        "name": objectName,
        "objectUrl": objectUrl,
        "oldPrice": objectOldPrice,
        "newPrice": objectNewPrice,
        "description": objectDescription,
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