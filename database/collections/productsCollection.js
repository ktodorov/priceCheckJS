var mongoose = require('mongoose');

var priceCheckDbSchema = new mongoose.Schema({
    name: String,
    objectUrl: String,
    oldPrice: Number,
    newPrice: Number,
    description: String,
    imageUrl: String,
    website: String,
    currency: Number
}, { collection: "priceCheckObjectsCollection" });

priceCheckDbSchema.index({ name: 'text' });
var productsCollection = mongoose.model('Product', priceCheckDbSchema, "priceCheckObjectsCollection");

module.exports = productsCollection;