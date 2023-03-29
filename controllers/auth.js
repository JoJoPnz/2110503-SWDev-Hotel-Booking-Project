const User = require("../models/User");

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
  try {
    const { name, telNo, email, password, role } = req.body;
    //Create user
    const user = await User.create({
      name,
      telNo,
      email,
      password,
      role,
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    // validation error handler
    if (err.name && err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    // duplicate email error handler
    if (err.code && err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "This email has already taken" });
    }
    console.log(err.stack);
    return res.status(400).json({ success: false });
  }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide an email and password" });
  }

  //Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ success: false, msg: "Invalid credentials" });
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, msg: "Invalid credentials" });
  }

  sendTokenResponse(user, 200, res);
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode) /*.cookie("token", token, options)*/
    .json({
      success: true,
      // add for front end
      _id: user._id,
      name: user.name,
      email: user.email,
      // end for front end
      token,
    });
};

//@desc     Get current Logged in user
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};