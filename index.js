const express = require('express');
const mysql = require('mysql2');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./fullchain.pem'),
};
const allowedOrigins = [
    "http://10.4.2.1:5173",
    "http://localhost:5173",
    "http://192.168.16.1:5173",
    "http://192.168.8.133:5173",
    "https://scc.elixircraft.net",
    "http://scc.elixircraft.net",
    "http://139.162.47.106:80",
    "http://139.162.47.106:443",
    "https://139.162.47.106:80",
    "https://139.162.47.106:443",
    "http://139.162.47.106",
    "https://139.162.47.106",
    "http://localhost",
    "http://localhost:80",
    "http://localhost:443",
    "http://localhost:4173",
    "https://scc.elixircraft.net/",
    "http://scc.elixircraft.net/",
    "*",
  ];

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, origin);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
}));

app.use(session({
    secret: 'authToken',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error('[ERROR] Failed to connect to the database:', err);
        process.exit(1);
    } else {
        console.log('[INFO] Connected to the MySQL database');
    }
});

// User Signup
app.post('/api/auth/signup', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const userRole = role === 'admin' ? 'admin' : 'user';

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking user' });
        if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = bcryptjs.hashSync(password, 10);
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, userRole], (err) => {
            if (err) return res.status(500).json({ message: 'Error creating user' });
            res.status(201).json({ message: 'User created successfully' });
        });
    });
});

// User Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking user' });
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];
        const isPasswordCorrect = bcryptjs.compareSync(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid password' });

        req.session.user = { username: user.username, role: user.role };
        res.status(200).json({ message: 'Login successful', role: user.role });
    });
});

// Middleware for Admin Authentication
const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Update Score (Admin Only)
app.post('/api/scores', isAdmin, (req, res) => {
    const { house, score } = req.body;
    if (!house || score === undefined) return res.status(400).json({ message: 'House and score are required' });

    db.query('UPDATE scores SET score = ? WHERE house = ?', [score, house], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating score' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'House not found' });
        res.status(200).json({ message: 'Score updated successfully' });
    });
});

// Get Scores (Everyone)
app.get('/api/scores', (req, res) => {
    db.query('SELECT * FROM scores', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching scores' });
        res.status(200).json(results);
    });
});

// Create Event (Admin Only)
app.post('/api/events', isAdmin, (req, res) => {
    const { name, date, description } = req.body;
    if (!name || !date || !description) return res.status(400).json({ message: 'Event name, date, and description are required' });

    db.query('INSERT INTO events (name, date, description) VALUES (?, ?, ?)', [name, date, description], (err) => {
        if (err) return res.status(500).json({ message: 'Error creating event' });
        res.status(201).json({ message: 'Event created successfully' });
    });
});

// Update Event (Admin Only)
app.put('/api/events', isAdmin, (req, res) => {
    const { id, name, date, description } = req.body;
    if (!id || !name || !date || !description) return res.status(400).json({ message: 'Event ID, name, date, and description are required' });

    db.query('UPDATE events SET name = ?, date = ?, description = ? WHERE id = ?', [name, date, description, id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error updating event' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event updated successfully' });
    });
});

// Delete Event (Admin Only)
app.delete('/api/events/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM events WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting event' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    });
});

// Get Events (Everyone)
app.get('/api/events', (req, res) => {
    db.query('SELECT * FROM events', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching events' });
        res.status(200).json(results);
    });
});

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`[INFO] Server running on port ${PORT}`);
// });
https.createServer(options, app).listen(5000, () => {
   console.log('[INFO] HTTPS server running on port 5000');
});
