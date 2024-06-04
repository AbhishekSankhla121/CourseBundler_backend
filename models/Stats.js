import mongoose from "mongoose";
const { Schema } = mongoose;

const stats = new Schema({
    users: {
        type: Number,
        default: 0,
    },
    subscriptions: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Stats = mongoose.model("Stats", stats);