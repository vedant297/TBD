const mongoose = require('mongoose') 
const Schema = mongoose.Schema 

const StaticmasterSchema = new Schema({
    static_type: String, 
    static_description: String, 
    seq_no: Number 
})

module.exports = mongoose.model('Staticmaster',StaticmasterSchema) 