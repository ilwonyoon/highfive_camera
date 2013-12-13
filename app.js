
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

// TWILIO_ACCOUNT_SID=AC6fc34d5a4554079bc112ed50fbef313e
// TWILIO_AUTH_TOKEN=b90dbcfc8ba59523e7c55e411ea8bfbf

// var accountSid = 'AC6fc34d5a4554079bc112ed50fbef313e';
// var authToken = "{{ b90dbcfc8ba59523e7c55e411ea8bfbf }}";
// var client1 = require('node_modules/twilio/lib')(accountSid, authToken);
//------------------SETUP FOR TWILIO END------------------


// public routes
var routes = require('./routes/index.js');
app.get('/', routes.index);
app.get('/intro',routes.intro);
app.post('/newgif', routes.new_gif);
app.get('/allgif', routes.allgif);
app.get('/allgif/:gif_id', routes.each_gif);
app.get('/allgif/delete/:gif_id', routes.delete_gif);
app.get('/mainpage_gifs',routes.mainpage_gifs);
//update index from 0 ~ DB.length
app.get('/update_index', routes.update_index);
app.get("/sendSms/:firstName/:phoneNumber", function(req, res){

  var valid = "+1";
  var number = req.params.phoneNumber;
  var profile_name = req.params.firstName;
  var textContent ="!Your High-Five Partner is looking for you! Come to room 15!";

  textContent =profile_name.concat(textContent);
  number = number.toString();
  number = number.replace("-","");
  if(number.charAt(0) != "+" ){
    number = valid.concat(number);
  }
  console.log("number is  : " +  number);
  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    // phone.sendSms(number, textContent, null, function(sms){
    //   res.send('Sending sms to ' + number);
    // });
    res.send('Sent SMS to ' + profile_name);
    console.log('Sending sms to Number :' + number + "," + textContent);
  }
});

app.post('/send',function(req,res){
 
  // These vars are your accountSid and authToken from twilio.com/user/account
 
  var accountSid = 'AC6fc34d5a4554079bc112ed50fbef313e';
  var authToken = "b90dbcfc8ba59523e7c55e411ea8bfbf";
 // to: "+17732512040",
 //      from: "+17059901587",
  var client = require('twilio')(accountSid, authToken);

  client.messages.create({
    body: "Jenny please?! I love you <3",
    to: "+17732512040",
    from: "+17059901587",
    mediaUrl: "http://www.example.com/hearts.png"
}, function(err, message) {
    process.stdout.write(message.sid);
});

});




// Turn the server on!
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
