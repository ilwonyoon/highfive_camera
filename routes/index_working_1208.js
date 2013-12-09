
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

//Total number of Picture
var total= 0;

//Add Index number to data
var photoIndex =0;
var gifIndex = 0;

// MongoDB id to delete pictures later. 
var profile1_id;
var profile2_id;

var updateIndex = function(){
  var update = Photo.find({});
  update.exec(function(err,photos){
    if(err){
      console.error(err);
    }else{
      for(var i = 0; i < photos.length; i++){
        photos[i].index = i;
        photos[i].save();
      }
      console.log("update all index");
    }
  });
}


// main page
exports.index =  function(req,res){
  //updateIndex();
  //Check how many pictures in Data Base
  Photo.count({}, function( err, count){
    total = count;
    console.log("Total number of pictures : " + total );
  });

 if(total >=2){
    //pick random index from entire image pool
    var rIndex = Math.floor(Math.random()*total);
    var rIndex2 = Math.floor(Math.random()*total);
    console.log("rIndex : " + rIndex);
    console.log("rIndex2 : " + rIndex2);

    while(rIndex == rIndex2){
      console.log("you need to reset random");
      rIndex2 = Math.floor(Math.random()*total);
      console.log("rIndex2 : " +  rIndex2);
      
    }

    var photoQuery = Photo.find({index : rIndex});
    var photoQuery2 = Photo.find({index : rIndex2});

    //photoQuery.sort('-created');
    photoQuery.exec(function(err, photos){
      if (err) {
        console.error(err);
        res.send("error on querying images");
      } else {
       profile1_id = photos[0]._id;
       res.locals({photos: photos});
       console.log("photo object is  : " +  photos);
       photoQuery2.exec(function(err,photos){
        if(err){
          console.error(err);
        }else{
          profile2_id = photos[0]._id;
          console.log("otherphoto object : " + photos);
          res.locals({otherphoto: photos});
          res.render("index.html");
        }
       })

      }
    });
  //if there are less than 2 pics in DB  
  }else{
    res.render("index.html");
  }
};


//Upload new gif to MongoDB and s3
exports.new_gif = function(req, res){
  
  var name = 'hifivegif_';
  var file_ext = ".gif";
  var d = new Date();
  var timestamp = d.getTime();
  var gifData = req.body.image_data;
  var filename = name +timestamp.toString()+file_ext;
  
  gifData = gifData.replace("data:image/gif;base64,","");
  // convert to buffer
  var gif_buffer = new Buffer(gifData, 'base64');
  // // prepare database record
  var gifPost = new Gif(); // create Blog object
  gifPost.index = photoIndex;
  gifPost.firstName = req.body.firstName;
  gifPost.last_name= req.body.lastName;
  gifPost.phoneNumber = req.body.phoneNumber;
  gifPost.urltitle = req.body.firstName.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');
   
  // pick the Amazon S3 Bucket
  var s3bucket = new AWS.S3({params: {Bucket: 'hifivepicture'}});
   
  // Set the bucket object properties
  // Key == filename
  // Body == contents of file
  // ACL == Should it be public? Private?
  // ContentType == MimeType of file ie. image/jpeg.
  var params = {
    Key: filename,
    Body: gif_buffer,
    ACL: 'public-read',
    ContentType: 'image/gif'
  };
   
  // Put the Object in the Bucket
  s3bucket.putObject(params, function(err, data) {
    if (err) {
      console.log(err)
   
    } else {
      console.log("Gif : Successfully uploaded data to s3 bucket");
   
      // add image to blog post
      gifPost.image = filename;
    }
   
    gifPost.save();
    gifIndex += 1;
   
    res.redirect('/allgif');
   
  });

};

//Display All Gif files in DB
exports.allgif = function(req,res){
  gifQuery = Gif.find({});
  gifQuery.exec(function(err,gifs){
    if(err){
      console.error(err);
    }else{
      templateData=
      {
        gifs : gifs
      }
      res.render("allgif.html", templateData);
    }
  })
}

