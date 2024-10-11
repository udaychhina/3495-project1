// Simple app to connect to a MySQL database. 
// Serves a simple form to submit data to the database.
// Data is student ID and grade.

const express = require('express');
const mysql = require('mysql');
const http = require('http');

const app = express();
app.use(express.json());

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

app.post('/submit', (req, res) => {
    const grade = req.body.grade;
    const student_name = req.body.student_name;
    // const query = `INSERT INTO grades (studentID, grade) VALUES (${studentID}, ${grade})
    // ON DUPLICATE KEY UPDATE grade=${grade}`;
    // connection.query(query, (err, result) => {
    //     if (err) throw err;
    //     res.send('Data submitted');
    // });
    
    // Ensure the data is properly extracted and validated
    if (!student_name || !grade) {
        return res.status(400).send('Student name and grade are required');
    }
    const query = `INSERT INTO grades (student_name, grade) VALUES (?, ?)`;
    connection.query(query, [student_name, grade], (err, result) => {
        if (err) throw err;
        res.send('Data submitted successfully');
    });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
