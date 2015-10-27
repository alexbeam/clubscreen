var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var mongoskin = require('mongoskin');
var ObjectId = require('mongodb').ObjectID;
var moment = require('moment');
moment().format();

/* GET Home Page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Applied confirmation page. */
router.get('/applied', function(req, res, next) {
    res.render('applied', { title: 'Placeholder' });
});

/* GET Posted confirmation page. */
router.get('/posted', function(req, res, next) {
    res.render('posted', { title: 'Placeholder' });
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
var transporter = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        XOAuth2:
            {
            user: "uclubs.noreply@gmail.com",
            clientId: "127548296148-kdcv51r108i6mgk0b18vssov0jhodesg.apps.googleusercontent.com",
            clientSecret:"HSRbqGslPyBBFmUPdR1UXsvL",
            refreshToken:"1/n3fOKuR9twOcYDnnbba5weM3VEMQMBO09UH7jyvM1xI"
            }
        
    }
});

/* GET New Posting page. */
router.get('/newposting', function(req, res) {
    res.render('newposting', { title: 'Add New Posting' });
});

/*-------------Applicant Data -------------------------------------------*/
/* GET Single Post Info Page */
router.get('/posting/:id', function(req,res){
    var db = req.app.get('db');
    var collection = db.collection('postingcollection');
    console.log(req.params.id);
    collection.findOne({_id : ObjectId(req.params.id)}, function(e, result){
        if(e) return next(e)

        else {
            if (result.active == false) {
            collection.update({_id : ObjectId(req.params.id)}, {$set : {"active" : true}})
            res.render('posting', { post: result})    
            console.log(result);
        }
        else
            res.render('posting', { post: result})
            console.log(result);
        };
    })
});


/* DELETE Single Post from DB */
router.delete('/posting/:id', function(req, res) {
    var db = req.app.get('db');
    var collection = db.collection('postingcollection');
    collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e);
        res.send((result===1)?{msg:'success'}:{msg:'error'})
    })
});

router.post('/newapplicant', function(req,res){
    var db = req.app.get('db');

    var applicantFirstName = req.body.first;
    var applicantLastName = req.body.last;
    var applicantEmail = req.body.email + '@umich.edu';
    var applicantPhone = req.body.phone;
    var applicantYear = req.body.year;
    var applicantExperience = req.body.experience;
    var postID = req.body.id.toString();
    var collection = db.collection('postingcollection');

    console.log(applicantEmail);

    collection.findOne({_id: ObjectId(postID)}, function(err, posting) {
        console.log(posting);

        var mailList = posting.email + ',' + applicantEmail;

        var mailOptions={
            from : "uclubs.noreply@gmail.com",
            to : applicantEmail,
            subject : "uCLUBS - You have a new applicant",
            generateTextFromHTML : true,
            html: "<h2>New applicant for " + posting.title + "</h2><strong>" + applicantFirstName + " " + applicantLastName + "</strong> (" + applicantYear + ")<br>Email: " + applicantEmail + "<br>Phone: +1 " + applicantPhone + "<br><p><strong>Relevant Experience/What makes you a good candidate?</strong><br>" + applicantExperience + "</p>"
        };

        var mailOpts1={
            from : "uclubs.noreply@gmail.com",
            to : applicantEmail,
            subject : "uCLUBS- You have successfully applied to a posting",
            generateTextFromHTML : true,
            html:"<h2>Confirmed: Your application has been received!" +
            "The poster will get back to you if your skills fit his/her needs. </h2>"
        };
        console.log(mailOptions);

        postCount= posting.received;
        collection.update({_id: ObjectId(postID)},{$set:{received: postCount +1}}, function(err, updated) {
            if (err || !updated) console.log("Post not updated");
            else console.log("Post updated");
        });

        transporter.sendMail(mailOptions, function(error, response){
            if(error)
            {
                console.log(error);
                res.end("error");
            }
            else
            {
                console.log("Message sent: " + response.message);

            }
            transporter.close();
        });

        transporter.sendMail(mailOpts1, function(error, response){
            if(error)
            {
                console.log(error);
                res.end("error");
            }
            else
            {
                console.log("Message sent: " + response.message);

                // And forward to success page
                //res.redirect("applied");
            }
            transporter.close();
        });

        // And forward to success page
        res.redirect("applied");
    });
});

