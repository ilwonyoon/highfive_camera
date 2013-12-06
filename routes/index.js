
var moment = require('moment');

var Photo = require('../models/photo.js');
var Gif = require('../models/gif_image.js');


var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var s3 = new AWS.S3();

var photoIndex= 0;


// main page
exports.index =  function(req,res){

  // query for all images
  //console.log(req);
  var randomIndex = Math.floor(Math.random()*photoIndex);
  console.log(Math.random()*photoIndex);
  Photo.count({}, function( err, count){
    photoIndex = count;
  });

  var photoQuery = Photo.find({index : randomIndex});
  var photoQuery2 = Photo.find({index : 2});

  console.log(photoQuery2);
  //photoQuery.sort('-created');
  photoQuery.exec(function(err, photos){
    if (err) {
      console.error(err);
      res.send("error on querying images");

    } else {

      res.locals({photos: photos});
      // templateData = {
      //   title : 'hifivepicture',
      //   photos : photos,
      //   otherphoto  : photoQuery2
      // };

      //res.render("index.html", templateData);

    }
  })

  photoQuery2.exec(function(err, photos){
    if (err) {
      console.error(err);
      res.send("error on querying images");

    } else {

      res.locals({otherphoto: photos});
      res.render("index.html");

    }
  })

};

exports.photobooth = function(req, res) {

    var templateData = {

    }

    res.render('photobooth.html', templateData);
}

exports.photobooth_upload = function(req, res){

  var name = 'my_data_pic_';
  var file_ext = ".png";
  var d = new Date();
  var timestamp = d.getTime();

  var photoData = req.body.image_data;

  var filename = name +timestamp.toString()+file_ext;


  
  // var b64str = req.files;
  photoData = photoData.replace("data:image/webp;base64,","");
  // convert to buffer
  var photo_buffer = new Buffer(photoData, 'base64');
   
  // prepare database record
  var photoPost = new Photo(); // create Blog object
  photoPost.index = photoIndex;
  photoPost.firstName = req.body.firstName;
  photoPost.last_name= req.body.lastName;
  photoPost.phoneNumber = req.body.phoneNumber;
  photoPost.urltitle = req.body.firstName.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');
   
  // pick the Amazon S3 Bucket
  var s3bucket = new AWS.S3({params: {Bucket: 'hifivepicture'}});
   
  // Set the bucket object properties
  // Key == filename
  // Body == contents of file
  // ACL == Should it be public? Private?
  // ContentType == MimeType of file ie. image/jpeg.
  var params = {
    Key: filename,
    Body: photo_buffer,
    ACL: 'public-read',
    ContentType: 'image/png'
  };
   
  // Put the Object in the Bucket
  s3bucket.putObject(params, function(err, data) {
    if (err) {
      console.log(err)
   
    } else {
      console.log("Successfully uploaded data to s3 bucket");
   
      // add image to blog post
      photoPost.image = filename;
    }
   
    photoPost.save();
    photoIndex += 1;
   
    res.redirect('/');
   
  });
}

exports.test = function(req, res) {

    var templateData = {

    }

    res.render('joke.html', templateData);
}


//display individual photo
exports.display_photo = function(req, res){ 

  var photo_id = req.params.photo_id;
  
  Photo.findById(photo_id, function(err, photo) {

    if (err) {
      console.error(err);
      res.send("Unable to find photo");
    } else {

      templateData = {
        photo : photo
      }

      // display photo
      res.render('photo_detail.html', templateData);
    }
  });

};

exports.delete_photo = function(req, res) {

  // get the photo
  // delete from S3
  // delete from Mongo
  var photo_id = req.params.photo_id;

  Photo.findById(photo_id, function(err, photo){

    if (err) {
      console.error(err);
      res.send("unable to find the photo");
    } else {

      // delete from S3
      s3.client.deleteObject({Bucket: 'hifivepicture', Key: photo.image}, function(err, data) {
        console.log(err, data)

        // delete from MongoDB
        photo.remove(function(err){
          if (err) {
            console.error("error when trying to remove photo document from mongo")
            console.error(err);

            res.send("Unable to remove photo document from Mongo");
          }

          // else redirect to main page

          res.redirect('/')

        })
      });


    }

  })

};


exports.new_photo = function(req, res){
  

  var name = 'my_data_pic_';
  var file_ext = ".gif";
  var d = new Date();
  var timestamp = d.getTime();

  var photoData = req.body.image_data;

  var filename = name +timestamp.toString()+file_ext;


  console.log("--------------------------");
  console.log("--------------------------");
  // var b64str = req.files;
  photoData = photoData.replace("data:image/gif;base64,","");
  // convert to buffer
  var photo_buffer = new Buffer(photoData, 'base64');
   
  // // prepare database record
  var photoPost = new Photo(); // create Blog object
  photoPost.index = photoIndex;
  photoPost.firstName = req.body.firstName;
  photoPost.last_name= req.body.lastName;
  photoPost.phoneNumber = req.body.phoneNumber;
  photoPost.urltitle = req.body.firstName.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');
   
  // pick the Amazon S3 Bucket
  var s3bucket = new AWS.S3({params: {Bucket: 'hifivepicture'}});
   
  // Set the bucket object properties
  // Key == filename
  // Body == contents of file
  // ACL == Should it be public? Private?
  // ContentType == MimeType of file ie. image/jpeg.
  var params = {
    Key: filename,
    Body: photo_buffer,
    ACL: 'public-read',
    ContentType: 'image/gif'
  };
   
  // Put the Object in the Bucket
  s3bucket.putObject(params, function(err, data) {
    if (err) {
      console.log(err)
   
    } else {
      console.log("Successfully uploaded data to s3 bucket");
   
      // add image to blog post
      photoPost.image = filename;
    }
   
    photoPost.save();
    photoIndex += 1;
   
    res.redirect('/');
   
  });

};

exports.sendSms = function(req,res){

  var number = "+19177255750"; // Set this equal to the number you want to text

  if(!number){
    res.send('You need to set a phone number to call in app.js');
  }else{
    phone.sendSms(number, 'Hello, this is your new twilio phone number texting you!', null, function(sms){
      res.send('Sending sms to ' + number);
    });
  }

}

var cleanFileName = function(filename) {
    
    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    fileParts = filename.split(".");
    
    //get the file extension
    fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();
    
    //name without extension "My Pet Dog"
    newFileName = fileParts[0];
    
    return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
    
}
