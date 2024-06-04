import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../models/Payment.js";

export const buySubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("user not exist!", 404));
    if (user.role === "admin") return next(new ErrorHandler("Admin cant buy subscription", 404));
    const plan_id = process.env.PLAN_ID || "plan_OG01zKAkfAq7Er";


    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    res.status(201).json({
        message: "subscription done successfully!",
        success: true,
        subscriptionId: subscription.id
    })
});

export const paymentVerification = catchAsyncError(async (req, res, next) => {

    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("User not Found!", 404));

    const subscription_id = user.subscription.id;
    const generated_singnature = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET).update(razorpay_payment_id + "|" + subscription_id, "utf-8").digest("hex");
    // Generate a HMAC SHA-256 hash using the Razorpay API secret key
    // - process.env.RAZORPAY_API_SECRET: The secret key from Razorpay stored in environment variables
    // - razorpay_payment_id + "|" + subscription_id: The data to be hashed, which is the concatenation of the payment ID and subscription ID with a "|" separator
    // - "utf-8": The encoding of the input data

    const isPaymentVerified = generated_singnature === razorpay_signature;
    if (!isPaymentVerified) {
        return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
    }

    // if PAYMENT verifed successfully then store to database ;

    await Payment.create({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
    });

    user.subscription.status = "active";
    await user.save();
    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`);
});

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    });
});

export const cancelSubscription = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("User not Found!", 404));
    const subscription_id = user.subscription.id;
    let refund = false;
    await instance.subscriptions.cancel(subscription_id);

    const payment = await Payment.findOne({ razorpay_subscription_id: subscription_id });
    if (!payment) return next(new ErrorHandler("Payment not found!", 404)); // If payment is not found, return an error

    const gap = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
    if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;

    };
    await payment.deleteOne({ razorpay_subscription_id: subscription_id });
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save()
    res.status(200).json({
        message: refund ? "Subscription Cancelled,You will recive full refund within 7 days" : "Subscription Cancelled, now refund initiiateed as subscription was cancelled after 7 days",
        success: refund
    });
});

