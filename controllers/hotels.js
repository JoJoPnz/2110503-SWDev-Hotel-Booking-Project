const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

//@desc     Get all hotels
//@route    GET /api/v1/hotels
//@access   Public
exports.getHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single hotel
//@route    GET /api/v1/hotels/:id
//@access   Public
exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create a hotel
//@route    POST /api/v1/hotels
//@access   Private
exports.createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    if (err.code && err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This email has already taken" });
    }
  }
};

//@desc     Update single hotel
//@route    PUT /api/v1/hotels/:id
//@access   Private
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single hotel
//@route    DELETE /api/v1/hotels/:id
//@access   Private
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(400).json({ success: false });
    }
    await Booking.deleteMany({ hotel: req.params.id });
    await hotel.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     Get available hotel
//@route    GET /api/v1/hotels/availableHotel
//@access   Private
exports.getAvailableHotel = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({
      unAvailableDates: {
        $not: {
          $elemMatch: {
            $gte: new Date(req.query.checkInDate),
            $lte: new Date(req.query.checkOutDate),
          },
        },
      },
    });

    res.status(200).json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};
