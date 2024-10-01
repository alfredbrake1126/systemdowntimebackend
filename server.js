const express = require('express');
const mysql = require('mysql2'); // Use mysql2 instead of mysql
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(bodyParser.json()); // For parsing application/json

let isDbConnected = false; // Track if the DB connection is successful

// MySQL connection using mysql2 and environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    isDbConnected = false; // Mark connection as failed
  } else {
    console.log('MySQL Connected...');
    isDbConnected = true; // Mark connection as successful
  }
});

// Serve the static files from the React app
// app.use(express.static(path.join(__dirname, 'client/build')));

// API route to receive form data and insert into the database
app.post('/api/save-data', (req, res) => {
  const { employees, salary, email, daysDown, billingType, rate, sum } = req.body;

  if (!isDbConnected) {
    console.warn('Database not connected. Skipping save operation.');
    return res.status(200).send({
      message: 'Database not connected. Data was not saved, but the request was received.'
    });
  }

  const sql = `INSERT INTO downtime (employees, salary, email, daysDown, billingType, rate, sum) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [employees, salary, email, daysDown, billingType, rate, sum], (err, result) => {
    if (err) {
      console.error('Error saving data:', err);
      return res.status(500).send('Server Error');
    }
    res.status(200).send({ message: 'Data saved successfully' });
  });
});

// The "catchall" handler: for any request that doesn't match one above, send back the React app.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
