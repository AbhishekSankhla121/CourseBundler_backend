import mongoose from "mongoose";
const course = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please Enter Course Title"],
        minLength: [4, "Title must be atleast 4 Character"],
        maxLength: [80, "Title can't exceed 80 characters"],
    },
    description: {
        type: String,
        required: [true, "please Enter Course Description"],
        minLength: [20, "Description must be atleast 4 Character"],
    },
    lectures: [
        {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            video: {
                public_id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        },
    ],

    poster: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },

    views: {
        type: Number,
        default: 0,
    },
    numOfVideos: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: [true, "Enter Course Creator Name"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },




});

export const Course = mongoose.model("Course", course);