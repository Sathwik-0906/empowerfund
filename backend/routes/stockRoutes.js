const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const NodeCache = require('node-cache');

const stockCache = new NodeCache({ stdTTL: 900 }); // Cache for 15 minutes

const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.status(401).json({ error: 'User not authenticated' });
}

// Route to get details for a SINGLE stock, now without the news endpoint
router.get('/data/:symbol', ensureAuthenticated, async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: 'FMP API key is not configured.' });
    }
    const symbol = req.params.symbol.toUpperCase();
    
    const cachedData = stockCache.get(symbol);
    if (cachedData) {
        console.log(`✅ [CACHE] Serving '${symbol}' data from cache.`);
        return res.json(cachedData);
    }

    console.log(`📡 [API] No cache for '${symbol}'. Fetching from FMP API...`);
    try {
        const profilePromise = axios.get(`${BASE_URL}/profile/${symbol}?apikey=${API_KEY}`);
        const historyPromise = axios.get(`${BASE_URL}/historical-price-full/${symbol}?timeseries=180&apikey=${API_KEY}`);
        
        const [profileRes, historyRes] = await Promise.all([profilePromise, historyPromise]);

        const profileData = profileRes.data[0];
        if (!profileData) {
            return res.status(404).json({ error: `No profile data for symbol "${symbol}".` });
        }
        
        const responseData = {
            profile: profileData,
            history: historyRes.data.historical || []
        };

        stockCache.set(symbol, responseData);
        console.log(`💾 [CACHE] Stored new data for '${symbol}' in cache.`);
        
        res.json(responseData);

    } catch (error) {
        console.error("FMP API Error for single stock:", error.message);
        res.status(500).json({ error: `Failed to fetch data for ${symbol}. The symbol may be invalid or the API limit reached.` });
    }
});

// Add/Remove routes
router.post('/watchlist/add', ensureAuthenticated, async (req, res) => {
    const { symbol } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.watchlist.includes(symbol.toUpperCase())) {
            user.watchlist.push(symbol.toUpperCase());
            await user.save();
        }
        res.status(200).json(user.watchlist);
    } catch (error) { res.status(500).json({ error: 'Failed to update watchlist.' }); }
});
router.post('/watchlist/remove', ensureAuthenticated, async (req, res) => {
    const { symbol } = req.body;
    try {
        const user = await User.findById(req.user.id);
        user.watchlist = user.watchlist.filter(s => s !== symbol.toUpperCase());
        await user.save();
        res.status(200).json(user.watchlist);
    } catch (error) { res.status(500).json({ error: 'Failed to update watchlist.' }); }
});

module.exports = router;