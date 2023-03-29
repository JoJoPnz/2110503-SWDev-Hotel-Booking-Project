const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name:{
    type: String,
    require: [true, 'Please add a name'],
    unique: true,
    trim: true,
  },
  address:{
    type: String,
    require: [true, 'Please add an address']
  },
  telNo: {
    type: String
  }
},{
  toJSON: {virtuals:true},
  toObject: {virtuals:true}
})

module.exports = mongoose.model("Hotel", HotelSchema);