const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
        });
        console.log("✅ MongoDB Connected Successfully!");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};
// hi
module.exports = connectDB;
