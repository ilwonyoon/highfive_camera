var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photoSchema = new Schema({
	index  : Number, 
    firstName     : String,
    last_name   : String,
    phoneNumber : Number,
    urltitle  : String,
    image : String,
    created : { type: Date, default: Date.now }
});

// export Page model
module.exports = mongoose.model('Photo', photoSchema);
