var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var images = new Schema({
                            name : String ,
                            url : String
                        }
                        );
var image = mongoose.model('image', images);

module.exports = image;