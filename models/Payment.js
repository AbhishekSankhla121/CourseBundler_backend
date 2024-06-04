import mongoose from "mongoose";
const { Schema } = mongoose;

const payment = new Schema({
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    razorpay_subscription_id: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Payment = mongoose.model("Payment", payment);