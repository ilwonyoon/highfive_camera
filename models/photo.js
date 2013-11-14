var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photoSchema = new Schema({
    title     : String,
    urltitle  : String,
    caption      : String,
    image : String,
    created : { type: Date, default: Date.now }
});

// export Page model
module.exports = mongoose.model('Photo', photoSchema);

// //My hifive model
// var photoSchema = new Schema({

// 	person1:  String,
// 	person2:  String, 
// 	urltitle : String,
// 	image : String,
// 	create :{type : Date, default : Date.now }
// });