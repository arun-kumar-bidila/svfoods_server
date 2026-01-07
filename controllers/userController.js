import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

//create token

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

//register user

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }
    if (password.length < 6) {
      return res.json({ success: false, message: "enter a strong password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();

    const token = createToken(user._id);
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Doesnt exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "invalid cred" });
    }

    const token = createToken(user._id);
    return res.json({ success: true, token, ...user._doc });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const getUser = async (req, res) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: "token is empty" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(token_decode.id);

    if (!user) {
      return res.json({ success: false, message: "user doesn't exist" });
    }

    return res.json({ success: true, token, ...user._doc });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error in getting user" });
  }
};

export { registerUser, loginUser, getUser };
