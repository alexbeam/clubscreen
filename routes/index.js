var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/postinglist', function(req, res) {
    var db = req.db;
    var collection = db.get('postingcollection');
    collection.find({},{},function(e,docs){
        res.render('postinglist', {
            "postinglist" : docs
        });
    });
});

/* GET New Posting page. */
router.get('/newposting', function(req, res) {
    res.render('newposting', { title: 'Add New Posting' });
});

/* POST to Add User Service */
router.post('/addposting', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var Title = req.body.posttitle;
    var Club = req.body.club
    var Email = req.body.email;

    // Set our collection
    var collection = db.get('postingcollection');

    var expdate = new Date(new Date().setDate(new Date().getDate() + 7))
    var created = new Date()
    var created_format = (created.getMonth() + 1) + '/' + created.getDate() + '/' + (created.getYear()-100+2000)
    var exp_format = (expdate.getMonth() + 1) + '/' + expdate.getDate() + '/' + (expdate.getYear()-100+2000)

    // Submit to the DB
    collection.insert({
        "title" : Title,
        "club" : Club,
        "email" : Email,
        "created": created_format,
        "expireAt": expdate,
        "expires" : exp_format
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("postinglist");
        }
    });
});

module.exports = router;
