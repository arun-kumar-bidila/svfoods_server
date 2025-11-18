import foodModel from "../models/foodModel.js";

import fs from "fs";

const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;

  const { name, description, price, category } = req.body;
  const food = new foodModel({
    name: name,
    description: description,
    price: price,
    category: category,
    image: image_filename,
  });
  try {
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error)
    res.json({success:false,message:"error"})
  }
};

export { addFood };
