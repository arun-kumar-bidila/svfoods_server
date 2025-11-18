import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://arunkumarbidila_db_user:Arun5452@cluster0.nlsdv5j.mongodb.net/"
    )
    .then(() => console.log("DB connected successfully"));
};
