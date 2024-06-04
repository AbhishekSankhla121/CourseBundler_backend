import express from "express";
const router = express.Router();

import {
    addtoplaylist
    , changePassword
    , deleteMyProfile
    , deleteUser
    , forgetpassword
    , getAllUsers
    , getMyProfile
    , login
    , logout
    , register
    , removefromplaylist
    , resetpassword
    , updateProfile
    , updateUserRole
    , updateprofilepicture
} from '../controllers/userController.js'

import { AuthorizedAdmin, isAuthenticated } from "../middlewares/auth.js"
import singleUpload from "../middlewares/multer.js";
// to register a new user
router.route("/register").post(singleUpload, register);


// user route start here
//login
router.route("/login").post(login);
//logout
router.route("/logout").get(logout);
//get my profile
router.route("/me").get(isAuthenticated, getMyProfile).delete(isAuthenticated, deleteMyProfile);
//change password
router.route("/changePassword").put(isAuthenticated, changePassword);
//update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);
//update profile picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateprofilepicture);
//forgetpassword
router.route("/forgetpassword").post(forgetpassword);
//reset password
router.route("/resetpassword/:token").put(resetpassword);
//add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addtoplaylist);
//remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated, removefromplaylist);
// user routes end here


// Admin routes start here 
router.route("/admin/users").get(isAuthenticated, AuthorizedAdmin, getAllUsers);
router.route("/admin/user/:id").put(isAuthenticated, AuthorizedAdmin, updateUserRole).delete(isAuthenticated, AuthorizedAdmin, deleteUser);


export default router;  