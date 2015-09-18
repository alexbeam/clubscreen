var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var uriUtil = require('mongodb-uri');

var mongodb = require('mongodb');
// var db = monk();

var uri = 'mongodb://heroku_63wvdhmw:avdcnm2j5u6os89j2g46m6iugt@ds049548.mongolab.com:49548/heroku_63wvdhmw'

mongodb.MongoClient.connect(uri, function(err, udb) {
  if(err) throw err;
  var db = udb;
  var coll = db.collection.insert('postingcollection');
});

var routes = require('./routes/index');

var app = express();

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
    console.log('Our app is running on' + app.get('port'));
});

app.use('/', routes);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
    req.db = db;
    next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
