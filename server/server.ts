import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();
require('dotenv').config();
// Manually specify the .env path
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ Loaded variables:', Object.keys(result.parsed || {}));
}

// Now check if GROQ_API_KEY is loaded
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

// Rest of your imports
import './backend/aiServices';

import express from "express";
import cors from "cors";
import { generateAIResponse } from "./backend/aiServices";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:8080"],
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// AI chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;
    const response = await generateAIResponse(message, language || "en");
    res.json(response);
  } catch (err) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
