const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

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

    // Check check in must be less than check out date
    if (checkInDate.getTime() >= checkOutDate.getTime()) {
      return res.status(400).json({
        success: false,
        message: "Check in date must begin before check out date",
      });
    }

    // Check unavailable dates
    hotel.unAvailableDates.map((unAvailableDate) => {
      unAvailableDate = new Date(unAvailableDate);
      unAvailableDate.setUTCHours(0, 0, 0, 0);
      if (
        checkInDate.getTime() <= unAvailableDate.getTime() &&
        unAvailableDate.getTime() <= checkOutDate.getTime()
      ) {
        return res.status(400).json({
          success: false,
          message: `Your booking range overlap with hotel's unavailable dates: ${unAvailableDate.toLocaleDateString(
            "en-US",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          )}`,
        });
      }
    });

    // If the user is not an admin, they can't book more than 3 nights.
    const upperBoundCheckOutDate = new Date(req.body.checkInDate);
    upperBoundCheckOutDate.setDate(checkInDate.getDate() + 3);
    upperBoundCheckOutDate.setUTCHours(23, 59, 59, 999);
    if (
      req.user.role !== "admin" &&
      checkOutDate.getTime() > upperBoundCheckOutDate.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: `User can't book more than 3 nights`,
      });
    }

    // Create booking
    const booking = await Booking.create(req.body);

    // Send Email

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create Booking" });
  }
};
