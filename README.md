# Task Manager

A full-stack task management application built with Node.js and Express.js. Features a RESTful API backend with an in-browser frontend UI, supporting full CRUD operations and PDF attachments.

Developed as a course project for Advanced Programming (JavaScript).

---

## Features

- Full CRUD operations on tasks
- Filter tasks by completion status and/or priority
- Mark tasks as complete
- Aggregate task statistics (total, completed, pending, by priority)
- Upload PDF attachments to tasks (max 2MB, stored on disk)
- Centralized input validation middleware
- Centralized error handling (validation, 404, Multer errors)
- Serves a static frontend UI from the `public/` directory

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 18 |
| Framework | Express.js 5.2.1 |
| File Uploads | Multer 2.1.1 |
| Frontend | Vanilla HTML / CSS / JS |
| Storage | In-memory array (no database) |
| Module System | CommonJS (`require` / `module.exports`) |

---

## Project Structure

```
task-manager/
├── public/                      # Static frontend (served by Express)
│   ├── index.html               # Main UI page
│   ├── app.js                   # Frontend JS (fetch-based API client)
│   └── style.css                # Stylesheet
├── src/
│   ├── data/
│   │   └── store.js             # In-memory task store (CRUD + stats)
│   ├── middleware/
│   │   ├── upload.js            # Multer configuration (PDF, 2MB limit)
│   │   └── validate.js          # Input validation middleware
│   ├── models/
│   │   └── Task.js              # Task class (OOP model)
│   └── routes/
│       └── tasks.js             # All /tasks route handlers
├── uploads/                     # Uploaded PDF files (git-ignored)
├── app.js                       # Express app setup and middleware wiring
├── server.js                    # HTTP server entry point (port 3000)
├── package.json
├── package-lock.json
└── test.http                    # HTTP request test suite
```

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm (bundled with Node.js)

### Installation

```bash
git clone <your-repo-url>
cd task-manager
npm install
```

### Running the Server

```bash
node server.js
```

The server starts on `http://localhost:3000`.

- **Frontend UI:** `http://localhost:3000/`
- **API base:** `http://localhost:3000/tasks`

---

## Architecture

### Entry Points

**`server.js`** imports the Express app and binds it to port 3000.

**`app.js`** configures Express: JSON body parsing, static file serving from `public/`, mounts the `/tasks` router, and registers a catch-all 404 handler. Also ensures the `uploads/` directory exists on startup.

### Data Layer

**`src/data/store.js`** holds an in-memory `tasks` array and exposes the following functions:

| Function | Description |
|---|---|
| `getAllTasks()` | Returns the full tasks array |
| `getTaskById(id)` | Finds a task by numeric ID |
| `addTask(title, description, priority)` | Creates and stores a new Task |
| `updateTask(id, fields)` | Applies a partial update to a task |
| `deleteTask(id)` | Removes a task by index |
| `getStats()` | Returns total, completed, pending, and byPriority counts |

All data is lost on server restart — there is no persistence layer.

### Model

**`src/models/Task.js`** defines the `Task` class. Each instance has the following shape:

```js
{
  id: Number,          // Date.now() at creation time
  title: String,
  description: String,
  priority: String,    // "low" | "medium" | "high"  (default: "medium")
  completed: Boolean,  // default: false
  createdAt: String,   // ISO 8601 timestamp
  attachment: Object   // optional — added on PDF upload
}
```

Methods:
- `complete()` — sets `completed` to `true`
- `update(fields)` — applies partial updates for `title`, `description`, and `priority`
- `toJSON()` — returns a plain object copy of the instance

### Middleware

**`src/middleware/validate.js`** exports two middleware functions:

- `validateTask` — used on `POST /tasks`. Requires `title` and `description` as non-empty strings. Validates `priority` if provided.
- `validateTaskUpdate` — used on `PUT /tasks/:id`. All fields are optional but must pass type/value checks if present.

**`src/middleware/upload.js`** configures Multer with:
- Disk storage, writing files to `uploads/`
- Randomised filenames (`Date.now() + random integer + original extension`)
- A file filter that rejects anything that is not `application/pdf`
- A 2MB file size limit

