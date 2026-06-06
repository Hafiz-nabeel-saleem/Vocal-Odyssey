const User = require("../models/user");
const Otp = require("../models/otp");
const { generatePasswordRecoveryEmail } = require("../utils/emailTemplates");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "Email address not found." });

    if (user.authProvider === 'google') {
      return res.status(400).json({
        error: 'This email is registered via Google sign-in. Please use Google to login.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET
    );

    user.password = undefined; 
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed. Please try again later." });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "Email is already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "supervisor",
    });

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET
    );

    res.status(201).json({user, token});
  } catch (err) {
    res.status(400).json({ error: "Signup failed. Please try again later." });
  }
};

const googleSignin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user && user.authProvider === 'local') {
      return res.status(400).json({
        error: 'This email is registered with a password. Please use regular login.',
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: 'google',
        role: "supervisor",
      });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Google sign-in failed. Please try again later." });
  }
};

const requestPasswordRecovery = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Email address not found.' });

    if (user.authProvider === 'google') {
      return res.status(400).json({
        error: 'This email is registered via Google sign-in. Password recovery is not available.',
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      email,
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 min
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Vocal Odyssey Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Recovery',
      html: generatePasswordRecoveryEmail(otpCode),
    });

    res.json({ message: 'OTP will be sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request. Please try again later.' });
  }
};

const recoverPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email, code: otp });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Expired OTP.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password. Please try again later.' });
  }
};

module.exports = {
  login,
  signup,
  googleSignin,
  requestPasswordRecovery,
  recoverPassword,
};
