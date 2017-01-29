var mongoose = require('mongoose');

var priceCheckDbSchema = new mongoose.Schema({
    name: String,
    objectUrl: String,
    oldPrice: Number,
    newPrice: Number,
    description: String,
    imageUrl: String,
    website: String,
    currency: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateCreated: Date,
    datePriceChanged: Date,
    lastChecked: Date
});

priceCheckDbSchema.index({ name: 'text' });
var productsCollection = mongoose.model('Product', priceCheckDbSchema);

module.exports = productsCollection;