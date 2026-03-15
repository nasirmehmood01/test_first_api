require("dotenv").config();

const express = require("express");
const multer = require("multer");
const uploadToS3 = require("./uploadToS3");

const app = express();
const upload = multer();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("My first AWS Node API is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* NEW ROUTE */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const result = await uploadToS3(req.file);

    res.json({
      success: true,
      message: "File uploaded to S3",
      data: result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message
    });

  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
