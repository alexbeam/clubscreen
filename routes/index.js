var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoskin = require('mongoskin');

/* GET Home Page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Calendar Page-Placeholder */
router.get('/calendar', function(req, res, next) {
    res.render('calendar', { title: 'Placeholder' });
});

/* GET Resources- Placeholder */
router.get('/resources', function(req, res, next) {
    res.render('resources', { title: 'Placeholder' });
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

    collection.findOne({_id: req.params.id }, function(e, result){
        if(e) return next(e)

        else {
            if (result.active == false) {
            collection.update({_id : req.params.id}, {$set : {"active" : true}})
            res.render('posting', { post: result})    
        }
        else
            res.render('posting', { post: result})
        };
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
    var applicantFirstName = req.body.first;
    var applicantLastName = req.body.last;
    var applicantEmail = req.body.email + '@umich.edu';
    var applicantPhone = req.body.phone;
    var applicantYear = req.body.year;
    var postID = req.body.id.toString();
    var collection = db.get('postingcollection');

    console.log(applicantEmail);

    collection.findOne({_id: postID}, function(err, posting) {
        console.log(posting);

        var mailList = 'antoninamalyarenko@gmail.com,' + posting.email + ',' + applicantEmail;

        var mailOptions={
            to : mailList,
            subject : "New Post from uCLUBS - Please Read",
            text: "Name: " + applicantFirstName + " " + applicantLastName + " You applied for "+ posting.title,
            html: ""
        };
        console.log(mailOptions);

        postCount= posting.received;
        collection.update({_id:postID},{$set:{received: postCount +1}}, function(err, updated) {
            if (err || !updated) console.log("Post not updated");
            else console.log("Post updated");
        });

        transporter.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.end("error");
            }else{
                console.log("Message sent: " + response.message);
                // And forward to success page
                res.redirect("postinglist");
            }
        });
    });
});

/*--------Posting Submission Data-----------------------------------------*/

/* GET Postinglist page. */
router.get('/postinglist', function(req, res) {
    var db = req.db;
    var collection = db.get('postingcollection');

    collection.find({ $query: {"active" : true}, $orderby: { createdAt : -1 } } ,function(e,docs){
        res.render('postinglist', {
            "postinglist" : docs
        })
    });
});

/* GET Postinglist filters */
router.post('/postinglist', function(req, res) {
    var involvement_type = req.body.involvement_type;
    var position_type = req.body.position_type;
    var club_type = req.body.club_type;

    if (involvement_type == "") {
        involvement_type = {$in : ['Freelance Task', 'Club Position']}
    }
    if (position_type == undefined) {
        position_type = {$in : ['General Membership', 'Coding/Web Design', 'Graphic Design/Art',
                                'Event Planning', 'Fundraising/Treasury', 'Marketing/Promotion',
                                'Musical/Performance', 'Manufacturing/Assembly']}
    }
    if (club_type == undefined) {
        club_type = {$in : ['Not Applicable', 'Activism', 'Creative Expression',
                            'Cultural', 'Nature/Sustainability', 'Student Government',
                            'Health and Wellness', 'Religious/Spiritual', 'Technology/Science',
                            'Community Engagement', 'Greek', 'Academic', 'Athletics', 'Career Development', 'Social']}
    }

    console.log(involvement_type, position_type, club_type);

    var db = req.db;
    var collection = db.get('postingcollection');

    var filters = [involvement_type, position_type, club_type]

    collection.find({$query: {
            "active" : true,
            "involvement" : involvement_type, 
            "position_type" : position_type, 
            "club_type" : club_type}, $orderby: { createdAt : -1 } },function(e,docs){
        console.log(docs);
        res.render('postinglist', {postinglist: docs})
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
    var daysOnSite = Number(req.body.days);

    // Set our collection
    var collection = db.get('postingcollection');

    //Timing
    var created = new Date();
    var expdate = new Date(new Date().setDate(new Date().getDate() + daysOnSite));
    var created_format = (created.getMonth() + 1) + '/' + created.getDate() + '/' + (created.getYear()-100+2000);
    var exp_format = (expdate.getMonth() + 1) + '/' + expdate.getDate() + '/' + (expdate.getYear()-100+2000);

    // Submit to the DB
    collection.insert({
        "title" : postTitle,
        "club" : postClub,
        "email" : postEmail,
        "involvement" : postInvolvement,
        "position_type" : Array(positionType),
        "club_type" : Array(clubType),
        "description" : clubDescr,
        "created": created_format,
        "createdAt" : created,
        "expireAt": expdate,
        "expires" : exp_format,
        "received": 0,
        "active": false
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            //send email
            var mailOptions={
                to : postEmail,
                subject : "New Post from uCLUBS- Please Read",
                // text: "Title: " + postTitle + " Club/Organization: " + postClub + " Email: " + postEmail
                // + " Involvement: " + postInvolvement + " Position Type: " + positionType + " Club Type: "
                // + clubType + " Club Description: " + clubDescr + " Please activate post by visiting: localhost:3000/posting/" + doc._id,
                html: "<h1>Welcome to uCLUBS!</h1><p>Thank you for submitting a posting, follow this link to activate your posting: </p>" + "<a href='http://localhost:3000/posting/" + doc._id + "'>localhost:3000/posting/"+doc._id+"</a>",
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
