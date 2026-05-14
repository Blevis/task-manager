const express = require("express");
const taskRoutes = require("./src/routes/tasks");
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/tasks", taskRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

module.exports = app;