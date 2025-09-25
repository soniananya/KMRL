const OTP = require("../models/Otp");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const otpgenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already registered"
      });
    }

    let otp;
    let result;
    do {
      otp = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      });
      result = await OTP.findOne({ otp });
    } while (result);

    await OTP.create({ email, otp });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp // Remove this in PROD, only send via email!
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal error sending OTP"
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, department, otp } = req.body;

    if (!name || !email || !password || !confirmPassword || !otp || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (!["admin", "reviewer", "employee", "ai_agent"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists. Please login." });
    }

    const recentOtpDoc = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!recentOtpDoc) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }
    if (otp !== recentOtpDoc.otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    });

    return res.status(201).json({
      success: true,
      user: { ...user.toObject(), password: undefined },
      message: "User created successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error signing up" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email }).populate("profile");
    if (!user)
      return res.status(404).json({ success: false, message: "No user exists with this email" });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches)
      return res.status(400).json({ success: false, message: "Incorrect password" });

    const token = jwt.sign(
      { 
        email: user.email, 
        id: user._id, 
        role: user.role, 
        department: user.department 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }).status(200).json({
      success: true,
      token,
      user,
      message: "User logged in successfully"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal error logging in" });
  }
};