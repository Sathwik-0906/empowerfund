const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                console.log(`🔍 Checking user with email: ${email}`);

                const user = await User.findOne({ email });

                if (!user) {
                    console.log("❌ User not found in database");
                    return done(null, false, { message: 'Incorrect email or password' });
                }

                console.log("✅ User found:", user);

                // Debugging: Log password comparison
                console.log(`🔍 Entered Password: ${password}`);
                console.log(`🔍 Stored Hashed Password: ${user.password}`);

                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    console.log("❌ Incorrect password - Hash comparison failed");
                    return done(null, false, { message: 'Incorrect email or password' });
                }

                console.log("✅ Password matched! Logging in...");
                return done(null, user);
            } catch (err) {
                console.error("⚠️ Error in passport authentication:", err);
                return done(err);
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
