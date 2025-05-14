const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose 

const ContactDetailSchema = new Schema({
    firstname: String,
    lastname: String,
    email: String,
    mobile: String,
    message: String, 
    date: Date 
}, { _id: true }) 

module.exports = mongoose.model('contact_detail', ContactDetailSchema) 