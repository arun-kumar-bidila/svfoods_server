import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.post("/getcart", authMiddleware, getCart);

export default cartRouter;
