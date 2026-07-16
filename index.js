require("dotenv").config();

const express = require("express");
const multer = require("multer");
const uploadToS3 = require("./uploadToS3");
const db = require("./db");

const app = express();
const upload = multer();

app.use(express.json());

/* =========================
   TEST DB CONNECTION
========================= */
async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    console.log("Connected to RDS MySQL!");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
}

testDbConnection();

/* =========================
   BASIC ROUTES
========================= */
app.get("/", (req, res) => {
  console.log("Running default url");
  res.send("My first AWS Node API is running 🚀");
});

app.get("/health", (req, res) => {
  console.log("Running Health url");
  res.json({ ok: true });
});

/* =========================
   S3 UPLOAD ROUTE
========================= */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("Running upload url");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await uploadToS3(req.file);

    res.json({
      success: true,
      message: "File uploaded to S3",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
});

/* =========================
   DATABASE ROUTES
========================= */

/* POST user */
app.post("/users", async (req, res) => {
  try {
    console.log("Running POST /users");

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("POST /users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

/* GET all users */
app.get("/users", async (req, res) => {
  try {
    console.log("Running GET /users");

    const [rows] = await db.execute(
      "SELECT id, name, email, created_at FROM users ORDER BY id DESC"
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("GET /users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
