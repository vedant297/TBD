const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose 

const SubscriberSchema = new Schema({
    email: String,
    date: Date 
}, { _id: true }) 

module.exports = mongoose.model('subscriber', SubscriberSchema) 