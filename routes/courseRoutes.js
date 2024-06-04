import express from "express";
const router = express.Router();
import { getAllCourses, createCourse, getCourseLectures, addLecture, deleteCourse, deleteLecture } from '../controllers/courseController.js'
import singleUpload from "../middlewares/multer.js";
import { AuthorizedAdmin, isAuthenticated, isAuthorizedSubscriber } from "../middlewares/auth.js";

//get All course without lecture
router.route("/courses").get(getAllCourses);

// create a new course - only admin
router.route("/createcourse").post(isAuthenticated, AuthorizedAdmin, singleUpload, createCourse)
//add lecture , delete course,get course detail,
router.route("/course/:id").get(isAuthenticated, isAuthorizedSubscriber, getCourseLectures).post(isAuthenticated, AuthorizedAdmin, singleUpload, addLecture).delete(isAuthenticated, AuthorizedAdmin, deleteCourse);
//delete lecture
router.route("/deleteLecture").delete(isAuthenticated, AuthorizedAdmin, deleteLecture)
export default router;