/*--------Posting Submission Data-----------------------------------------*/

/* GET Postinglist page. */
router.get('/postinglist', function(req, res) {
     var db = req.app.get('db');
     var collection = db.collection('postingcollection');
     var filters = ["Involvement Type: All", "Position Type: All", "Club Type: All"];
     collection.find({$query: {"active" : true}, $orderby: { createdAt : -1 }}).toArray(function(e,docs){
         res.render('postinglist', {
             "postinglist" : docs, "filterlist" : filters
         })
     });
});

/* GET Postinglist filters */
router.post('/postinglist', function(req, res) {
    var involvement_type = req.body.involvement_type;
    var position_type = req.body.position_type;
    var club_type = req.body.club_type;

    if (involvement_type == "") {
        filter1 = "Involvement Type: All"
    }
    else {
        filter1 = involvement_type
    }
    if (position_type == undefined) {
        filter2 = "Position Type: All"
    }
    else {
        filter2 = position_type
    }
    if (club_type == undefined) {
        filter3 = "Club Type: All"
    }    
    else {
        filter3 = club_type
    }

    var filters = [filter1, Array(filter2), filter3]

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
    var db = req.app.get('db');
    var collection = db.collection('postingcollection');

    collection.find({$query: {
            "active" : true,
            "involvement" : involvement_type, 
            "position_type" : position_type, 
            "club_type" : club_type}, $orderby: { createdAt : -1 } }).toArray(function(e,docs){
        res.render('postinglist', {postinglist: docs, filterlist: filters})
    });
});



/* POST to Add Post to the Database */
router.post('/addposting', function(req, res) {

    // Set our internal DB variable
    var db = req.app.get('db');
    console.log(req.body);

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
    var collection = db.collection('postingcollection');

    //Timing
    var created = new Date()
    var fcreated = moment().utcOffset(-500);
    var expdate = new Date(new Date().setDate(new Date().getDate() + daysOnSite));
    var fdate = moment(expdate).utcOffset(-500);
    var created_format = fcreated.format("MM/DD/YYYY")
    var exp_format = fdate.format("MM/DD/YYYY")

    var data = {
        "title" : postTitle,
        "club" : postClub,
        "email" : postEmail,
        "involvement" : postInvolvement,
        "position_type" : positionType,
        "club_type" : clubType,
        "description" : clubDescr,
        "created": created_format,
        "createdAt" : created,
        "expireAt": expdate,
        "expires" : exp_format,
        "received": 0,
        "active": false
    }
    // Submit to the DB
    collection.insert(data, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            console.log(data.title);
            //send email
            var mailOptions={
                from : "uclubs.noreply@gmail.com",
                to : postEmail,
                subject : "Activate your post on uCLUBS",
                generateTextFromHTML : true,
                html : "<h2>Welcome to uCLUBS,</h2><p>Thank you for submitting the posting " + data.title + ", follow this link to activate it: </p><a href='http://clubscreen.herokuapp.com/posting/" + data._id + "'>http://www.u-clubs.com/posting/" + data._id + "</a>",
            };
            console.log(mailOptions);


            transporter.sendMail(mailOptions, function(error, response){
                if(error)
                {
                    console.log(error);
                    res.end("error");
                }
                else
                {
                    console.log("Message sent: " + response.message);
                    res.end("sent");
                }
                transporter.close();
            });

            // And forward to success page
            res.redirect("posted");
        }
    });
});

module.exports = router;
