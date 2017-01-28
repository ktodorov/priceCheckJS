var jwt = require("jsonwebtoken");
var tokenSecret = 'secret';

var bcrypt = require('bcrypt');
const saltRounds = 10;


function getLoggedUserId(token) {
    if (token) {
        var decoded = jwt.verify(token, tokenSecret);
        if (decoded._id) {
            return decoded._id
        }
    }
}

function getTokenForUser(user) {
    var token = jwt.sign({ _id: user._id }, tokenSecret, {
        expiresIn: '24h'
    });
    return token;
}

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

function comparePasswords(plainPassword, hashedPassword) {
    var areEqual = bcrypt.compareSync(req.body.password, user.password);
    return areEqual;
}

function hashPassword(plainPassword) {
    var hashedPasword = bcrypt.hashSync(password, saltRounds);
    return hashedPassword;
}

function logUser(req, res, user) {
    if (comparePasswords(req.body.password, user.password)) {
        var token = getTokenForUser(user);
        req.session.accessToken = token;
        req.session.currentUsername = user.username
        return true;
    }

    return false;
}

exports.getLoggedUserId = getLoggedUserId;
exports.getTokenForUser = getTokenForUser;
exports.requireAuthentication = requireAuthentication;
exports.comparePasswords = comparePasswords;
exports.hashPassword = hashPassword;
exports.logUser = logUser;