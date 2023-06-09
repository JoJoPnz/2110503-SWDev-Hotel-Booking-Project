const express = require("express");
const router = express.Router();
const {
  getHotel,
  getHotels,
  deleteHotel,
  createHotel,
  updateHotel,
  getAvailableHotel,
} = require("../controllers/hotels");

//Include other resource routers
// const appointmentRouter = require('./appointments')

const { protect, authorize } = require("../middleware/auth");

//Re-route into other resource routers
// router.use('/:hospitalId/appointments/',appointmentRouter);

router.route("/").get(getHotels).post(protect, authorize("admin"), createHotel);
router
  .route("/:id")
  .get(getHotel)
  .put(protect, authorize("admin"), updateHotel)
  .delete(protect, authorize("admin"), deleteHotel);
router.route("/available/hotel").get(protect, getAvailableHotel);

module.exports = router;
