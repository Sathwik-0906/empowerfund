const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Make sure this is imported

// ✅ Login route (POST)
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
}));

// ✅ Register route (POST)
router.post('/register', async (req, res) => {
    // ... (This route remains unchanged)
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'User already exists.');
            return res.redirect('/');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
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

// ✅ Forgot Password (POST) - UPDATED TO SEND EMAIL
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot-password');
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // --- START OF EMAIL SENDING CODE ---
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'EmpowerFund - Password Reset Request',
            html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="http://${req.headers.host}/reset-password/${token}">http://${req.headers.host}/reset-password/${token}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        // --- END OF EMAIL SENDING CODE ---

        req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
        res.redirect('/forgot-password');

    } catch (err) {
        console.error("⚠️ Error in forgot password:", err);
        req.flash('error', 'An error occurred while trying to send the email.');
        res.redirect('/forgot-password');
    }
});


// ✅ Reset Password (POST)
router.post('/reset-password/:token', async (req, res) => {
    // ... (This route remains unchanged)
    try {
        const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot-password');
        }

        if (req.body.password !== req.body.confirmPassword) {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success', 'Password has been updated!');
        res.redirect('/');

    } catch (err) {
        console.error("⚠️ Error in reset password:", err);
        req.flash('error', 'An error occurred.');
        res.redirect('/forgot-password');
    }
});


// ✅ Logout route
router.get('/logout', (req, res) => {
    // ... (This route remains unchanged)
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