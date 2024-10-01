const express = require('express');
const mysql = require('mysql2/promise'); // Use the promise version for async/await support
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Define your API routes
app.get('/api', (req, res) => {
  res.send('API is working!');
});

// API route to receive form data and insert into the database
app.post('/api/save-data', async (req, res) => {
  const { employees, salary, email, daysDown, billingType, rate, sum } = req.body;

  const sql = `INSERT INTO downtime (employees, salary, email, daysDown, billingType, rate, sum) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  try {
    const [result] = await pool.execute(sql, [employees, salary, email, daysDown, billingType, rate, sum]);
    res.status(200).send({ message: 'Data saved successfully', id: result.insertId });
  } catch (err) {
    console.error('Error saving data:', err);
    return res.status(200).send({ message: 'Data not saved successfully' });
  }
});

// Export the app as a serverless function
module.exports = (req, res) => {
  app(req, res);
};
