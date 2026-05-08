class Task {
    constructor(title, description, priority = "medium") {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.priority = priority;   // "low", "medium", "high"
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }

    complete() {
        this.completed = true;
    }

    update(fields) {
        const allowed = ["title", "description", "priority"];
        for (const key of allowed) {
            if (fields[key] !== undefined) {
                this[key] = fields[key];
            }
        }
    }

    toJSON() {
        return { ...this };
    }
}

module.exports = Task;