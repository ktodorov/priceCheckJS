// server.js
// load the things we need
var express = require('express');
var app = express();

var priceObjects = [];

app.use(express.static(__dirname + '/public'));

// set the view engine to ejs
app.set('view engine', 'ejs');

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
    res.render('pages/objects/index', {
        priceObjects: priceObjects
    });
});

// objects create page 
app.get('/objects/create', function(req, res) {
    res.render('pages/objects/create');
});

app.listen(8080);
console.log('Application started on 8080 port');