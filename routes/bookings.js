const express = require("express");
const {
  getBookings,
  getBooking,
  // addAppointment,
  // updateAppointment,
  // deleteAppointment,
} = require("../controllers/bookings");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getBookings);
// .post(protect, authorize("admin", "user"), addAppointment);
router.route("/:id").get(protect, getBooking);
//   .put(protect, authorize("admin", "user"), updateAppointment)
//   .delete(protect, authorize("admin", "user"), deleteAppointment);

module.exports = router;
