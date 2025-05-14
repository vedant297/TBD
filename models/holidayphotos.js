const mongoose = require('mongoose')

const Schema = mongoose.Schema

const HolidayPhotos = new Schema({
    URL: String,  // Path to the image
    TypeOfPhoto: String , // Example: Sightseeing, Adventure, etc.
    MediaType: String , // Media type restriction
    active: Number, // To track active/inactive status
    note: String 
})

module.exports = mongoose.model('holidayphoto', HolidayPhotos) 