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
      res.json({ success: false, message: "User exists" });
    }
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "enter a valid email" });
    }
    if (password.length < 6) {
      res.json({ success: false, message: "enter a strong password" });
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
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body

        const user=await userModel.findOne({email})

        if(!user){
            res.json({success:false,message:"User Doesnt exist"})
        }

        const isMatch=await bcrypt.compare(password,user.password)

        if(!isMatch){
            res.json({success:false,message:"invalid cred"})
        }

        const token=createToken(user._id)
        res.json({success:true,token})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

export { registerUser,loginUser };
