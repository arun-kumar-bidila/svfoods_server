const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper: generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    const newUser = new User({ name, email, password, otp, otpExpiry });
    await newUser.save();

    // Here you can integrate nodemailer or any SMS service to send OTP
    console.log(`OTP for ${email}: ${otp}`);

    res.status(201).json({ message: "User registered. OTP sent for verification." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email with OTP" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetCode = generateOTP();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid 10 min

    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();

    // Normally you'd email/SMS this code, but we'll log it for now
    console.log(`Reset code for ${email}: ${resetCode}`);

    res.json({ message: "Reset code sent to your email (check console for demo)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetCode !== resetCode || user.resetCodeExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login again." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
