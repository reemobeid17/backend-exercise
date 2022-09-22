import express from "express";
import mongoose from "mongoose";

import redisClient from "./redis/redisClient";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
  }
};

connectDB();

(async () => {
  await redisClient.connect();
})();

redisClient.on("connect", () => {
  console.log("Connected to Redis...");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
