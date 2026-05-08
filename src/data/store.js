const Task = require("../models/Task");

const tasks = [];

function getAllTasks() {
    return tasks;
}

function getTaskById(id) {
    return tasks.find(task => task.id === id);
}

function addTask(title, description, priority) {
    const task = new Task(title, description, priority);
    tasks.push(task);
    return task;
}

function updateTask(id, fields) {
    const task = getTaskById(id);
    if (!task) return null;
    task.update(fields);
    return task;
}

function deleteTask(id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
}

function getStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const byPriority = {
        low: tasks.filter(t => t.priority === "low").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        high: tasks.filter(t => t.priority === "high").length,
    };
    return { total, completed, pending: total - completed, byPriority };
}

module.exports = { getAllTasks, getTaskById, addTask, updateTask, deleteTask, getStats };