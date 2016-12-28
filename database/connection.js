// To start MongoDB:
// mongod --dbpath e:\OneDrive\University\Year4\JavascriptAdvanced\priceCheckJS\data\ 

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/priceCheckDb');
var db = mongoose.connection;

module.exports = db;