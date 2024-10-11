const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const path = require('path');

const app = express();
app.use(express.json());

// MongoDB connection details
const mongoUrl = 'mongodb://mongodb:27017';
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    db = client.db('analytics_db');
    console.log('Connected to MongoDB');
});

// Serve the index.html file for showing results
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to fetch analytics results (max, min, average) after authentication
app.post('/show_results', (req, res) => {
    const { username, password } = req.body;

    // Authentication request
    const options = {
        hostname: 'authentication_service',
        port: 5000,
        path: '/auth',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const authReq = http.request(options, authRes => {
        let data = '';

        authRes.on('data', chunk => {
            data += chunk;
        });

        authRes.on('end', async () => {
            const authResponse = JSON.parse(data);
            if (authResponse.authenticated) {
                // Fetch analytics from MongoDB
                try {
                    const results = await db.collection('analytics').findOne({});
                    if (results) {
                        res.json({
                            max: results.max,
                            min: results.min,
                            avg: results.avg
                        });
                    } else {
                        res.status(404).send('No analytics data found');
                    }
                } catch (error) {
                    res.status(500).send('Error fetching analytics data');
                }
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    });

    authReq.on('error', error => {
        console.error(`Error: ${error.message}`);
        res.status(500).send('Error authenticating user');
    });

    const postData = JSON.stringify({ username, password });
    authReq.write(postData);
    authReq.end();
});

app.listen(4000, () => {
    console.log('Show Results service running on port 4000');
});