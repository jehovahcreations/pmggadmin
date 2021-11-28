var mongoose = require('mongoose');
var Schema = mongoose.Schema;

dataSchema = new Schema({

        name: String,
        vid: String,
        gender: String,
        dob: String,
        data: String,
        sub:Number
    }),
    Data = mongoose.model('Data', dataSchema);

module.exports = Data;