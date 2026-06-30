import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/calculatorHistory";

// allow requests from the Vite dev server and any local frontend
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

mongoose.set("strictQuery", true);

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected:", mongoUri))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // exit if DB is unreachable so we know immediately
  });

// routes
app.use("/api/history", historyRoutes);

// health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Calculator History API is running" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
