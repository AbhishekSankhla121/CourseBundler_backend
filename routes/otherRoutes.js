import express from "express"
import { contact, getDashboardStats, requestCourse } from "../controllers/otherController.js";
import { AuthorizedAdmin, isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

// contact form
router.route("/contact").post(contact);

// Request form
router.route("/courserequest").post(requestCourse);

// get Admin Dashboard Stats
router.route("/admin/stats").get(isAuthenticated, AuthorizedAdmin, getDashboardStats);

export default router;