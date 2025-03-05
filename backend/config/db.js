const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' }); // Ensure .env loads

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is not defined. Check your .env file.");
        }

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connectDB;
