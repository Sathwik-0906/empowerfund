const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// ✅ Login route (POST)
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
}));

// ✅ Register route (POST)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'User already exists.');
            return res.redirect('/');
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (err) {
        console.error("⚠️ Error registering user:", err);
        req.flash('error', 'Registration failed.');
        res.redirect('/');
    }
});

// ✅ Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error', 'Logout failed. Please try again.');
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Logged out successfully.');
        res.redirect('/');
    });
});

module.exports = router;
