
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

var gifIndex = 0;
exports.intro = function(req,res){
  res.render("intro.html");
}

// main page
exports.index =  function(req,res){
  res.render("index.html");
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
  gifPost.index = gifIndex;
  //gifPost.urltitle = req.body.photoIndex.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_');
   
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

  var gifQuery = Gif.find({});
  gifQuery.exec(function(err,gifs){
    if(err){
      console.error(err);
      res.send("Error");
    }else{
      //Update all index 
      for(var i = 0; i < gifs.length; i++){
        
        gifs[i].index = i;
        gifs[i].save();
        //console.log("entire photo list updated : " +photos);
      }
    }
  });
  gifQuery.sort('-created');
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

exports.mainpage_gifs = function(req,res){

  var gifQuery = Gif.find({});
  gifQuery.exec(function(err,gifs){
    if(err){
      console.error(err);
      res.send("Error");
    }else{
      //Update all index 
      for(var i = 0; i < gifs.length; i++){
        
        gifs[i].index = i;
        gifs[i].save();
        //console.log("entire photo list updated : " +photos);
      }
    }
  });
  gifQuery.sort('-created');
  var forDisplay = new Array();
  var len = 4;
  gifQuery.exec(function(err,gifs){
    if(err){
      console.error(err);
    }else{
      for(var i = 0; i< len; i++){
        forDisplay[i] = gifs[i];
      }
      templateData=
      {
        gifs : forDisplay
      }
      res.render("mainpage_gifs.html", templateData);
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

exports.update_index = function(req,res){
  console.log("____________________");
  console.log(req);
  console.log("____________________");
    //Update all picture index after remove two pictures
  var gifQuery = Gif.find({});
  gifQuery.exec(function(err,gifs){
    if(err){
      console.error(err);
      res.send("Error");
    }else{
      //Update all index 
      for(var i = 0; i < gifs.length; i++){
        
        gifs[i].index = i;
        gifs[i].save();
        //console.log("entire photo list updated : " +photos);
      }
    }
  });
  console.log("Redirect to main page");
  res.redirect('/');
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
