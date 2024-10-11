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
    const studentID = req.body.student_name;
    const grade = req.body.grade;
    // const query = `INSERT INTO grades (studentID, grade) VALUES (${studentID}, ${grade})
    // ON DUPLICATE KEY UPDATE grade=${grade}`;
    // connection.query(query, (err, result) => {
    //     if (err) throw err;
    //     res.send('Data submitted');
    // });
    
    // Ensure the data is properly extracted and validated
    if (!studentID || !grade) {
        return res.status(400).send('Student name and grade are required');
    }
    const query = 'INSERT INTO grades (studentID, grade) VALUES (?, ?) ON DUPLICATE KEY UPDATE grade = ?';
    connection.query(query, [studentID, grade, grade], (err, result) => {
        if (err) throw err;
        res.send('Data submitted');
});

});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
