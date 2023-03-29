const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please add a name"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      require: [true, "Please add an address"],
    },
    telNo: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please add a valid email",
      ],
    },
    unAvailableDates:{
      type: [String],
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

HotelSchema.pre('remove', async function(next){
  // console.log(`Appointment being removed from hospital ${this._id}`);
  // await this.model('Appointment').deleteMany({hospital:this._id});
  next();
})

module.exports = mongoose.model("Hotel", HotelSchema);
