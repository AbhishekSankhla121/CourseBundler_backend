import express from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import {
    buySubscription
    , cancelSubscription
    , getRazorPayKey
    , paymentVerification
} from "../controllers/paymentController.js";
const router = express.Router();


//buy subscription
router.route("/subscribe").get(isAuthenticated, buySubscription);

// payment Verification  and save reference in database 
router.route("/paymentverification").post(isAuthenticated, paymentVerification);

// get razorpaykey 
router.route("/razorpayKey").get(getRazorPayKey);

// cancel subscription 
router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription)

export default router;