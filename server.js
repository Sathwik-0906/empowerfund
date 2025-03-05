require('dotenv').config({ path: __dirname + '/.env' }); // Load environment variables first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./config/db'); // Import MongoDB connection

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

// Global Flash Messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// **Remove authentication: Directly show dashboard**
app.get('/', (req, res) => {
    res.render('dashboard', { user: { name: 'Guest' } }); // Always show dashboard
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
