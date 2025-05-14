const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose 

const news = new Schema({
    Title: String,
    Date: Date,
    Tag: String,
    Detail: String,
    url: String, 
    image: String,
    minutesread: Number, 
    author: String, 
    shortdetail: String, 
    image1: String, 
    image2: String 
}, { _id: true }) 

module.exports = mongoose.model('news', news) 