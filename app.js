
/**
 * Module dependencies.
 */
var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  
var app = express();

// Express app configuration 
app.configure(function(){

  // database
  app.db = mongoose.connect(process.env.MONGOLAB_URI);

  //  templates directory
  app.set('views', __dirname + '/views');

  // setup template engine - we're using Hogan-Express
  // https://github.com/vol4ok/hogan-express
  app.set('view engine', 'html');
  app.set('layout','layout');
  app.engine('html', require('hogan-express'));

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  // css, images and js
  app.use(express.static(path.join(__dirname, 'public')));

});
//------------------SETUP FOR TWILIO ------------------
/* Set up hash to store our Twilio account info in */
config = {};
config.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
config.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
config.HOST = process.env.TWILIO_HOST;
config.caller_id = process.env.TWILIO_CALLER_ID;
config.port = process.env.PORT || 5000;

/* Create the Twilio Client and Twiml objects */
var TwilioClient = require('heroku-twilio').Client,
  Twiml = require('heroku-twilio').Twiml,
  client = new TwilioClient(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN , config.HOST, {
    "express" : app
  });

/* Get the caller_id and create a phone number object with it */
var phone = client.getPhoneNumber(config.caller_id);

//------------------SETUP FOR TWILIO END------------------


// public routes
var routes = require('./routes/index.js');
app.get('/', routes.index);
app.get('/photobooth',routes.photobooth);
app.post('/newphoto', routes.new_photo);

app.get('/test', routes.test);
app.get('/request',function(req,res){
  console.log(req);
  res.send("hello world");
});


// app.get('/paramemter/:role/:name/:status',function(req,res){
//   console.log(req.params.role);
//   //console.log(req.route);
//   res.end();
// });


app.get("/sendSms/:firstName/:phoneNumber", function(req, res){

  var requestNum = req.params.phoneNumber.toString();
  var validNumber = requestNum.replace("-","");
  validNumber = "+1" + validNumber;
  console.log(validNumber);
  
  var number = "+19177255750"; // Set this equal to the number you want to text

  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    phone.sendSms(number, 'Hello, this is your new twilio phone number texting you!', null, function(sms){
      res.send('Sending sms to ' + number);
    });
  }
});

app.get('/photo/delete/:photo_id', routes.delete_photo);
app.get('/photo/:photo_id', routes.display_photo);


// Turn the server on!
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
