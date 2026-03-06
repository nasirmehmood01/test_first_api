const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("My first AWS Node API is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
