const express = require("express");
const router = express.Router();
const store = require("../data/store");
const upload = require("../middleware/upload");
const { validateTask, validateTaskUpdate } = require("../middleware/validate");

// GET /tasks - get all tasks (with optional filtering)
router.get("/", (req, res) => {
    const { completed, priority } = req.query;
    let tasks = store.getAllTasks();

    if (completed !== undefined) {
        const isDone = completed === "true";
        tasks = tasks.filter(t => t.completed === isDone);
    }

    if (priority) {
        tasks = tasks.filter(t => t.priority === priority);
    }

    res.json({ success: true, count: tasks.length, data: tasks });
});

// GET /tasks/stats - get task statistics
router.get("/stats", (req, res) => {
    const stats = store.getStats();
    res.json({ success: true, data: stats });
});

// GET /tasks/:id - get a single task
router.get("/:id", (req, res) => {
    const task = store.getTaskById(Number(req.params.id));
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.json({ success: true, data: task });
});

// POST /tasks - create a new task
router.post("/", validateTask, (req, res) => {
    const { title, description, priority } = req.body;
    const task = store.addTask(title, description, priority);
    res.status(201).json({ success: true, data: task });
});

// PUT /tasks/:id - update a task
router.put("/:id", validateTaskUpdate, (req, res) => {
    const task = store.updateTask(Number(req.params.id), req.body);
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.json({ success: true, data: task });
});

// PATCH /tasks/:id/complete - mark a task as complete
router.patch("/:id/complete", (req, res) => {
    const task = store.getTaskById(Number(req.params.id));
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }
    task.complete();
    res.json({ success: true, data: task });
});

// DELETE /tasks/:id - delete a task
router.delete("/:id", (req, res) => {
    const deleted = store.deleteTask(Number(req.params.id));
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }
    res.json({ success: true, message: "Task deleted successfully." });
});

// POST /tasks/:id/attachment - upload a PDF to a task
router.post("/:id/attachment", upload.single("file"), (req, res) => {
    const task = store.getTaskById(Number(req.params.id));
    if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
    }
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }
    task.attachment = {
        filename: req.file.originalname,
        storedAs: req.file.filename,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
    };
    res.json({ success: true, data: task });
});

// Error handler for multer errors (file too large, wrong type)
router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File exceeds 2MB limit." });
    }
    res.status(400).json({ success: false, message: err.message });
});

module.exports = router;