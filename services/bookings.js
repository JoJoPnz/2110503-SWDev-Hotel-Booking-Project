const dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "../config/config.env" });

const nodemailer = require("nodemailer");

exports.sendEmail = (hotelEmail, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.APP_EMAIL_NAME,
      pass: process.env.APP_EMAIL_AUTH_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.APP_EMAIL_NAME,
    to: hotelEmail,
    subject: subject,
    text: text,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

exports.convertDateToString = (date) => {
  date = new Date(date);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

exports.validateBookingPeriod = (hotel, checkInDate, checkOutDate, req) => {
  // 1. Check in date must less than check out date
  if (checkInDate.getTime() >= checkOutDate.getTime()) {
    return {
      error: true,
      status: 400,
      message: "Check in date must begin before check out date",
    };
  }

  // 2. Check unavailable dates of hotel
  const overlappingDate = hotel.unAvailableDates.find((unAvailableDate) => {
    unAvailableDate = new Date(unAvailableDate);
    unAvailableDate.setUTCHours(0, 0, 0, 0);
    if (
      checkInDate.getTime() <= unAvailableDate.getTime() &&
      unAvailableDate.getTime() <= checkOutDate.getTime()
    ) {
      return unAvailableDate; // Stop the loop and return the overlapping date
    }
  });
  console.log(overlappingDate);
  if (overlappingDate) {
    return {
      error: true,
      status: 400,
      message: `Your booking range overlaps with hotel's unavailable dates: ${this.convertDateToString(
        overlappingDate
      )}`,
      overlappingDate: overlappingDate,
    };
  }

  // 3. If the user is not an admin, they can't book more than 3 nights.
  const upperBoundCheckOutDate = new Date(checkInDate);
  upperBoundCheckOutDate.setDate(checkInDate.getDate() + 3);
  upperBoundCheckOutDate.setUTCHours(23, 59, 59, 999);
  if (
    req.user.role !== "admin" &&
    checkOutDate.getTime() > upperBoundCheckOutDate.getTime()
  ) {
    return {
      error: true,
      status: 400,
      message: "User can't book more than 3 nights",
    };
  }

  return {
    error: false,
  };
};
