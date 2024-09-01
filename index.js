const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create and connect to SQLite database
const db = new sqlite3.Database('./school_management.db');

// Create tables if they do not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'teacher')) NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
  )`);
});

// Test route to check server status
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ user: row });
  });
});

// CRUD operations for students
app.post('/api/students', (req, res) => {
  const { name, grade, user_id } = req.body;
  db.run(`INSERT INTO students (name, grade, user_id) VALUES (?, ?, ?)`, [name, grade, user_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/students', (req, res) => {
  db.all(`SELECT * FROM students`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ students: rows });
  });
});

app.delete('/api/students/:id', (req, res) => {
  db.run(`DELETE FROM students WHERE student_id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// CRUD operations for teachers
app.post('/api/teachers', (req, res) => {
  const { name, subject, user_id } = req.body;
  db.run(`INSERT INTO teachers (name, subject, user_id) VALUES (?, ?, ?)`, [name, subject, user_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/api/teachers', (req, res) => {
  db.all(`SELECT * FROM teachers`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ teachers: rows });
  });
});

app.delete('/api/teachers/:id', (req, res) => {
  db.run(`DELETE FROM teachers WHERE teacher_id = ?`, req.params.id, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Start the server
app.listen(5003, () => {
  console.log("Server is running on http://localhost:5003");
});


