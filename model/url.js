const mongoose = require('mongoose');

const url_scehma = mongoose.Schema({
    original_url : {
        type: String,
        required:true
    },
    short_url: {
        type: Number,
        required: true,
    }
});

const url_model = mongoose.model('url',url_scehma);
 
module.exports = url_model;