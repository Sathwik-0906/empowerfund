const express = require('express');
const router = express.Router();
const axios = require('axios');

// ✅ Dashboard Page (No authentication required)
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: { name: 'Guest' } });
});

// ✅ SIP Calculator Page
router.get('/sip', (req, res) => {
    res.render('sip', { user: req.user || { name: 'Guest' } });
});


// ✅ EMI Calculator Page
router.get('/emi', (_req, res) => {
    res.render('emi', { user: { name: 'Guest' } });
});

// ✅ Investment Options Page
router.get('/investments', (req, res) => {
    const investments = [
        { name: 'Public Provident Fund (PPF)', description: 'A long-term savings scheme with tax benefits.', risk: 'Low', returns: '7.1% (approx)' },
        { name: 'Sukanya Samriddhi Yojana', description: 'A savings scheme for the girl child with high interest rates.', risk: 'Low', returns: '8.2% (approx)' },
        { name: 'Equity Mutual Funds', description: 'Invest in stocks for higher returns over the long term.', risk: 'High', returns: '12-15% (approx)' },
        { name: 'Fixed Deposits (FD)', description: 'Safe investment with guaranteed returns.', risk: 'Low', returns: '6-7% (approx)' }
    ];
    res.render('investments', { user: { name: 'Guest' }, investments });
});

// ✅ Stock Market Data Page
router.get('/stocks', (req, res) => {
    res.render('stocks', { user: { name: 'Guest' } });
});

module.exports = router;
