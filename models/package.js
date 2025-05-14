const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PackageSchema = new Schema({
    holidayDestinationID: { type: mongoose.Schema.Types.ObjectId, ref: "holidayphoto" },
    packageType: String,
    price: Number,
    validFromDate: Date,
    validToDate: Date,
    active: Number,
    note: {
        type: [String],
        default: []
    },
    applicableDiscount: Number,
    packageHotelRating: Number,
    hotelInclusion: [
        {
            hotelName: String,
            category: Number,
            location: String,
            noOfDays: Number
        }
    ]
});

module.exports = mongoose.model('package', PackageSchema);