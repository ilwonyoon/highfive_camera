//require the Twilio module and create a REST client
// var ACCOUNT_SID = ;
// var AUTH_TOKEN = 

var client = require('twilio')('AC6fc34d5a4554079bc112ed50fbef313e', 'b90dbcfc8ba59523e7c55e411ea8bfbf');
//node configure.js --account_sid AC6fc34d5a4554079bc112ed50fbef313e --auth_token b90dbcfc8ba59523e7c55e411ea8bfbf 
//Send an SMS text message
client.sendMessage({

    to:'+17732512040', // Any number Twilio can deliver to
    from: '+13313304899', // A number you bought from Twilio and can use for outbound communication
    body: 'Twilio test on my server' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.to);
        console.log(responseData.body); // outputs "word to your mother."

    }
});


