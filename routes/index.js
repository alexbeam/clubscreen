var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoskin = require('mongoskin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Configure SMTP server details with Gmail*/
var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "antoninamalyarenko@gmail.com",
        pass: "meow1234"
    }
});

/* GET New Posting page. */
router.get('/newposting', function(req, res) {
    res.render('newposting', { title: 'Add New Posting' });
});

/*-------------Applicant Data -------------------------------------------*/
/* GET Single Post Info Page */
router.get('/posting/:id', function(req,res){
    var db = req.db;
    var collection = db.get('postingcollection');
    console.log(req.params.id)
    collection.findOne({_id: req.params.id }, function(e, result){
        if (e) return next(e);
        res.render('posting', { post: result})
    })
});

/* DELETE Single Post from DB */
router.delete('/posting/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('postingcollection');
    collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e);
        res.send((result===1)?{msg:'success'}:{msg:'error'})
    })
});

router.post('/newapplicant', function(req,res){
    var db = req.db;
    var postFirstName = req.body.first;
    var postLastName = req.body.last;
    var postEmail = req.body.email;
    var postPhone = req.body.phone;
    var postYear = req.body.year;
    // var postID = req.body.id;
    var mailList = 'antoninamalyarenko@gmail.com,alexbeam@umich.edu,' + postEmail;

    var mailOptions={
        to : mailList,
        subject : "New Post from ClubScreenWolverine- Please Read",
        text: "Name: " + postFirstName + " " + postLastName
    };
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

});

/*--------Post Submission Data-----------------------------------------*/

/* GET Postinglist page. */
router.get('/postinglist', function(req, res) {
    var db = req.db;
    var collection = db.get('postingcollection');
    collection.find({},{},function(e,docs){
        res.render('postinglist', {
            "postinglist" : docs
        });
    });
});


/* POST to Add Post to the Database */
router.post('/addposting', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var postTitle = req.body.title;
    var postClub = req.body.club;
    var postEmail = req.body.email + '@umich.edu';
    var postInvolvement = req.body.involvement;
    var positionType = req.body.position_type;
    var clubType = req.body.club_type;
    var clubDescr = req.body.description;
    var daysOnSite = req.body.days;

    // Set our collection
    var collection = db.get('postingcollection');

    //Timing
    var expdate = new Date(new Date().setDate(new Date().getDate() + daysOnSite));
    var created = new Date();
    var created_format = (created.getMonth() + 1) + '/' + created.getDate() + '/' + (created.getYear()-100+2000);
    var exp_format = (expdate.getMonth() + 1) + '/' + expdate.getDate() + '/' + (expdate.getYear()-100+2000);

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
                to : 'alexbeam@umich.edu,' + postEmail,
                subject : "New Post from ClubScreenWolverine- Please Read",
                text: "Title: " + postTitle + " Club/Organization: " + postClub + " Email: " + postEmail
                + " Involvement: " + postInvolvement + " Position Type: " + positionType + " Club Type: "
                + clubType + " Club Description: " + clubDescr
            };
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
