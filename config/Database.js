import mongoose from "mongoose";


const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MOGO_URI);
        console.log(`MongoDB connected with`, connection.host);
    } catch (error) {
        console.log(`error in connection in database`, error);
    }
}

export default connectDB;