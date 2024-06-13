// importing packages start//
import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from './middlewares/Error.js'
import cookieParser from "cookie-parser"
import cors from 'cors'
// importing packages end//

// importing Routes start//
import course from './routes/courseRoutes.js'
import user from './routes/userRoutes.js'
import payments from './routes/paymentRoute.js'
import other from './routes/otherRoutes.js'
// importing Routes end//


config({
    path: "./config/config.env"
});
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);




app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payments);
app.use("/api/v1", other);
app.get("/", (req, res) => {
    res.send(`<h1>Site is Working. <a href=${process.env.FRONTEND_URL}>click here</a> to visit frontend: </h1>`);
})
export default app;



app.use(ErrorMiddleware);
