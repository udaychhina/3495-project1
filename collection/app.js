// Simple app to connect to a MySQL database. 
// Serves a simple form to submit data to the database.
// Data is student ID and grade.

const express = require('express');
const mysql = require('mysql');

const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'example',
    database: 'analytics',
    insecureAuth: true
});

connection.connect();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
    const studentID = req.query.student_name;
    const grade = req.query.grade;
    const query = `INSERT INTO grades (studentID, grade) VALUES (${studentID}, ${grade})
    ON DUPLICATE KEY UPDATE grade=${grade}`;
    connection.query(query, (err, result) => {
        if (err) throw err;
        res.send('Data submitted');
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
