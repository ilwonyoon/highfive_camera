var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gifSchema = new Schema({
	index :Number,
	firstName     : String,
    last_name   : String,
    phoneNumber : Number,
    urltitle  : String,
    image : String,
    created : { type: Date, default: Date.now }
});

// export Page model
module.exports = mongoose.model('Gif',gifSchema);
