# Task Manager API

A RESTful API built with Node.js and Express.js for managing tasks.
Developed as a course project for Advanced Programming (JavaScript).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Storage:** In-memory (no database required)

## Getting Started

### Prerequisites
- Node.js installed on your machine

### Installation

```bash
git clone <your-repo-url>
cd task-manager
npm install
```

### Running the server

```bash
node server.js
```

Server runs on `http://localhost:3000`

---

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks?completed=true` | Filter by completion status |
| GET | `/tasks?priority=high` | Filter by priority |
| GET | `/tasks/stats` | Get task statistics |
| GET | `/tasks/:id` | Get a single task |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| PATCH | `/tasks/:id/complete` | Mark a task as complete |
| DELETE | `/tasks/:id` | Delete a task |
| POST | `/tasks/:id/attachment` | Upload a PDF to a task (max 2MB) |

---

## Request & Response Examples

### Create a Task
**POST** `/tasks`
```json
{
  "title": "Build the project",
  "description": "Finish the task manager API",
  "priority": "high"
}
```
**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": 1746519600000,
    "title": "Build the project",
    "description": "Finish the task manager API",
    "priority": "high",
    "completed": false,
    "createdAt": "2026-05-06T10:00:00.000Z"
  }
}
```

### Get Stats
**GET** `/tasks/stats`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "completed": 1,
    "pending": 2,
    "byPriority": {
      "low": 1,
      "medium": 1,
      "high": 1
    }
  }
}
```

### Validation Error
**POST** `/tasks` with missing title

**Response `400`**
```json
{
  "success": false,
  "errors": ["Title is required and must be a non-empty string."]
}
```

---

## Project Structure

```
task-manager/
├── src/
│   ├── models/
│   │   └── Task.js          # Task class (OOP)
│   ├── routes/
│   │   └── tasks.js         # API route handlers
│   ├── middleware/
│   │   └── validate.js      # Input validation middleware
│   └── data/
│       └── store.js         # In-memory data store
├── app.js                   # Express app configuration
├── server.js                # Server entry point
└── package.json
```

## Course Topics Demonstrated

- **Classes & OOP** — `Task` class with constructor and methods
- **Arrays** — `.filter()`, `.find()`, `.findIndex()`, `.push()`, `.splice()`
- **Objects** — request/response structures, in-memory store
- **Control Flow** — validation logic, error handling, middleware
- **Node.js** — module system, `require`, `module.exports`
- **Express.js** — routing, middleware, REST API design