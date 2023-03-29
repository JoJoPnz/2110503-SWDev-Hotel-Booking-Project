const Hotel = require('../models/Hotel');

//@desc     Get all hotels
//@route    GET /api/v1/hotels
//@access   Public
exports.getHotels = async (req, res, next) => {
  res.status(200).json({ success: true, msg:"show all hotels"});
}

//@desc     Get single hotel
//@route    GET /api/v1/hotels/:id
//@access   Public
exports.getHotel = async (req, res, next) => {
  res.status(200).json({ success: true, msg:`show hotel ${req.params.id}`});
}

//@desc     Create a hotel
//@route    POST /api/v1/hotels
//@access   Private
exports.createHotel = async (req, res, next) => {
  res.status(200).json({ success: true });
}

//@desc     Update single hotel
//@route    PUT /api/v1/hotels/:id
//@access   Private
exports.updateHotel = async (req, res, next) => {
  res.status(200).json({ success: true });
}

//@desc     Delete single hotel
//@route    DELETE /api/v1/hotels/:id
//@access   Private
exports.deleteHotel = async (req, res, next) => {
  res.status(200).json({ success: true });
}