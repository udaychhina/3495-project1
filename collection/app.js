// Simple app to connect to a MySQL database. 
// Serves a simple form to submit data to the database.
// Data is student ID and grade.

const express = require('express');
const mysql = require('mysql');
const http = require('http');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

var authenticated = null;

const connection = mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'example',
    database: 'analytics',
    insecureAuth: true
});

connection.connect(err => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
}
);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const authRes = await axios.post('http://authentication:5000/auth', { username, password });

    if (authRes.data.authenticated) {
        authenticated = true;
        return res.send('Login successful');
    }
    else {
        authenticated = false;
        return res.status(401).send('Login failed');
    }
});

app.post('/submit', (req, res) => {
    // const grade = req.body.grade;
    // const student_name = req.body.student_name;

    const { student_name, grade } = req.body;

    // Ensure the data is properly extracted and validated
    if (!authenticated) {
        return res.status(401).send('Not authenticated');
    }
    else {
        if (!student_name || !grade) {
            return res.status(400).send('Student name and grade are required');
        }
        const query = `INSERT INTO grades (student_name, grade) VALUES (?, ?) ON DUPLICATE KEY UPDATE grade = ?`;
        connection.query(query, [student_name, grade, grade], (err, result) => {
            if (err) {
                console.error('Error inserting data into the database:', err);
                return res.status(500).send('Database error');
            }
        return res.send('Data submitted successfully');
        });
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
