import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js"
export const contact = catchAsyncError(async (req, res, next) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return next(new ErrorHandler("all fileds are required!", 400));
    const to = process.env.MY_MAIL;
    const subject = "Contact from course Bundler";
    const text = `i am ${name} and my email is ${email}. \n${message}`;
    await sendEmail(to, subject, text);
    res.status(200).json({
        message: "Your message has been sent",
        success: true,
    });
});

export const requestCourse = catchAsyncError(async (req, res, next) => {
    const { name, email, course } = req.body;
    if (!name || !email || !message) return next(new ErrorHandler("all fileds are required!", 400));
    const to = process.env.MY_MAIL;
    const subject = "Request for a course on course Bundler";
    const text = `i am ${name} and my email is ${email}. \n${course}`;
    await sendEmail(to, subject, text);
    res.status(200).json({
        message: "Your Request has been sent",
        success: true,
    });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
    // Fetch the latest 12 Stats documents sorted by creation date in descending order
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
    const StatsData = [];

    // Calculate the number of default records needed to make StatsData size 12
    for (let i = 0; i < stats.length; i++) {
        StatsData.unshift(stats[i]);
    };
    const requiredSize = 12 - stats.length;
    // Add default records to the beginning of StatsData
    for (let i = 0; i < requiredSize; i++) {
        StatsData.unshift({
            users: 0,
            subscriptions: 0,
            views: 0,
        });
    };

    // userCount,subscriptioncount,viewsCount extracted from the most recent month 

    const userCount = StatsData[11].users;
    const subscriptionsCount = StatsData[11].subscriptions;
    const viewsCount = StatsData[11].views


    let usersProfit = true, viewsProfit = true, subscriptionsProfit = true;
    let usersPercentage = 0, viewsPercentage = 0, subscriptionsPercentage = 0;

    // If the previous month's data (StatsData[10]) is zero, the percentage change is set to the current count multiplied by 100. This is because dividing by zero is undefined, so we treat any increase from zero as a 100% increase.

    if (StatsData[10].users === 0) usersPercentage = userCount * 100;
    if (StatsData[10].views === 0) viewsPercentage = viewsCount * 100;
    if (StatsData[10].subscriptions === 0) subscriptionsPercentage = subscriptionsCount * 100;

    else {
        /*
         Previous Month (StatsData[10]):
         { users: 80, subscriptions: 40, views: 900 }
         Current Month (StatsData[11]):
         { users: 100, subscriptions: 50, views: 1000 }
         */
        const difference = {
            users: StatsData[11].users - StatsData[10].users, //100 - 80 = 20
            views: StatsData[11].views - StatsData[10].views, //50 - 40 = 10
            subscriptions: StatsData[11].subscriptions - StatsData[10].subscriptions, //1000 - 900 = 100

        }
        usersPercentage = (difference.users / StatsData[10].users) * 100; // (20 / 80) * 100 = 25%   Profit: true (since 25% is positive)
        viewsPercentage = (difference.views / StatsData[10].views) * 100;//(10 / 40) * 100 = 25%  Profit: true (since 25% is positive)
        subscriptionsPercentage = (difference.subscriptions / StatsData[10].subscriptions) * 100;//(100 / 900) * 100 ≈ 11.11%


        if (usersPercentage < 0) usersProfit = false;
        if (viewsPercentage < 0) viewsProfit = false;
        if (subscriptionsPercentage < 0) subscriptionsProfit = false;

    }

    res.status(200).json({
        message: "",
        success: true,
        stats: StatsData,
        userCount,
        subscriptionsCount,
        viewsCount,
        subscriptionsPercentage,
        viewsPercentage,
        usersPercentage,
        subscriptionsProfit,
        viewsProfit,
        usersProfit
    });
});



