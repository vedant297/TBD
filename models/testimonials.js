const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose

const testimonials = new Schema({
    reviewer: {
        displayName: String
    },
    starRating: String,
    comment: String,
    createTime: Date,
    updateTime: Date,
    name: String
}, { _id: true })

module.exports = mongoose.model('testimonial', testimonials) 