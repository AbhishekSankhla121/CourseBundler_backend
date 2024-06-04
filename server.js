import app from "./app.js";
import connectDB from "./config/Database.js";
import cloudinary from "cloudinary"
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from "./models/Stats.js";
import { User } from "./models/User.js";
connectDB();

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
});

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET
});

// Schedule the job to run at midnight on the 1st of every month
nodeCron.schedule("0 0 0 1 * *", async () => { // second mintue hour day month year
    try {
        const stats = await Stats.create({});// Create a new Stats document with default values





    } catch (error) {
        console.log("error", error)
    }
});



app.listen(process.env.PORT, () => {
    console.log(`listen port at : http://localhost:${process.env.PORT}`)
});
