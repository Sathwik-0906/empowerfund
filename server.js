// --- THIS IS THE CRITICAL FIX ---
// Load and immediately check the environment variables at the very top.
const dotenv = require('dotenv');
dotenv.config();

console.log("--- Server Starting ---");
if (process.env.FMP_API_KEY) {
    console.log("✅ FMP API Key loaded successfully.");
} else {
    console.error("❌ FATAL ERROR: FMP_API_KEY not found in .env file. Please check your configuration.");
    process.exit(1); // Stop the server if the key is missing
}
// ---------------------------------

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const connectDB = require('./backend/config/db');
const userRoutes = require('./backend/routes/userRoutes');
const stockRoutes = require('./backend/routes/stockRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session & Passport Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Passport Config
require('./backend/config/passport')(passport);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'backend/views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('login', { messages: { error: req.flash('error') } });
});

app.get('/register', (req, res) => {
    res.render('register', { messages: { error: req.flash('error') }, user: req.user });
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.get('/sip', ensureAuthenticated, (req, res) => {
    res.render('sip', { user: req.user });
});

app.get('/emi', ensureAuthenticated, (req, res) => {
    res.render('emi', { user: req.user });
});

app.get('/investments', ensureAuthenticated, (req, res) => {
    res.render('investments', { user: req.user });
});

app.get('/stocks', ensureAuthenticated, (req, res) => {
    res.render('stocks', { user: req.user });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/stocks', stockRoutes);

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