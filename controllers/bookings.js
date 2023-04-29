const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");
const {
  sendEmail,
  convertDateToString,
  validateBookingPeriod,
} = require("../services/bookings");
const dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "../config/config.env" });

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "hotel",
      select: "name address telNo email",
    });

    // if there is no booking, return 404
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;

  // General users can see only their bookings!
  if (req.user.role !== "admin") {
    query = Booking.find({
      user: req.user.id,
    }).populate({
      path: "hotel",
      select: "name address telNo email",
    });
  } else {
    // If you are an admin, you can see all bookings!
    query = Booking.find().populate({
      path: "hotel",
      select: "name address telNo email",
    });
  }
  try {
    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Bookings" });
  }
};

//@desc     Add booking
//@route    POST /api/v1/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.body.hotel);

    // If hotel not found, return 404
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${req.body.hotel}`,
      });
    }

    // Add user Id to req.body
    req.body.user = req.user.id;

    // Get check in, check out date from body
    const checkInDate = new Date(req.body.checkInDate);
    const checkOutDate = new Date(req.body.checkOutDate);

    // Validate booking period
    const validateResult = validateBookingPeriod(
      hotel,
      checkInDate,
      checkOutDate,
      req
    );
    if (validateResult.error) {
      return res
        .status(validateResult.status)
        .json({ success: false, message: validateResult.message });
    }

    // Create booking
    const booking = await Booking.create(req.body);

    // Send Email
    const hotelEmail = hotel.email;
    const subject = "New Booking Notification";
    const text = `User information:
    \nName: ${req.user.name}
    \nTel: ${req.user.telNo}
    \nEmail: ${req.user.email}
    \n\nBooking information:
    \nCheck in date: ${convertDateToString(checkInDate)}
    \nCheck out date: ${convertDateToString(checkOutDate)}`;
    sendEmail(hotelEmail, subject, text);

    // No error, return success 200
    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};

//@desc     Update bookings
//@route    PUT /api/v1/bookings
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    // if there is no booking, return 404
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`,
      });
    }

    const hotel = await Hotel.findById(
      req.body.hotel ? req.body.hotel : booking.hotel
    );

    // If hotel not found, return 404
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${req.body.hotel}`,
      });
    }

    // Get check in, check out date from req.body or booking
    const checkInDate = new Date(
      req.body.checkInDate ? req.body.checkInDate : booking.checkInDate
    );
    const checkOutDate = new Date(
      req.body.checkOutDate ? req.body.checkOutDate : booking.checkOutDate
    );

    // Validate booking period
    const validateResult = validateBookingPeriod(
      hotel,
      checkInDate,
      checkOutDate,
      req
    );
    if (validateResult.error) {
      return res
        .status(validateResult.status)
        .json({ success: false, message: validateResult.message });
    }

    //Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Send Email
    const hotelEmail = hotel.email;
    const subject = "Update Booking Notification";
    const text = `User information:
    \nName: ${req.user.name}
    \nTel: ${req.user.telNo}
    \nEmail: ${req.user.email}
    \n\nBooking information:
    \nCheck in date: ${convertDateToString(checkInDate)}
    \nCheck out date: ${convertDateToString(checkOutDate)}`;
    sendEmail(hotelEmail, subject, text);

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};

//@desc     Delete bookings
//@route    DELETE /api/v1/bookings
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    // if there is no booking, return 404
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the booking owner
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`,
      });
    }

    const hotel = await Hotel.findById(booking.hotel);

    // If hotel not found, return 404
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${req.body.hotel}`,
      });
    }

    // Get check in, check out date from req.body or booking
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    //Delete booking
    await Booking.findByIdAndDelete(req.params.id);

    // Send Email
    const hotelEmail = hotel.email;
    const subject = "Cancel Booking Notification";
    const text = `User information:
    \nName: ${req.user.name}
    \nTel: ${req.user.telNo}
    \nEmail: ${req.user.email}
    \n\nBooking information:
    \nCheck in date: ${convertDateToString(checkInDate)}
    \nCheck out date: ${convertDateToString(checkOutDate)}`;
    sendEmail(hotelEmail, subject, text);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};