### Routing

All task routes are defined in **`src/routes/tasks.js`** and mounted at `/tasks` in `app.js`. A route-level error handler catches Multer errors (oversized files, wrong file type) and returns a structured JSON error response.

### Frontend

The `public/` directory contains a self-contained browser client:

- **`index.html`** — Layout with a task creation form, priority and completion filters, a task card grid, an edit modal, and a toast notification element.
- **`app.js`** — Uses the Fetch API to communicate with the backend. Manages local state, renders task cards dynamically, and handles all user interactions (create, edit, complete, delete, upload).
- **`style.css`** — Responsive design using CSS custom properties, a CSS Grid task layout, and a mobile breakpoint at 768px.

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Get all tasks |
| `GET` | `/tasks?completed=true` | Filter by completion status |
| `GET` | `/tasks?priority=high` | Filter by priority |
| `GET` | `/tasks/stats` | Get task statistics |
| `GET` | `/tasks/:id` | Get a single task by ID |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update a task (partial update supported) |
| `PATCH` | `/tasks/:id/complete` | Mark a task as complete |
| `DELETE` | `/tasks/:id` | Delete a task |
| `POST` | `/tasks/:id/attachment` | Upload a PDF attachment |

Task IDs are `Date.now()` integers (millisecond timestamps). The `completed` and `priority` query parameters can be combined freely.

### Response Envelope

All responses use a consistent JSON envelope:

```json
{ "success": true, "data": { } }
{ "success": false, "message": "..." }
{ "success": false, "errors": ["..."] }
```

### Create a Task

**`POST /tasks`**

```json
{
  "title": "Build the project",
  "description": "Finish the task manager API",
  "priority": "high"
}
```

`priority` is optional and defaults to `"medium"`. Allowed values: `"low"`, `"medium"`, `"high"`.

**Response `201`:**

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

### Get All Tasks

**`GET /tasks`**

**Response `200`:**

```json
{
  "success": true,
  "count": 2,
  "data": [ { }, { } ]
}
```

### Get Stats

**`GET /tasks/stats`**

**Response `200`:**

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

### Upload Attachment

**`POST /tasks/:id/attachment`**

- Content-Type: `multipart/form-data`
- Form field name: `file`
- Allowed MIME type: `application/pdf`
- Maximum size: 2MB

On success the task is updated with an `attachment` field:

```json
{
  "filename": "report.pdf",
  "storedAs": "1746519600000-823749234.pdf",
  "size": 102400,
  "uploadedAt": "2026-05-06T10:05:00.000Z"
}
```

### Error Responses

| Status | Scenario |
|---|---|
| `400` | Validation failure, wrong file type, file exceeds 2MB |
| `404` | Task not found |

**Example:**

```json
{
  "success": false,
  "errors": ["Title is required and must be a non-empty string."]
}
```

---

## Testing

A `test.http` file is included with 29 pre-written requests covering all endpoints, including deliberate failure cases (400 and 404). It is compatible with the JetBrains HTTP Client and the VS Code REST Client extension.

To test file upload (request #23), place a `sample.pdf` file in the project root alongside `test.http`.

---

## Notes

- **No persistence** — all task data is stored in memory and cleared on server restart.
- **Uploads are git-ignored** — the `uploads/` directory is excluded from version control via `.gitignore`.
- **One attachment per task** — uploading a new file overwrites the previous `attachment` metadata on the task object. The old file on disk is not deleted automatically.

---

## Course Topics Demonstrated

| Topic | Where |
|---|---|
| Classes & OOP | `Task` class with constructor, `complete()`, `update()`, `toJSON()` |
| Arrays | `.filter()`, `.find()`, `.findIndex()`, `.push()`, `.splice()` in `store.js` |
| Objects | Request/response structures, in-memory store, attachment metadata |
| Control Flow | Validation logic, middleware chaining, conditional error handling |
| Async JS | Fetch API with `async/await` and `try/catch` in the frontend |
| Node.js modules | `require` / `module.exports` throughout, `fs`, `path` |
| Express.js | Routing, middleware, static file serving, REST API design |
| Multer | Multipart file upload, disk storage, file type filtering |