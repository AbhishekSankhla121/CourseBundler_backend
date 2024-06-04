import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import crypto from "crypto";


const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        validate: validator.isEmail,
    },
    password: {
        type: String,
        required: [true, "please Enter your password"],
        minLength: [6, "Password must be atleast 6 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    subscription: {
        id: String,
        status: String,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    playlist: [
        {
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
            poster: String,
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: String,


});
schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()//This check is beneficial because you typically only want to hash the password when it's being set for the first time or being changed. If the password hasn't changed, there's no need to re-hash it, saving processing time and unnecessary operations.
    const hashedPassword = await bcrypt.hash(this.password, 10);//10 is for gen salt
    this.password = hashedPassword;
    next()
})
schema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "15d" });
}

schema.methods.comparePassword = async function (password) {
    console.log(this.password)
    return await bcrypt.compare(password, this.password)
}

schema.methods.getResetToken = async function () {
    // Create a random token using crypto.randomBytes, then convert it to a hexadecimal string
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the resetToken using SHA-256 and set it to the resetPasswordToken field of the schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set the expiration time for the reset token to 15 minutes from the current time
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    // Return the plain reset token (not the hashed version), so we can verify later 
    return resetToken;
}


export const User = mongoose.model("User", schema) 