exports.each_gif = function(req, res){
  var gif_id = req.params.gif_id;
  console.log("gif_id : "+  gif_id);
  Gif.findById(gif_id, function(err,gif){
    if(err){
      console.error(err);
    }else{
      templateData ={gif : gif}
      res.render("gif_detail.html", templateData);
    }
  });//findById
}

exports.photobooth = function(req, res) {

    var templateData = {

    }

    res.render('photobooth.html', templateData);
}


exports.photobooth_upload = function(req, res){

  var name = 'profile_';
  var file_ext = ".png";
  var d = new Date();
  var timestamp = d.getTime();
  var photoData = req.body.image_data;
  var filename = name +timestamp.toString()+file_ext;
  
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
      console.log("Profile is Successfully uploaded data to s3 bucket");
   
      // add image to blog post
      photoPost.image = filename;
    }
   
    photoPost.save();
    photoIndex += 1;
   
    res.redirect('/update_index_after_photo_upload');
   
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
  console.log(req.params);
  
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

exports.delete_gif = function(req, res) {

  // get the photo
  // delete from S3
  // delete from Mongo
  var gif_id = req.params.gif_id;


  Gif.findById(gif_id, function(err, gif){

    if (err) {
      console.error(err);
      res.send("unable to find the photo");
    } else {

      // delete from S3
      s3.client.deleteObject({Bucket: 'hifivepicture', Key: gif.image}, function(err, data) {
        console.log(err, data)

        // delete from MongoDB
        gif.remove(function(err){
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


exports.delete_photo_afterTimer = function(req, res) {

  console.log("----Delete two images from DB-----");
  console.log("otherphoto :" + profile1_id);
  console.log("otherphoto :" + profile2_id);
  console.log("-----------------------------------");

  Photo.findById(profile1_id, function(err, photo){

    if (err) {
      console.error(err);
      res.send("unable to find the photo");
    } else {
      s3.client.deleteObject({Bucket: 'hifivepicture', Key: photo.image}, function(err, data) {
        console.log(err, data);
        photo.remove(function(err){
          if (err) {
            console.error("error when trying to remove photo document from mongo")
            console.error(err);
            res.send("Unable to remove photo document from Mongo");
          }
        })
      });
    }
  });

   Photo.findById(profile2_id, function(err, photo){

    if (err) {
      console.error(err);
      res.send("unable to find the photo");
    } else {
      s3.client.deleteObject({Bucket: 'hifivepicture', Key: photo.image}, function(err, data) {
        console.log(err, data);
        photo.remove(function(err){
          if (err) {
            console.error("error when trying to remove photo document from mongo")
            console.error(err);
            res.send("Unable to remove photo document from Mongo");
          }
        })
      });
    }
  });

  res.redirect('/update_index');
};

exports.update_index = function(req,res){
  console.log("____________________");
  console.log(req);
  console.log("____________________");
    //Update all picture index after remove two pictures
  var photoQuery = Photo.find({});
  photoQuery.exec(function(err,photos){
    if(err){
      console.error(err);
      res.send("Error");
    }else{
      //Update all index 
      for(var i = 0; i < photos.length; i++){
        
        photos[i].index = i;
        photos[i].save();
        //console.log("entire photo list updated : " +photos);
      }
    }
  });
  console.log("Redirect to main page");
  res.redirect('/');
}


exports.update_index_after_photo_upload = function(req,res){

  var photoQuery = Photo.find({});
  photoQuery.exec(function(err,photos){
    if(err){
      console.error(err);
      res.send("Error");
    }else{
      //Update all index 
      for(var i = 0; i < photos.length; i++){
        
        photos[i].index = i;
        photos[i].save();
        //console.log("entire photo list updated : " +photos);
      }
    }
  });
  console.log("Redirect to main page");
  res.redirect('/photobooth');
}





// exports.sendSms = function(req,res){

//   var number = "+19177255750"; // Set this equal to the number you want to text

//   if(!number){
//     res.send('You need to set a phone number to call in app.js');
//   }else{
//     phone.sendSms(number, 'Hello, this is your new twilio phone number texting you!', null, function(sms){
//       res.send('Sending sms to ' + number);
//     });
//   }

// }

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
