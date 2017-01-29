module.exports = function(app, midFunc) {
    app.get("/analyzeObject", midFunc, function(req, res) {
        var url = req.query.url;
        core.analyzeObject(url, function(result) {
            res.send(result);
        })
    });

    app.get("/getUsername", midFunc, function(req, res) {
        var username = req.session.currentUsername;
        res.send(username);
    })
}