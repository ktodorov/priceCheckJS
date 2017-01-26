var mongoose = require('mongoose');

var usersDbSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

usersDbSchema.index({ name: 'text' });
var usersCollection = mongoose.model('User', usersDbSchema);

module.exports = usersCollection;