const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose 

const blogSchema = new Schema({
    createdate: Date,
    title: String, 
    tag: [String], 
    shortdescription: String, 
    longdescription: String, 
    images: [String], 
    mainimage: String 
}, { _id: true }) 

module.exports = mongoose.model('blog', blogSchema) 