// Simple app to connect to a MySQL database. 
// Serves a simple form to submit data to the database.
// Data is student ID and grade.

const express = require('express');
const mysql = require('mysql');
const http = require('http');
const path = require('path');

const app = express();
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


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
    // const grade = req.body.grade;
    // const student_name = req.body.student_name;

    const { student_name, grade } = req.body;

    // Ensure the data is properly extracted and validated
    if (!student_name || !grade) {
        return res.status(400).send('Student name and grade are required');
    }
    const query = `INSERT INTO grades (student_name, grade) VALUES (?, ?) ON DUPLICATE KEY UPDATE grade = ?`;
    connection.query(query, [student_name, grade, grade], (err, result) => {
        if (err) {
            console.error('Error inserting data into the database:', err);
            return res.status(500).send('Database error');
        }

        // Call the analysis service to recalculate and update MongoDB
    const options = {
        hostname: 'analysis',
        port: 6000,
        path: '/calculate',
        method: 'GET'
    };

    const analysisReq = http.request(options, analysisRes => {
        let data = '';
        analysisRes.on('data', chunk => { data += chunk; });
        analysisRes.on('end', () => {
            console.log('Analysis service triggered:', data);
        });
    });

    analysisReq.on('error', (e) => {
        console.error(`Problem with request to analysis service: ${e.message}`);
    });

    analysisReq.end();

        
    res.send('Data submitted successfully');
    });

});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
