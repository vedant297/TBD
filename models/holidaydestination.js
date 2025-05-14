const mongoose = require('mongoose')

const { Schema, ObjectId } = mongoose 

const HolidayDestinationSchema = new Schema({
    _id: { type: ObjectId }, 
    locationURL: String,
    location: String,
    country: String,
    packageName: String,
    priceStartsFrom: Number,
    active: { type: Number, default: 1 },
    notes: [String],
    noOfDays: Number,
    tourType: String,
    minimumMemberSize: Number,
    applicableDiscount: {
        amount: Number,
        validTill: Date
    },
    whyChooseUs: [String],
    overview: [String],
    packageInclusions: [String],
    packageExclusions: [String],
    withFlight: Number,
    withHotels: Number,
    tags: [String],
    cities: [{
        cityName: String,
        noOfDays: Number
    }],
    theme: String,
    packagePolicy: [String],
    packageDateChangePolicy: [String],
    hotelInclusion: [{
        hotelName: String,
        category: Number,
        location: String,
        noOfDays: Number
    }],
    photoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "holidayphoto" }],
    itinerary: [
        {
            daynumber: Number, 
            header: String, 
            detail: [String]
        }
    ],
    picture_450_490: { type: mongoose.Schema.Types.ObjectId, ref: "holidayphoto" }
}, { _id: true }) 

module.exports = mongoose.model('holidaydestination', HolidayDestinationSchema) 