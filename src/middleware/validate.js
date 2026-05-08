function validateTask(req, res, next) {
    const { title, description, priority } = req.body;
    const errors = [];

    if (!title || typeof title !== "string" || title.trim() === "") {
        errors.push("Title is required and must be a non-empty string.");
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
        errors.push("Description is required and must be a non-empty string.");
    }

    const allowedPriorities = ["low", "medium", "high"];
    if (priority && !allowedPriorities.includes(priority)) {
        errors.push(`Priority must be one of: ${allowedPriorities.join(", ")}.`);
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}

function validateTaskUpdate(req, res, next) {
    const { title, description, priority } = req.body;
    const errors = [];

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
        errors.push("Title must be a non-empty string.");
    }

    if (description !== undefined && (typeof description !== "string" || description.trim() === "")) {
        errors.push("Description must be a non-empty string.");
    }

    const allowedPriorities = ["low", "medium", "high"];
    if (priority && !allowedPriorities.includes(priority)) {
        errors.push(`Priority must be one of: ${allowedPriorities.join(", ")}.`);
    }

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    next();
}

module.exports = { validateTask, validateTaskUpdate };