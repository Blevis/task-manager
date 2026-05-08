const express = require("express");
const taskRoutes = require("./src/routes/tasks");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Task Manager API is running." });
});

app.use("/tasks", taskRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
});

module.exports = app;