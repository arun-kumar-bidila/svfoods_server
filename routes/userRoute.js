import express from "express";

const userRouter = express.Router();
import { loginUser, registerUser ,getUser} from "../controllers/userController.js";

userRouter.post("/register", registerUser);
userRouter.post("/login",loginUser)
userRouter.get("/getdata",getUser);

export default userRouter;
