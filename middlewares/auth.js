import jwt from "jsonwebtoken"
import { catchAsyncError } from "./catchAsyncError.js"
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";



export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) next(new ErrorHandler("isAuthenticated middleware token not found!", 401))//401 means un-Authorized
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById({ _id: data._id });
    next()
}
);


export const AuthorizedAdmin = (req, res, next) => {
    if (req.user.role !== "admin") return next(new ErrorHandler(`${req.user.role} is not allowed to access this resourse`, 403));
    next()
};

export const isAuthorizedSubscriber = (req, res, next) => {
    if (req.user.subscription.status !== "active" && req.user.role !== "admin") { return next(new ErrorHandler("only subscriber can access this  resourse!", 403)); }
    next();
}