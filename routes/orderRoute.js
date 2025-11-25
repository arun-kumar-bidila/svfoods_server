import express from 'express'
import {authMiddleware} from '../middleware/authMiddleware.js';
import { listOrders, placeOrder, updateStatus, userOrders } from '../controllers/orderController.js';
const orderRouter=express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/userorders",authMiddleware,userOrders);
orderRouter.get("/listorders",listOrders);
orderRouter.post("/status",updateStatus);

export default orderRouter;