var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

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

/* Configure SMTP server details with Gmail*/
var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "antoninamalyarenko@gmail.com",
        pass: "meow1234"
    }
});

/* POST to Add User Service */
router.post('/addposting', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var postTitle = req.body.title;
    var postClub = req.body.club
    var postEmail = req.body.email + '@umich.edu'
    var postInvolvement = req.body.involvement;
    var positionType = req.body.position_type;
    var clubType = req.body.club_type;
    var clubDescr = req.body.description;
    var daysOnSite = req.body.days

    // Set our collection
    var collection = db.get('postingcollection');

    //Timing
    var expdate = new Date(new Date().setDate(new Date().getDate() + daysOnSite))
    var created = new Date()
    var created_format = (created.getMonth() + 1) + '/' + created.getDate() + '/' + (created.getYear()-100+2000)
    var exp_format = (expdate.getMonth() + 1) + '/' + expdate.getDate() + '/' + (expdate.getYear()-100+2000)

    // Submit to the DB
    collection.insert({
        "title" : postTitle,
        "club" : postClub,
        "email" : postEmail,
        "involvement" : postInvolvement,
        "position_type" : positionType,
        "club_type" : clubType,
        "description" : clubDescr,
        "created": created_format,
        "expireAt": expdate,
        "expires" : exp_format
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            //send email
            var mailOptions={
                to : "antoninamalyarenko@gmail.com",
                subject : "New Post from ClubScreenWolverine- Please Read",
                text: "Title: " + postTitle + " Club/Organization: " + postClub + " Email: " + postEmail
                + " Involvement: " + postInvolvement + " Position Type: " + positionType + " Club Type: "
                + clubType + " Club Description: " + clubDescr
            }
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error);
                    res.end("error");
                }else{
                    console.log("Message sent: " + response.message);
                    res.end("sent");
                }
            });

            // And forward to success page
            res.redirect("postinglist");
        }
    });
});

module.exports = router;
