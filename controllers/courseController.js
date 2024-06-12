import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from '../utils/errorHandler.js'
import cloudinary from "cloudinary"


export const getAllCourses = catchAsyncError(async (req, res, next) => {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const courses = await Course.find({
        title: {
            $regex: keyword,
            $options: "i",
        },
        category: {
            $regex: category,
            $options: "i",
        }
    }).select("-lectures");
    res.status(200).json({
        success: true,
        courses,
    })
});


export const createCourse = catchAsyncError(async (req, res, next) => {
    const { title, description, category, createdBy } = req.body;
    const file = req.file;
    const fileUri = getDataUri(file);
    console.log(fileUri);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content)
    if (!title || !description || !category || !createdBy) return next(new ErrorHandler("please Add all fileds", 400));

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });

    res.status(201).json({
        success: "true",
        message: "Course created successfully "
    })
})

export const getCourseLectures = catchAsyncError(async (req, res, next) => {

    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Course not found!", 404));
    course.views += 1;
    await course.save();
    res.status(200).json({
        success: true,
        lectures: course.lectures,
    })
});

export const addLecture = catchAsyncError(async (req, res, next) => {
    const { title, description } = req.body;
    console.log(req.body);
    if (!title || !description) return next(new ErrorHandler("please enter all fields", 400));
    const course = await Course.findById(req.params.id);
    if (!course) return next(new ErrorHandler("Course not Found!", 404));
    const file = req.file
    console.log(file);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "video"
    });


    if (!myCloud) return next(new ErrorHandler("Error in upload video to cloudinary", 400));
    // upload file here using multer 
    course.lectures.push({
        title, description, video: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    })
    course.numOfVideos = course.lectures.length;
    await course.save();
    if (!course) return next(new ErrorHandler("Course not Found !", 404));
    res.status(200).json({
        message: "Lecture Added in Course Successfully!",
        success: true,
    });
});


export const deleteCourse = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return next(new ErrorHandler("course not found", 404));
    await cloudinary.v2.uploader.destroy(course.poster.public_id); // Delete Course Poster from 

    // for Lecture delete from cloudinary we use loop
    for (let i = 0; i < course.lectures.length; i++) {
        const singleLecture = course.lectures[i];
        console.log("singlelecture", singleLecture)
        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
            resource_type: "video"
        });

    }
    await course.deleteOne({ _id: id });
    res.status(200).json({
        message: "Course deleted successfully!",
        success: true
    })
});

export const deleteLecture = catchAsyncError(async (req, res, next) => {
    const { courseId, lectureId } = req.query;
    const course = await Course.findById(courseId);
    const lecture = course.lectures.find((item) => {
        if (item._id.toString() === lectureId.toString()) {
            return item;
        }
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, { resource_type: "video" });



    if (!course) return next(new ErrorHandler("course not  found!!", 404));
    course.lectures = course.lectures.filter(item => {
        if (item._id.toString() !== lectureId.toString()) return item;
    });

    course.numOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({
        message: "course  lecture deleted Successfully!",
        success: true,
    })
});


Course.watch().on('change', async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    const courses = await Course.find({});
    let TotalViews = 0;

    for (let i = 0; i < courses.length; i++) {
        TotalViews += courses[i].views;

    }

    stats[0].views = TotalViews;
    stats[0].createdAt = new Date(Date.now());
    await stats[0].save();

});
