require('dotenv').config({ path: __dirname + '/.env' }); // Load environment variables first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./backend/config/db'); // Updated import path for db.js

const app = express();
const PORT = process.env.PORT || 5000;

// Debugging: Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

console.log("🔍 MONGO_URI:", process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session handling
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));

// Flash messages
app.use(flash());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to EmpowerFund!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});