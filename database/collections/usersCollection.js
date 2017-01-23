var mongoose = require('mongoose');

var usersDbSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
}, { collection: "priceCheckObjectsCollection" });

usersDbSchema.index({ name: 'text' });
var usersCollection = mongoose.model('User', usersDbSchema, "priceCheckObjectsCollection");

module.exports = usersCollection;