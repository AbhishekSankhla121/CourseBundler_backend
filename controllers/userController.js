import { catchAsyncError } from '../middlewares/catchAsyncError.js'
import ErrorHandler from '../utils/errorHandler.js';
import { User } from '../models/User.js'
import { sendToken } from '../utils/sendToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from "crypto";
import { Course } from "../models/Course.js"
import getDataUri from '../utils/dataUri.js';
import cloudinary from "cloudinary";
import { Stats } from '../models/Stats.js';




// User's Controller start from here

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log(name, email, password)
    const file = req.file;

    if (!name || !email || !password || !file) return next(new ErrorHandler("please enter all fileds", 400));

    let user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User Already exist !", 409)); //409 for the request could not be processed because of conflict int request

    // upload file on cloudniry

    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        }
    });

    sendToken(res, user, "Register Successfully!", 201)
});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new ErrorHandler("please enter all filed", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("User not exist!", 401));
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new ErrorHandler("invalid credential in login route", 401));
    sendToken(res, user, `Welcome Back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
    const options = {
        expires: new Date(Date.now()), // Setting expiration date to the past
        httpOnly: true, // Making the cookie accessible only via HTTP(S)
        secure: true, // Uncomment this line for secure cookies (HTTPS only)
        sameSite: "none", // Allowing the cookie to be sent in cross-site requests
    }

    //    clearing the auth-token from cookies
    res.status(200).cookie("token", null, options).json({
        success: true,
        message: "logout successfully"
    })
});


export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    res.status(200).json({ success: true, user })
});


export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) next(new ErrorHandler("password cannot be empty", 400));
    const user = await User.findById({ _id: req.user._id }).select("+password");
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) next(new ErrorHandler("Incorrect Old Password -> changePassword", 400));
    user.password = newPassword;
    await user.save();
    res.status(200).json({
        success: true,
        message: "password changed Successfully!"
    })
});


export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(201).json({
        success: true,
        message: "User profile Updated!",
    })
});

export const updateprofilepicture = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("user not found!", 404));
    // cloudinary todo
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    }
    await user.save()
    res.status(201).json({
        success: true,
        message: 'profile picture updated successfully!'
    })
});

export const forgetpassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("email cannot be empty in forget password", 400))
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User not Found!", 400)); // the status code 400 is used for "bad request"
    const resetToken = await user.getResetToken();
    await user.save();

    // url : http://localhost:3000/resetpassword/resettoken
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    const message = `Click  on the link to reset your password. ${url}. if you have  not request then please ignore`


    // Send token via email 
    await sendEmail(user.email, "Course bundler reset password", message)
    res.status(200).json({
        success: true,
        message: `Reset token has been sent to ${user.email}`
    })
});

export const resetpassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        }
    });
    if (!user) return next(new ErrorHandler("Token is invalid or has been expired", 401)); // the 401 used for unauthrozied person
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    res.status(200).json({
        success: true,
        message: "Password Change successfully!"
    })
});

export const addtoplaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);

    if (!course) return next(new ErrorHandler("invalid course id ", 404)); // the status code 404 means "Not found"
    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })
    if (itemExist) return next(new ErrorHandler("Item already exist", 409)) // the status code 409 means "Confilct"

    user.playlist.push(
        {
            course: course._id,
            poster: course.poster.url
        }
    );
    await user.save();
    res.status(201).json({
        success: true,
        message: "Added to Playlist successfully!!"
    })
})

export const removefromplaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);

    if (!course) return next(new ErrorHandler("invalid course id ", 404)); // the status code 404 means "Not found"
    const newPlaylist = user.playlist.filter((item) => {
        console.log("item.course : ", item.course, "course._id: ", course._id)
        if (item.course.toString() !== course._id.toString()) return item
    })
    user.playlist = newPlaylist
    await user.save();
    res.status(201).json({
        success: true,
        message: "remove from playlist sucessfully!!"
    })
})

// user's controller end here 


// Admin controller start from here
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const user = await User.find();
    if (!user) return next(new ErrorHandler("no user found !", 400));
    res.status(200).json({
        success: true,
        user
    })
});
export const updateUserRole = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("user not found!", 404));
    if (user.role === "user") user.role = "admin";
    else user.role = "user";
    await user.save();
    res.status(200).json({
        success: true,
        message: "User role updated Successfully!",
    })
});
export const deleteUser = catchAsyncError(async (req, res, next) => {
    // TODO Subscribtion cancel
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("user not found !", 404));
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne({ _id: id });
    res.status(200).json({
        message: "User deleted successfully!",
        success: true,
    })
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    if (!user) return next(new ErrorHandler("User not Found!", 404));
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    await user.deleteOne({ "_id": user._id });

    res.status(200).cookie("token", null, { expires: new Date(Date.now()) }).json({
        success: true,
        message: "your account has been deleted now successfully!!"
    });
});
// Admin controller end from here 



User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    stats[0].subscriptions = await User.countDocuments({ "subscription.status": "active" });
    stats[0].users = await User.countDocuments();
    stats[0].createdAt = new Date(Date.now());
    await stats[0].save()

}); // it check  real time data and make the function call 
