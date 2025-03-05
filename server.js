require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const connectDB = require('./backend/config/db'); // MongoDB connection
const userRoutes = require('./backend/routes/userRoutes'); // User routes

const app = express();
const PORT = process.env.PORT || 5000;

// Debugging: Check if environment variables are loaded
console.log("🔍 Checking MONGO_URI:", process.env.MONGO_URI);
if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

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

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
require('./backend/config/passport')(passport); // Correct Passport initialization

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'backend/views'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('login', { messages: req.flash() });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { messages: req.flash(), user: req.user });
});

app.get('/sip', ensureAuthenticated, (req, res) => {
    res.render('sip', { messages: req.flash() });
});

app.get('/emi', ensureAuthenticated, (req, res) => {
    res.render('emi', { messages: req.flash() });
});

app.get('/investments', ensureAuthenticated, (req, res) => {
    res.render('investments', { messages: req.flash() });
});

app.get('/stocks', ensureAuthenticated, (req, res) => {
    res.render('stocks', { messages: req.flash() });
});

// Mount user routes on the root path so /register works as expected.
app.use('/api/users', userRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please log in to access this page.');
    res.redirect('/');
}
