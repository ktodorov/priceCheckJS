module.exports = function(app, express, dirname) {
    var bodyParser = require('body-parser');
    var cookieSession = require('cookie-session');

    app.use(express.static(dirname + '/public'));
    app.use(express.static(dirname + '/images'));

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(cookieSession({
        name: 'session',
        keys: ['key1', 'key2']
    }));
}