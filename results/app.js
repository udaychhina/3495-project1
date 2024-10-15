const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());

// MongoDB connection details
const mongoUrl = 'mongodb://mongodb:27017';
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology:true }, (err, client) => {
    if (err) throw err;
    db = client.db('analytics_db');
    console.log('Connected to MongoDB');
});

// Serve the index.html file for showing results
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


authenicate = async (username, password) => {
    const authResponse = await axios.post('http://authentication:5000/auth', 
        { username, password });
    return authResponse.data.authenticated;
}


// Route to fetch analytics results (max, min, average) after authentication
app.post('/show_results', async (req, res) => {
    const { username, password } = req.body;

    auth = await authenicate(username, password);
    
    if (auth) {
        try {
            const results = await db.collection('analytics').findOne({});
            if (results) {
                return res.json({
                    max: results.max,
                    min: results.min,
                    avg: results.avg
                });
            } else {
                return res.status(404).send('No analytics data found');
            }
        } catch (error) {
            return res.status(500).send('Error fetching analytics data');
        }
    }
    else {
        return res.status(401).send('Invalid credentials');
    }
});

app.listen(4000, () => {
    console.log('Show Results service running on port 4000');
});