import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import artworkRouter from "./router/artworkRouter";
import checkoutRouter from "./router/checkoutRouter";
import emailRouter from "./router/emailRouter";
import verifyRouter from "./router/verifyRouter";

dotenv.config();

const app = express();

// ---------------------
// CORS CONFIG (IMPORTANT)
// ---------------------
const allowedOrigins = [
  "http://localhost:5173", // for local dev
  "https://www.samridhistudio.com/",
];


app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ---------------------
// MongoDB Connection (Serverless-friendly)
// ---------------------
let isConnected = false;

async function connectToMongoDB() {
  // Check if already connected
  if (isConnected) {
    console.log("ℹ️  Using existing MongoDB connection");
    return;
  }

  // Check if mongoose is already connecting or connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log("ℹ️  Using existing mongoose connection (readyState: 1)");
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not set");
    throw new Error("MONGO_URI environment variable is not defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    isConnected = false;
    console.error("❌ Error connecting to MongoDB:", error);
    throw error;
  }
}

// Initialize connection on startup (for Railway/long-running servers)
if (process.env.MONGO_URI) {
  connectToMongoDB().catch((err) => {
    console.error("Failed to connect to MongoDB on startup:", err);
  });
} else {
  console.warn("⚠️  MONGO_URI not set — database connection will fail");
}

// ---------------------
// Routes
// ---------------------
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use(artworkRouter);
app.use(checkoutRouter);
app.use(emailRouter);
app.use("/verify", verifyRouter);
app.use("/404", (_req, res) => res.status(404).json({ error: "Not Found" }));

// ---------------------
// Error Handler
// ---------------------
app.use((err: any, _req: Request, res: Response) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ---------------------
// Start Server (Railway)
// ---------------------
const PORT = process.env.PORT || 7001; // Railway provides PORT env

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
